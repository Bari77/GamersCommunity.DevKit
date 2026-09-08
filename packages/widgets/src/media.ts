/** Shape shared by the gallery widgets, whatever backend feeds them. */
export interface GcGalleryItem {
    id?: string;
    url: string;
    title?: string | null;
    thumbnailUrl?: string | null;
}

export function embedHostname(): string {
    return typeof location === 'undefined' ? 'localhost' : location.hostname;
}

/** Accepts a channel name or any twitch.tv URL and returns the bare channel. */
export function twitchChannel(raw: string): string | null {
    const value = raw.trim();
    if (!value) {
        return null;
    }

    const fromUrl = /twitch\.tv\/([A-Za-z0-9_]{2,25})/i.exec(value);
    const candidate = fromUrl ? fromUrl[1] : value;
    return /^[A-Za-z0-9_]{2,25}$/.test(candidate) ? candidate : null;
}

export function twitchPlayerUrl(channel: string): string {
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${embedHostname()}&muted=true`;
}

/**
 * Turns a public video page URL into its player URL. Returns `null` for anything
 * unrecognised so callers can fall back to a plain `<video>` element.
 */
export function videoEmbedUrl(raw: string): string | null {
    const value = raw.trim();
    if (!value) {
        return null;
    }

    const youtube = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(value);
    if (youtube) {
        return `https://www.youtube.com/embed/${youtube[1]}`;
    }

    const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(value);
    if (vimeo) {
        return `https://player.vimeo.com/video/${vimeo[1]}`;
    }

    const twitchVod = /twitch\.tv\/videos\/(\d+)/.exec(value);
    if (twitchVod) {
        return `https://player.twitch.tv/?video=${twitchVod[1]}&parent=${embedHostname()}`;
    }

    const twitchClip = /(?:clips\.twitch\.tv\/|twitch\.tv\/\w+\/clip\/)([A-Za-z0-9_-]+)/.exec(value);
    if (twitchClip) {
        return `https://clips.twitch.tv/embed?clip=${twitchClip[1]}&parent=${embedHostname()}`;
    }

    const dailymotion = /dailymotion\.com\/video\/([A-Za-z0-9]+)/.exec(value);
    if (dailymotion) {
        return `https://www.dailymotion.com/embed/video/${dailymotion[1]}`;
    }

    return null;
}

/** Best-effort social network key, used to pick an icon or a colour. */
export function linkNetwork(url: string): string {
    const host = safeHostname(url);
    if (!host) {
        return 'link';
    }

    const known = ['youtube', 'twitch', 'twitter', 'instagram', 'tiktok', 'discord', 'bluesky', 'github', 'reddit'];
    return known.find((name) => host.includes(name)) ?? (host.includes('x.com') ? 'twitter' : 'link');
}

export function linkLabel(url: string): string {
    return safeHostname(url) ?? url;
}

function safeHostname(url: string): string | null {
    try {
        return new URL(url.includes('://') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}
