import { PlayerMediaDto } from "./player-media.dto";
import { PlayerMediaGalleryItem } from "./player-media-gallery-item.model";

export class PlayerMedia {
    public readonly publicId: string;
    public readonly playerPublicId: string;
    public readonly url: string;
    public readonly caption: string | null;
    public readonly share: boolean;
    public readonly creationDate: Date;

    public constructor(dto: PlayerMediaDto) {
        this.publicId = dto.publicId;
        this.playerPublicId = dto.playerPublicId;
        this.url = dto.url;
        this.caption = dto.caption;
        this.share = dto.share;
        this.creationDate = new Date(dto.creationDate);
    }

    public get galleryItem(): PlayerMediaGalleryItem {
        return { id: this.publicId, url: this.url, title: this.caption };
    }

    public static fromDto(dto: PlayerMediaDto): PlayerMedia {
        return new PlayerMedia(dto);
    }
}
