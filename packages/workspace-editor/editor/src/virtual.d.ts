declare module 'virtual:game-editor-registry' {
    import type { GameWorkspaceRegistry } from '@bari77/gc-workspace-editor';

    /** One lazy loader per workspace target found in the game front. */
    export const gameWorkspaceRegistries: Record<string, () => Promise<GameWorkspaceRegistry>>;
}

declare module 'virtual:game-global-styles';

/** Substituted by the Vite config from what the `gc-workspace edit` command resolved. */
interface ImportMetaEnv {
    readonly GC_API_URL: string;
    readonly GC_START_TARGET: string;
    readonly GC_START_LAYOUT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
