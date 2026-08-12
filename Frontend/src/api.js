// Single place the whole app learns where the API lives.
//
// Override it WITHOUT editing this file by setting VITE_API_URL in Frontend/.env:
//   VITE_API_URL=http://localhost:5000        ← local backend during development
// Leaving it unset falls back to the deployed Render backend, so production
// builds keep working exactly as before.
const BASE_URL = import.meta.env.VITE_API_URL || "https://geinestudio-czl3.onrender.com";

export default BASE_URL;
