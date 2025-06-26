import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeSvg(svgString: string) {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "xmlns:xlink",
      "xmlns",
      "xlink:href",
      "style",
    ],
  });
}