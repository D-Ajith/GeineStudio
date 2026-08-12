import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

/** Shared admin toast — same look across Blog Management and Image Library. */
export default function AdminToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const ok = toast.type === "success";

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-2xl border animate-slideUp max-w-[calc(100vw-2rem)]"
      style={{
        background: ok ? "#f0fdf4" : "#fff1f2",
        borderColor: ok ? "#86efac" : "#fca5a5",
        color: ok ? "#166534" : "#991b1b",
        minWidth: 240,
      }}
    >
      {ok
        ? <CheckCircle size={18} className="shrink-0" style={{ color: "#16a34a" }} />
        : <AlertCircle size={18} className="shrink-0" style={{ color: "#dc2626" }} />}
      <span className="font-semibold text-sm flex-1">{toast.msg}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition shrink-0">
        <X size={15} />
      </button>
    </div>
  );
}
