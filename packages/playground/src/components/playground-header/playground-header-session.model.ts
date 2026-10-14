/** Signed-in identity shown in the playground header (subset of the Platform session). */
export interface PlaygroundHeaderSession {
    publicId: string;
    nickname: string;
    discriminator: string;
    avatarUrl?: string | null;
}
