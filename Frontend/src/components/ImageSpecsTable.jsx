import React from "react";
import { Image as ImageIcon } from "lucide-react";

/**
 * The blue "Required Image Specifications" panel.
 * Extracted from the Blog Editor's Featured Image block so the single-file and
 * bulk uploaders show the identical table rather than two copies of it.
 */
export default function ImageSpecsTable({ className = "" }) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl overflow-hidden ${className}`}>
      <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
        <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
          <ImageIcon size={12} /> 📐 Required Image Specifications
        </p>
      </div>
      <div className="px-4 py-3 grid grid-cols-3 gap-3 text-xs">
        {[
          ["Dimensions", "1200 × 675", "pixels"],
          ["Ratio", "16 : 9", "landscape"],
          ["Format", "JPG / WebP", "max 500 KB"],
        ].map(([label, val, sub]) => (
          <div key={label} className="bg-white rounded-lg p-2.5 border border-blue-100 text-center">
            <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className="font-bold text-blue-900 text-sm">{val}</p>
            <p className="text-[10px] text-blue-600">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
