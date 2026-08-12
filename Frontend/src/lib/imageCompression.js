import imageCompression from "browser-image-compression";

import { IMAGE_SPEC } from "./imageSpec";

/**
 * Client-side compression for oversized images.
 *
 * Only files ABOVE the 5 MB limit are touched — anything already within the
 * limit is uploaded byte-for-byte, so no quality is thrown away needlessly.
 *
 * Priority order, highest first:
 *   1. end up under 5 MB
 *   2. keep the original pixel dimensions
 *   3. keep visual quality high
 *   4. only then, shrink the file harder
 *
 * That is why the attempts below start gentle (quality 0.92, resolution locked)
 * and only escalate when a pass still lands over the limit. An 8 MB photo
 * normally clears on the first attempt at roughly 4.7 MB rather than being
 * crushed to 1 MB.
 *
 * Output is WebP: it compresses far better at equal quality, the backend
 * already accepts image/webp, and — unlike JPEG — upload.php stores it
 * untouched rather than re-encoding it a second time.
 */

/** Aim under the hard limit so multipart overhead can never tip it over. */
const ATTEMPTS = [
  { label: "High",    maxSizeMB: 4.7, initialQuality: 0.92, alwaysKeepResolution: true },
  { label: "Good",    maxSizeMB: 4.5, initialQuality: 0.80, alwaysKeepResolution: true },
  { label: "Medium",  maxSizeMB: 4.5, initialQuality: 0.70, alwaysKeepResolution: true },
  // Last resort only: allow the longest edge to come down to 2560px
  { label: "Reduced", maxSizeMB: 4.5, initialQuality: 0.70, maxWidthOrHeight: 2560 },
];

export const COMPRESSION_FAILED =
  "This image could not be compressed below 5MB while maintaining acceptable quality.";

/**
 * Self-hosted copy of the worker script.
 *
 * In web-worker mode the library does importScripts(libURL), and its default
 * libURL is a jsDelivr CDN URL — that would fetch whatever version is current
 * at runtime (not the pinned 2.0.2), add a third-party request to an admin
 * page, and fail outright with no internet. public/browser-image-compression.js
 * is a copy of the installed dist file; refresh it if the package is upgraded.
 */
const LIB_URL = `${import.meta.env.BASE_URL || "/"}browser-image-compression.js`;

/**
 * Runs one compression pass off the main thread, falling back to the main
 * thread if the worker cannot start (blocked script, exotic browser).
 */
async function runPass(file, options) {
  try {
    return await imageCompression(file, { ...options, useWebWorker: true, libURL: LIB_URL });
  } catch {
    return imageCompression(file, { ...options, useWebWorker: false });
  }
}

/** True when a file exceeds the hard upload limit and must be compressed. */
export const needsCompression = (file) => Boolean(file) && file.size > IMAGE_SPEC.maxBytes;

const toWebpName = (name = "image") =>
  `${String(name).replace(/\.[^.]+$/, "") || "image"}.webp`;

/**
 * Compresses `file` until it fits under IMAGE_SPEC.maxBytes.
 *
 * @param {File} file
 * @param {{ onProgress?: (percent:number, qualityLabel:string) => void }} [options]
 * @returns {Promise<{file:File, quality:string, resized:boolean, originalSize:number}>}
 * @throws  {Error} COMPRESSION_FAILED when every attempt still lands over the limit
 */
export async function compressToLimit(file, { onProgress } = {}) {
  const originalSize = file.size;
  let best = null;

  for (const attempt of ATTEMPTS) {
    const { label, ...settings } = attempt;
    let output;

    try {
      output = await runPass(file, {
        ...settings,
        fileType: "image/webp",
        onProgress: (percent) => onProgress?.(percent, label),
      });
    } catch {
      continue; // try the next, harder setting
    }

    if (!best || output.size < best.size) best = output;

    if (output.size <= IMAGE_SPEC.maxBytes) {
      return {
        file: new File([output], toWebpName(file.name), {
          type: output.type || "image/webp",
          lastModified: Date.now(),
        }),
        quality: label,
        resized: Boolean(settings.maxWidthOrHeight),
        originalSize,
      };
    }
  }

  throw new Error(COMPRESSION_FAILED);
}
