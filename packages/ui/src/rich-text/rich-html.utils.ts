import type { Config } from 'dompurify';

const TAG_RE = /<[^>]+>/g;

/** True when the string is empty or only blank rich-text markup (e.g. `<p></p>`). */
export function isRichHtmlBlank(html: string | null | undefined): boolean {
    if (!html?.trim()) {
        return true;
    }
    const text = stripRichHtmlPlainText(html);
    return text.length === 0;
}

/** Plain text for previews, search, and character limits. */
export function stripRichHtmlPlainText(html: string | null | undefined): string {
    if (!html?.trim()) {
        return '';
    }
    return html.replace(TAG_RE, ' ').replace(/\s+/g, ' ').trim();
}

export const RICH_HTML_PURIFY_CONFIG: Config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'span', 'a', 'h2', 'h3'],
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
};
