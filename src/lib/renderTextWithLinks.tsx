import React from "react";

/**
 * Regex pattern to match URLs in text
 * Matches http://, https://, and www. URLs
 */
const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

/**
 * Renders text with URLs converted to clickable links
 * URLs will open in a new tab with proper security attributes
 */
export function renderTextWithLinks(
  text: string,
  className?: string
): React.ReactNode {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex lastIndex since we're using global flag
      URL_REGEX.lastIndex = 0;

      // Add https:// prefix if URL starts with www.
      const href = part.startsWith("www.") ? `https://${part}` : part;

      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={
            className ||
            "text-blue-600 hover:text-blue-800 underline underline-offset-2 break-all"
          }
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
