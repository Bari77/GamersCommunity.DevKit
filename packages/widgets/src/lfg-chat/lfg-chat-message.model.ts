/** Minimal message shape rendered by {@link LfgChatComponent}. */
export interface LfgChatMessage {
    publicId: string;
    body: string;
    creationDate: Date;
    handleLabel: string;
    initial: string;
    isMine: boolean;
    /** Shown when no leading template is projected. */
    avatarUrl?: string | null;
    /** Optional muted meta line under the sender (e.g. region / role). */
    metaParts?: string[];
    /** Router link for the sender handle; omit for a static label. */
    senderLink?: unknown[] | null;
    /** Opaque remote payload for projected leading/meta templates. */
    context?: unknown;
}
