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
 * Uploads a file immediately and returns the stored image record:
 * { id, filename, url, width, height, file_size, mime_type, created_at }
 */
export async function uploadImage(file, meta = {}) {
  const formData = new FormData();
  formData.append("image", file);
  if (meta.width) formData.append("width", String(meta.width));
  if (meta.height) formData.append("height", String(meta.height));

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/images`, {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
  } catch (err) {
    throw new Error(describeNetworkError(err, "upload the image"));
  }

  const data = await parseJson(res);
  if (!res.ok) throw new Error(describeHttpError(res, data, "upload the image"));
  if (!data?.success || !data?.image) {
    throw new Error(data?.message || IMAGE_MESSAGES.uploadFailed);
  }
  return data.image;
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
