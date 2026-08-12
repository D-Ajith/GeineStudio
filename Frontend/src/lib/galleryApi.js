import BASE_URL from "../api";

/**
 * Dome Gallery API — the DomeGallery component reads from here, the admin
 * manager writes. One flat ordered list, no categories.
 */

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

const request = async (path, options = {}, action = "complete the request") => {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, options);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        `Could not reach the server at ${BASE_URL}. Check that it is running and reachable from this origin.`
      );
    }
    throw new Error(err?.message || `Could not ${action}.`);
  }

  const data = await parseJson(res);
  if (!res.ok) {
    if (data?.message) throw new Error(data.message);
    if (res.status === 404) {
      throw new Error(
        `Gallery API not found at ${BASE_URL}/api/gallery — the backend running there does not expose it yet. Deploy the latest backend/server.js.`
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("Your admin session has expired. Please log in again.");
    }
    throw new Error(`Could not ${action} (HTTP ${res.status}).`);
  }
  return data;
};

/** Public — every dome gallery image, in display order. */
export async function fetchGallery() {
  const data = await request("/api/gallery", {}, "load the gallery");
  return Array.isArray(data?.items) ? data.items : [];
}

/** @param {"append"|"replace"} mode */
export async function bulkSaveGallery({ urls, mode = "append" }) {
  return request(
    "/api/gallery/bulk",
    {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ urls, mode }),
    },
    "update the gallery"
  );
}

export async function updateGalleryImage(id, fields) {
  const data = await request(
    `/api/gallery/${id}`,
    {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    },
    "update the image"
  );
  return data.item;
}

export async function deleteGalleryImage(id) {
  await request(`/api/gallery/${id}`, { method: "DELETE", headers: authHeader() }, "delete the image");
  return true;
}

export async function reorderGallery(ids) {
  await request(
    "/api/gallery/reorder",
    {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
    "save the new order"
  );
  return true;
}
