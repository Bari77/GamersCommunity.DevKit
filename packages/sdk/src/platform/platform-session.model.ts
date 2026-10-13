export interface PlatformSession {
    id: number;
    publicId: string;
    nickname: string;
    discriminator: string;
    avatarUrl: string;
    activeMute: { reason: string; endDate: string } | null;
}
