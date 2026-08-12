import { useCallback, useEffect, useState } from "react";

import { fetchImages, renameImage, deleteImage } from "./imageApi";

/**
 * The one place image-library state lives.
 *
 * Both /admin/images and /admin/blogs use this hook, so a rename or delete on
 * either page goes through the same API call and the same local update. The two
 * pages are separate routes (never mounted at the same time) and each loads on
 * mount, so navigating between them — or refreshing — always shows the result of
 * the other page's edits.
 */
export default function useImageLibrary({ autoLoad = true } = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setImages(await fetchImages());
    } catch (err) {
      setError(err?.message || "Could not load the image library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) reload();
  }, [autoLoad, reload]);

  /** Puts a freshly uploaded image at the front without a full refetch. */
  const addImage = useCallback((image) => {
    setImages((prev) => [image, ...prev.filter((i) => i.id !== image.id)]);
  }, []);

  /** Display name only — file_url is never rewritten. */
  const rename = useCallback(async (id, name) => {
    const updated = await renameImage(id, name);
    setImages((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteImage(id);
    setImages((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { images, loading, error, reload, addImage, rename, remove };
}
