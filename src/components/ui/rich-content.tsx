import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { useMemo } from "react";

interface RichContentProps {
  content: string;
  className?: string;
}

// Configure DOMPurify to allow safe HTML tags for rich content
const sanitizeConfig: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "sub",
    "sup",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "div",
    "span",
    "hr",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "src",
    "alt",
    "title",
    "width",
    "height",
    "class",
    "id",
    "style",
    "colspan",
    "rowspan",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"], // Allow target attribute for links
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

/**
 * Component to render HTML content from CKEditor with proper styling
 * This ensures the blog post looks the same as in the editor
 * HTML is sanitized with DOMPurify to prevent XSS attacks
 */
export function RichContent({ content, className }: RichContentProps) {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, sanitizeConfig);
  }, [content]);

  return (
    <>
      <div
        className={cn("rich-content", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      <style>{`
        .rich-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: hsl(var(--foreground));
        }
        
        /* Headings */
        .rich-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: hsl(var(--foreground));
        }
        
        .rich-content h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          color: hsl(var(--foreground));
        }
        
        .rich-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: hsl(var(--foreground));
        }
        
        .rich-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: hsl(var(--foreground));
        }
        
        /* Paragraphs */
        .rich-content p {
          margin-bottom: 1.25rem;
        }
        
        .rich-content p:last-child {
          margin-bottom: 0;
        }
        
        /* Links */
        .rich-content a {
          color: hsl(var(--accent));
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.2s;
        }
        
        .rich-content a:hover {
          opacity: 0.8;
        }
        
        /* Bold, Italic, etc */
        .rich-content strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .rich-content em {
          font-style: italic;
        }
        
        .rich-content u {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .rich-content s {
          text-decoration: line-through;
        }
        
        /* Lists */
        .rich-content ul,
        .rich-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        
        .rich-content ul {
          list-style-type: disc;
        }
        
        .rich-content ol {
          list-style-type: decimal;
        }
        
        .rich-content li {
          margin-bottom: 0.5rem;
          padding-left: 0.25rem;
        }
        
        .rich-content li::marker {
          color: hsl(var(--accent));
        }
        
        .rich-content ul ul,
        .rich-content ol ol,
        .rich-content ul ol,
        .rich-content ol ul {
          margin: 0.5rem 0;
        }
        
        /* Blockquote */
        .rich-content blockquote {
          border-left: 4px solid hsl(var(--accent));
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: hsl(var(--accent) / 0.05);
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .rich-content blockquote p {
          margin-bottom: 0;
        }
        
        /* Code - Inline */
        .rich-content code {
          background: hsl(var(--secondary));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          color: hsl(var(--foreground));
        }
        
        /* Code Block */
        .rich-content pre {
          background: hsl(var(--secondary));
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          border: 1px solid hsl(var(--border));
        }
        
        .rich-content pre code {
          background: transparent;
          padding: 0;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        
        /* Images */
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        /* Standalone images without figure wrapper */
        .rich-content > p > img,
        .rich-content > img {
          display: block;
          margin: 1.5rem auto;
        }
        
        /* Image with float style attribute from CKEditor */
        .rich-content img[style*="float:right"],
        .rich-content img[style*="float: right"] {
          float: right;
          max-width: 50%;
          margin: 0.5rem 0 1.25rem 1.5rem;
        }
        
        .rich-content img[style*="float:left"],
        .rich-content img[style*="float: left"] {
          float: left;
          max-width: 50%;
          margin: 0.5rem 1.5rem 1.25rem 0;
        }
        
        .rich-content figure {
          margin: 1.5rem 0;
          display: table;
        }
        
        .rich-content figure img {
          margin: 0;
          display: block;
        }
        
        .rich-content figcaption {
          display: table-caption;
          caption-side: bottom;
          text-align: center;
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          padding: 0.75rem;
          background: hsl(var(--secondary) / 0.5);
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        /* Image styles from CKEditor - figure.image with class */
        .rich-content figure.image {
          margin: 1.5rem 0;
          display: table;
          clear: both;
        }
        
        /* Resized images */
        .rich-content figure.image_resized {
          display: block;
          box-sizing: border-box;
        }
        
        .rich-content figure.image_resized img {
          width: 100%;
        }
        
        .rich-content figure.image_resized > figcaption {
          display: block;
        }
        
        /* Side image - float right */
        .rich-content figure.image-style-side,
        .rich-content figure.image.image-style-side,
        .rich-content .image-style-side {
          float: right;
          max-width: 50%;
          margin: 0.5rem 0 1.25rem 1.5rem;
        }
        
        /* Align left */
        .rich-content figure.image-style-align-left,
        .rich-content figure.image.image-style-align-left,
        .rich-content .image-style-align-left {
          float: left;
          max-width: 50%;
          margin: 0.5rem 1.5rem 1.25rem 0;
        }
        
        /* Align right - THIS IS THE KEY ONE */
        .rich-content figure.image-style-align-right,
        .rich-content figure.image.image-style-align-right,
        .rich-content .image-style-align-right {
          float: right;
          max-width: 50%;
          margin: 0.5rem 0 1.25rem 1.5rem;
        }
        
        /* Align center */
        .rich-content figure.image-style-align-center,
        .rich-content figure.image.image-style-align-center,
        .rich-content .image-style-align-center {
          margin-left: auto;
          margin-right: auto;
          float: none;
        }
        
        /* Block image (full width) */
        .rich-content figure.image-style-block-align-left {
          float: none;
          text-align: left;
        }
        
        .rich-content figure.image-style-block-align-right {
          float: none;
          text-align: right;
        }
        
        .rich-content .image.image_resized {
          display: block;
        }
        
        .rich-content .image.image_resized img {
          width: 100%;
        }
        
        /* Tables */
        .rich-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 1rem;
        }
        
        .rich-content th,
        .rich-content td {
          border: 1px solid hsl(var(--border));
          padding: 0.75rem 1rem;
          text-align: left;
        }
        
        .rich-content th {
          background: hsl(var(--secondary));
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .rich-content tr:nth-child(even) td {
          background: hsl(var(--secondary) / 0.3);
        }
        
        /* Horizontal Rule */
        .rich-content hr {
          border: none;
          height: 1px;
          background: hsl(var(--border));
          margin: 2rem 0;
        }
        
        /* Text alignment from CKEditor */
        .rich-content .text-tiny {
          font-size: 0.75rem;
        }
        
        .rich-content .text-small {
          font-size: 0.875rem;
        }
        
        .rich-content .text-big {
          font-size: 1.25rem;
        }
        
        .rich-content .text-huge {
          font-size: 1.5rem;
        }
        
        /* Alignment */
        .rich-content [style*="text-align: center"],
        .rich-content [style*="text-align:center"] {
          text-align: center;
        }
        
        .rich-content [style*="text-align: right"],
        .rich-content [style*="text-align:right"] {
          text-align: right;
        }
        
        .rich-content [style*="text-align: justify"],
        .rich-content [style*="text-align:justify"] {
          text-align: justify;
        }
        
        /* Highlight/Mark */
        .rich-content mark {
          background: hsl(60 100% 50% / 0.4);
          padding: 0.1rem 0.2rem;
          border-radius: 0.125rem;
        }
        
        /* Media embeds */
        .rich-content .media {
          margin: 1.5rem 0;
        }
        
        .rich-content .media iframe {
          max-width: 100%;
          border-radius: 0.75rem;
        }
        
        .rich-content oembed[url] {
          display: block;
          margin: 1.5rem 0;
        }
        
        /* Raw HTML embed */
        .rich-content .raw-html-embed {
          margin: 1.5rem 0;
        }
        
        /* Clear floats */
        .rich-content::after {
          content: "";
          display: table;
          clear: both;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .rich-content {
            font-size: 1rem;
          }
          
          .rich-content h1 {
            font-size: 1.875rem;
          }
          
          .rich-content h2 {
            font-size: 1.5rem;
          }
          
          .rich-content h3 {
            font-size: 1.25rem;
          }
          
          /* Reset all floats on mobile */
          .rich-content figure.image-style-side,
          .rich-content figure.image.image-style-side,
          .rich-content .image-style-side,
          .rich-content figure.image-style-align-left,
          .rich-content figure.image.image-style-align-left,
          .rich-content .image-style-align-left,
          .rich-content figure.image-style-align-right,
          .rich-content figure.image.image-style-align-right,
          .rich-content .image-style-align-right,
          .rich-content figure.image_resized {
            float: none !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 1.5rem 0 !important;
          }
          
          .rich-content img[style*="float:right"],
          .rich-content img[style*="float: right"],
          .rich-content img[style*="float:left"],
          .rich-content img[style*="float: left"] {
            float: none !important;
            max-width: 100% !important;
            margin: 1.5rem 0 !important;
          }
          
          .rich-content pre {
            padding: 1rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </>
  );
}
