import BASE_URL from "../api";

/**
 * Portfolio API — the public page reads from here, the admin manager writes.
 * Categories mirror the filter bar on the Portfolio page; "all" is a view, not
 * a stored category.
 */

export const PORTFOLIO_CATEGORIES = [
  { id: "corporate", name: "Corporate" },
  { id: "events", name: "Event" },
  { id: "product", name: "Product" },
  { id: "podcast", name: "Podcast" },
  { id: "professional", name: "Professional" },
  { id: "business", name: "Business Portfolio" },
];

export const categoryName = (id) =>
  PORTFOLIO_CATEGORIES.find((c) => c.id === id)?.name || id;

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
        `Portfolio API not found at ${BASE_URL}/api/portfolio — the backend running there does not expose it yet. Deploy the latest backend/server.js.`
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("Your admin session has expired. Please log in again.");
    }
    throw new Error(`Could not ${action} (HTTP ${res.status}).`);
  }
  return data;
};

/** Public — every portfolio image, or just one category. */
export async function fetchPortfolio(category) {
  const qs = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  const data = await request(`/api/portfolio${qs}`, {}, "load the portfolio");
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Bulk add or replace a category.
 * @param {"append"|"replace"} mode
 */
export async function bulkSavePortfolio({ category, urls, mode = "append", title, description }) {
  return request(
    "/api/portfolio/bulk",
    {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ category, urls, mode, title, description }),
    },
    "update the portfolio"
  );
}

export async function updatePortfolioImage(id, fields) {
  const data = await request(
    `/api/portfolio/${id}`,
    {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    },
    "update the image"
  );
  return data.item;
}

export async function deletePortfolioImage(id) {
  await request(
    `/api/portfolio/${id}`,
    { method: "DELETE", headers: authHeader() },
    "delete the image"
  );
  return true;
}

/** Persists the given id order as sort_order 0..n */
export async function reorderPortfolio(ids) {
  await request(
    "/api/portfolio/reorder",
    {
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
    "save the new order"
  );
  return true;
}
