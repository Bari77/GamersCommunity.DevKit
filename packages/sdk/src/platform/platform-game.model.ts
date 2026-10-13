export interface PlatformGame {
    id: number;
    title: string;
    url: string;
    iconUrl: string;
    playerPublicId: string | null;
    available: boolean;
}
