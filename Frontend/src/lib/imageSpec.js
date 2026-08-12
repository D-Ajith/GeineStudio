/**
 * Single source of truth for featured / library image rules.
 *
 * These are the exact requirements already advertised by the "Featured Image"
 * uploader in the Blog Editor, and they are enforced by the backend too
 * (multer: 5 MB limit + image/jpeg|png|webp fileFilter).
 *
 * Both the Blog Editor and /admin/images import from here, so the rules can
 * never drift apart between the two screens.
 */

export const IMAGE_SPEC = {
  width: 1200,
  height: 675,
  ratio: 16 / 9,
  /** ±2% tolerance so 1920×1080, 1280×720 … still count as clean 16:9 */
  ratioTolerance: 0.02,
  /** Hard limit — matches multer `limits.fileSize` on the backend */
  maxBytes: 5 * 1024 * 1024,
  /** Soft limit — the "max 500 KB" recommendation shown in the specs table */
  recommendedBytes: 500 * 1024,
  /** Hard list — matches the multer `fileFilter` on the backend */
  acceptedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  acceptAttr: "image/jpeg,image/jpg,image/png,image/webp",

  /**
   * When false (current behaviour) a non-1200×675 / non-16:9 image is reported
   * as a WARNING and still uploads — this preserves exactly how the Blog Editor
   * has always worked. Flip to true to make dimensions a hard requirement in
   * BOTH the Blog Editor and the Image Library at once.
   */
  strictDimensions: false,
};

export const IMAGE_MESSAGES = {
  invalidFormat: "Please upload a JPG, JPEG, PNG, or WebP image.",
  tooLarge: "Image size must be less than 5 MB.",
  wrongDimensions: "Image must be 1200 × 675 pixels.",
  wrongRatio: "Image must use a 16:9 landscape ratio.",
  uploadFailed: "Image upload failed. Please try again.",
  unreadable: "That file could not be read as an image. Please choose another file.",
};

/** Human readable file size — "482 KB" / "1.4 MB" */
export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Reads natural width/height of a File without uploading it. */
export const readImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    img.src = url;
  });

/**
 * Validates a picked file against IMAGE_SPEC.
 *
 * @returns {Promise<{ok:boolean, error:string|null, warnings:string[], width:number|null, height:number|null}>}
 */
export async function validateImageFile(file) {
  const result = { ok: false, error: null, warnings: [], width: null, height: null };

  if (!file) {
    result.error = IMAGE_MESSAGES.invalidFormat;
    return result;
  }

  const type = String(file.type || "").toLowerCase();
  if (!IMAGE_SPEC.acceptedTypes.includes(type)) {
    result.error = IMAGE_MESSAGES.invalidFormat;
    return result;
  }

  if (file.size > IMAGE_SPEC.maxBytes) {
    result.error = IMAGE_MESSAGES.tooLarge;
    return result;
  }

  let dims;
  try {
    dims = await readImageDimensions(file);
  } catch {
    result.error = IMAGE_MESSAGES.unreadable;
    return result;
  }

  result.width = dims.width;
  result.height = dims.height;

  const isLandscape = dims.width > dims.height;
  const ratioOk =
    isLandscape &&
    Math.abs(dims.width / dims.height - IMAGE_SPEC.ratio) <= IMAGE_SPEC.ratioTolerance;
  const exactOk = dims.width === IMAGE_SPEC.width && dims.height === IMAGE_SPEC.height;

  if (!ratioOk) {
    if (IMAGE_SPEC.strictDimensions) {
      result.error = IMAGE_MESSAGES.wrongRatio;
      return result;
    }
    result.warnings.push(IMAGE_MESSAGES.wrongRatio);
  } else if (!exactOk) {
    if (IMAGE_SPEC.strictDimensions) {
      result.error = IMAGE_MESSAGES.wrongDimensions;
      return result;
    }
    result.warnings.push(IMAGE_MESSAGES.wrongDimensions);
  }

  if (file.size > IMAGE_SPEC.recommendedBytes) {
    result.warnings.push(
      `Recommended file size is under 500 KB — this one is ${formatBytes(file.size)}.`
    );
  }

  result.ok = true;
  return result;
}
