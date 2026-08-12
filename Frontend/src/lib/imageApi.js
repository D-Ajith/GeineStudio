/**
 * The ONE image API service used by every screen.
 *
 * All of these talk to the same backend upload pipeline that the Blog Editor's
 * Featured Image has always used:
 *
 *   file → POST /api/images → multer temp file → https://geniestudio.in/upload.php
 *        → public_html/uploads/<filename> → HTTPS url → `images` table row
 */

import BASE_URL from "../api";
import { IMAGE_MESSAGES } from "./imageSpec";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token } : {};
};

const parseJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Turns an HTTP failure into a message that names the actual cause, so a
 * misconfigured endpoint never surfaces as a vague "upload failed".
 */
const describeHttpError = (res, data, action) => {
  if (data?.message) return data.message;

  switch (res.status) {
    case 400:
      return `The server rejected the image. Please check the file and try again.`;
    case 401:
    case 403:
      return "Your admin session has expired. Please log in again.";
    case 404:
      return `Image API not found at ${BASE_URL}/api/images — the backend running there does not expose this route yet. Deploy the latest backend/server.js, or point VITE_API_URL at a backend that has it.`;
    case 413:
      return "Image size must be less than 5 MB.";
    case 500:
    case 502:
    case 503:
      return `The server could not ${action}. Please try again in a moment.`;
    default:
      return `Could not ${action} (HTTP ${res.status}).`;
  }
};

/**
 * fetch() rejects — rather than returning a response — when the request never
 * completes: no network, server unreachable, or the browser blocking it for CORS.
 */
const describeNetworkError = (err, action) => {
  if (err instanceof TypeError) {
    return `Could not reach the server at ${BASE_URL}. Check that it is running and that it allows requests from this origin (CORS).`;
  }
  return err?.message || `Could not ${action}.`;
};

/**
 * Uploads a file and returns the stored image record:
 * { id, filename, url, width, height, file_size, mime_type, created_at }
 *
 * THE upload call — single-file and bulk both go through here, so there is one
 * endpoint, one payload shape and one set of error messages.
 *
 * Uses XMLHttpRequest rather than fetch purely because fetch cannot report
 * upload progress; `onProgress` receives 0–100 as the bytes go out. Pass an
 * AbortSignal to cancel an in-flight upload.
 */
export function uploadImage(file, meta = {}, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Upload cancelled."));
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    if (meta.width) formData.append("width", String(meta.width));
    if (meta.height) formData.append("height", String(meta.height));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/images`);

    const { Authorization } = authHeader();
    if (Authorization) xhr.setRequestHeader("Authorization", Authorization);

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      cleanup();
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(describeHttpError({ status: xhr.status }, data, "upload the image")));
        return;
      }
      if (!data?.success || !data?.image) {
        reject(new Error(data?.message || IMAGE_MESSAGES.uploadFailed));
        return;
      }
      onProgress?.(100);
      resolve(data.image);
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error(
        `Could not reach the server at ${BASE_URL}. Check that it is running and that it allows requests from this origin (CORS).`
      ));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error("The upload timed out. Please try again."));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new Error("Upload cancelled."));
    };

    xhr.send(formData);
  });
}

/** Lists every image in the library, newest first. */
export async function fetchImages() {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/images`, { headers: authHeader() });
  } catch (err) {
    throw new Error(describeNetworkError(err, "load the image library"));
  }

  const data = await parseJson(res);
  if (!res.ok) throw new Error(describeHttpError(res, data, "load the image library"));
  if (!Array.isArray(data?.images)) {
    throw new Error(data?.message || "Could not load the image library.");
  }
  return data.images;
}

/**
 * Renames the DISPLAY name only — the Hostinger file and its HTTPS URL are
 * untouched, so every blog already using the image keeps working.
 */
export async function renameImage(id, originalName) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/images/${id}`, {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ original_name: originalName }),
    });
  } catch (err) {
    throw new Error(describeNetworkError(err, "rename the image"));
  }

  const data = await parseJson(res);
  if (!res.ok) throw new Error(describeHttpError(res, data, "rename the image"));
  if (!data?.success || !data?.image) {
    throw new Error(data?.message || "Could not rename the image.");
  }
  return data.image;
}

/** Removes an image from the library listing. */
export async function deleteImage(id) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/images/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
  } catch (err) {
    throw new Error(describeNetworkError(err, "delete the image"));
  }

  const data = await parseJson(res);
  if (!res.ok) throw new Error(describeHttpError(res, data, "delete the image"));
  if (!data?.success) throw new Error(data?.message || "Could not delete the image.");
  return true;
}

/** Clipboard helper with a fallback for browsers that block the async API. */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}
