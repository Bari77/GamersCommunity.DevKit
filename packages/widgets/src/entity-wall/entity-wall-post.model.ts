/** Minimal post shape rendered by {@link EntityWallComponent}. */
export interface EntityWallPost {
    publicId: string;
    body: string;
    creationDate: Date;
    authorPlatformUserPublicId: string | null;
    authorHandleLabel(): string;
    isContactable(): boolean;
    isMine(playerPublicId: string | null | undefined): boolean;
}
