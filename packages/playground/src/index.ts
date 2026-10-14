export const PLAYGROUND_TITLE = "GamersCommunity Playground";

export const PLAYGROUND_BANNER = "Playground · MSW mocks";

export function shouldUseMocks(env: { useMocks?: boolean }): boolean {
    return env.useMocks === true;
}

export async function bootstrapMocks(enabled: boolean, startWorker: () => Promise<unknown>): Promise<void> {
    if (!enabled) return;
    await startWorker();
    // MSW calls location.reload() when a worker is registered but does not control this
    // document, then still resolves start(). Requests fired in that window reach the gateway
    // (401 on private actions such as ListMine) even though the console also shows mocked 200s
    // from the reload. Never bootstrap until this document is actually controlled.
    if (!(await serviceWorkerControlsPage())) {
        await new Promise(() => undefined);
    }
}

async function serviceWorkerControlsPage(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
        return true;
    }
    if (navigator.serviceWorker.controller) {
        return true;
    }
    return new Promise((resolve) => {
        const timer = window.setTimeout(() => resolve(!!navigator.serviceWorker.controller), 1500);
        navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
                window.clearTimeout(timer);
                resolve(true);
            },
            { once: true },
        );
    });
}

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
    return (
        personas.find((persona) => persona.id === activeId) ??
        personas.find((persona) => persona.id === fallbackId) ??
        personas[0]
    );
}
