"use client";

import { analytics } from "@/lib/analytics/gtm";

/**
 * Preview linki — Link içinde nested <a> vermemek için span+onClick.
 * Server component'ten çağrılan client wrapper.
 */
export default function PreviewLinkButton({
  url,
  ebookSlug,
  ebookName,
}: {
  url: string;
  ebookSlug?: string;
  ebookName?: string;
}) {
  const handleClick = () => {
    if (ebookSlug) {
      analytics.ebookPreviewClick({
        ebook_slug: ebookSlug,
        ebook_name: ebookName ?? ebookSlug,
      });
    }
    window.open(url, "_blank", "noreferrer");
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }
      }}
      className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-[#0ea5e9] hover:underline transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:ring-offset-2 rounded"
    >
      📖 Ücretsiz önizle (5 sayfa)
    </span>
  );
}
