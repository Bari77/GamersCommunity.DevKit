/** Minimal persona identity shared by MSW mocks, playground session, and workspace previews. */
export interface PlaygroundPersona {
    /** Stable key used for session assignment (usually the nickname). */
    id: string;
    platformUserPublicId: string;
    playerPublicId: string;
    nickname: string;
    discriminator: string;
}

const AVATAR_MIN_ID = 1;
const AVATAR_MAX_ID = 12;

/** Same catalog as Platform: `…/Avatars/{1-12}.png`, stable per seed so faces do not flicker. */
export function mockPortraitUrl(assetsBaseUrl: string, seed: string): string {
    const base = assetsBaseUrl.replace(/\/+$/, "");
    return `${base}/Avatars/${stableAvatarId(seed)}.png`;
}

function stableAvatarId(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
    }
    const span = AVATAR_MAX_ID - AVATAR_MIN_ID + 1;
    return AVATAR_MIN_ID + (Math.abs(hash) % span);
}

export function personaSessionStorageKey(gameKey: string): string {
    return `gc.playground.activePersona.${gameKey}`;
}

export function getActivePersonaId(gameKey: string): string | null {
    if (typeof localStorage === "undefined") {
        return null;
    }
    try {
        const value = localStorage.getItem(personaSessionStorageKey(gameKey));
        return value && value.trim() ? value.trim() : null;
    } catch {
        return null;
    }
}

export function setActivePersonaId(gameKey: string, personaId: string): void {
    if (typeof localStorage === "undefined") {
        return;
    }
    localStorage.setItem(personaSessionStorageKey(gameKey), personaId);
}

export function resolveActivePersona<T extends PlaygroundPersona>(
    gameKey: string,
    personas: readonly T[],
    fallbackId: string,
): T {
    const activeId = getActivePersonaId(gameKey) ?? fallbackId;
    return personas.find((persona) => persona.id === activeId) ?? personas.find((persona) => persona.id === fallbackId) ?? personas[0];
}
