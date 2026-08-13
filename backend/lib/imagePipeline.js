/**
 * Derivative generation for Hostinger-hosted images.
 *
 * WHY THIS EXISTS
 * ---------------
 * Hostinger's CDN (Server: hcdn) negotiates JPEG→WebP from the Accept header,
 * but it does NOT resize: `?w=480`, `?width=480` and /cdn-cgi/image/ are all
 * ignored (verified — same Content-Length every time). It also never serves
 * AVIF. So the only way to get a real responsive `srcSet` is to generate the
 * smaller files ourselves and upload them alongside the original.
 *
 * That matters here because the originals are camera exports — 7008 × 4672,
 * ~4.6 MB — rendered into 300px-wide cards. Roughly 100× more pixels than any
 * viewport ever uses.
 *
 * WHAT IT PRODUCES
 * ----------------
 * For one original, at every width that does not upscale it:
 *
 *   <base>-400.webp  <base>-400.avif
 *   <base>-800.webp  <base>-800.avif   … up to 2000
 *
 * plus a ~300-byte base64 LQIP used as the blur-up placeholder.
 *
 * AVIF is emitted as a real file rather than relying on Accept negotiation,
 * because the browser picks it via <source type="image/avif"> in <picture> —
 * that works regardless of what the CDN is willing to negotiate.
 */

const sharp = require("sharp");
const axios = require("axios");
const FormData = require("form-data");

/** Ladder chosen to cover 1× phones through 2× desktop without gaps. */
const VARIANT_WIDTHS = [400, 800, 1200, 1600, 2000];

/**
 * Quality is deliberately on the high side — the brief is "keep image quality
 * high", and for a photography studio the images are the product. AVIF q58 is
 * visually equivalent to WebP q82 while landing ~30% smaller.
 */
const WEBP_QUALITY = 82;
const AVIF_QUALITY = 58;

/** Placeholder is 24px wide; it is stretched and blurred by CSS, never seen sharp. */
const LQIP_WIDTH = 24;

const HOSTINGER_UPLOAD_URL = "https://geniestudio.in/upload.php";

/**
 * sharp defaults to bailing out on any malformed chunk. These originals come
 * from cameras and phones, some with truncated EXIF, so decode as much as the
 * file allows instead of throwing.
 */
const READ_OPTIONS = { failOn: "none", limitInputPixels: 500_000_000 };

/**
 * Pushes a buffer to Hostinger and returns its public HTTPS URL.
 *
 * upload.php names the stored file `<unixtime>_<the name we send>`, so the
 * final URL cannot be predicted — every caller has to keep what comes back.
 * That is why variants are recorded in a manifest rather than derived from the
 * original URL by string substitution.
 */
async function uploadBufferToHostinger(buffer, filename) {
  const formData = new FormData();
  formData.append("file", buffer, { filename });

  const response = await axios.post(HOSTINGER_UPLOAD_URL, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 120000,
  });

  const url = response.data?.url;
  if (!url) {
    throw new Error(
      `upload.php returned no URL for ${filename}: ${JSON.stringify(response.data).slice(0, 200)}`
    );
  }
  return url;
}

/** `1786519468_1786519468526-962658427.jpg` → `1786519468_1786519468526-962658427` */
function baseNameOf(filenameOrUrl) {
  const file = String(filenameOrUrl).split("/").pop().split("?")[0];
  return file.replace(/\.[^.]+$/, "");
}

/**
 * Tiny blurred stand-in, inlined into the page as a data URI so it costs no
 * request. Rendered behind the real image and cross-faded out on load, which
 * is what removes the grey-box flash without touching the layout.
 */
async function makeLqip(pipeline) {
  const buf = await pipeline
    .clone()
    .resize(LQIP_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: 45 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

/**
 * Generates and uploads every derivative for one image.
 *
 * @param {Buffer} input      the original file
 * @param {string} nameSeed   filename or URL the variant names are derived from
 * @param {object} [options]
 * @param {(msg: string) => void} [options.log]
 * @returns {Promise<{width:number, height:number, lqip:string,
 *                    variants:{webp:Object<number,string>, avif:Object<number,string>}}>}
 */
async function generateAndUploadVariants(input, nameSeed, { log } = {}) {
  const base = baseNameOf(nameSeed);

  // .rotate() with no argument applies the EXIF orientation and then strips it.
  // Without this, portrait phone shots come out sideways once EXIF is dropped
  // during re-encoding.
  const pipeline = sharp(input, READ_OPTIONS).rotate();
  const meta = await pipeline.metadata();

  // After .rotate() the logical dimensions may be swapped relative to metadata,
  // so read them off a materialised buffer rather than trusting width/height.
  const oriented = await pipeline.clone().toBuffer({ resolveWithObject: true });
  const width = oriented.info.width;
  const height = oriented.info.height;

  const lqip = await makeLqip(pipeline);

  // Never upscale: a 900px original gets 400 and 800 only. Always keep at least
  // the smallest rung so even tiny sources still get a modern-format variant.
  const targets = VARIANT_WIDTHS.filter((w) => w <= width);
  if (targets.length === 0) targets.push(Math.min(VARIANT_WIDTHS[0], width));

  const variants = { webp: {}, avif: {} };

  for (const w of targets) {
    const resized = pipeline
      .clone()
      .resize(w, null, { withoutEnlargement: true, fit: "inside" });

    const [webpBuf, avifBuf] = await Promise.all([
      resized.clone().webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer(),
      resized.clone().avif({ quality: AVIF_QUALITY, effort: 4 }).toBuffer(),
    ]);

    const [webpUrl, avifUrl] = await Promise.all([
      uploadBufferToHostinger(webpBuf, `${base}-${w}.webp`),
      uploadBufferToHostinger(avifBuf, `${base}-${w}.avif`),
    ]);

    variants.webp[w] = webpUrl;
    variants.avif[w] = avifUrl;

    log?.(
      `    ${w}w  webp ${(webpBuf.length / 1024).toFixed(0)} KB  avif ${(avifBuf.length / 1024).toFixed(0)} KB`
    );
  }

  return { width, height, lqip, variants, format: meta.format };
}

module.exports = {
  VARIANT_WIDTHS,
  generateAndUploadVariants,
  uploadBufferToHostinger,
  baseNameOf,
};
