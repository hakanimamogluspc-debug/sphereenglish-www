"use client";

/**
 * Preview linki — Link içinde nested <a> vermemek için span+onClick.
 * Server component'ten çağrılan client wrapper.
 */
export default function PreviewLinkButton({ url }: { url: string }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, "_blank", "noreferrer");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, "_blank", "noreferrer");
        }
      }}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-[#0ea5e9] hover:underline transition-colors cursor-pointer"
    >
      📖 Ücretsiz önizle (5 sayfa)
    </span>
  );
}
