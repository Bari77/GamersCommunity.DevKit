import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
    GcGalleryItem,
    GcLink,
    LinkListComponent,
    MediaGalleryComponent,
    TwitchEmbedComponent,
} from "@bari77/gc-widgets";
import { ApiTableComponent } from "../../shared/api-table.component";
import { ApiRow } from "../../shared/api-row.model";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { DemoComponent } from "../../shared/demo.component";
import { PageComponent } from "../../shared/page.component";

@Component({
    selector: "gcd-built-in-page",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PageComponent,
        DemoComponent,
        ApiTableComponent,
        CodeBlockComponent,
        LinkListComponent,
        MediaGalleryComponent,
        TwitchEmbedComponent,
    ],
    templateUrl: "./built-in-page.component.html",
    styleUrl: "./built-in-page.component.scss",
})
export class BuiltInPageComponent {
    protected readonly links: GcLink[] = [
        { url: "https://twitch.tv/gamerscommunity", label: "Ma chaîne" },
        { url: "https://github.com/Bari77" },
        { url: "https://youtube.com/@gamerscommunity", label: "Rediffusions" },
        { url: "https://example.com/blog", label: "Mon blog" },
    ];

    protected readonly photos: GcGalleryItem[] = [
        { url: "https://picsum.photos/seed/gc-match/640/360", title: "Fin de partie" },
        { url: "https://picsum.photos/seed/gc-team/640/360", title: "Photo d'équipe" },
        { url: "https://picsum.photos/seed/gc-tournament/640/360", title: "Tournoi" },
    ];

    protected readonly linksHtml = `<gc-link-list [links]="links" emptyLabel="Aucun lien pour l'instant." />`;

    protected readonly galleryHtml = `<gc-media-gallery [items]="photos" kind="photo" emptyLabel="Aucune image." />`;

    protected readonly twitchHtml = `<gc-twitch-embed channel="gamerscommunity" />`;

    protected readonly linkTypeSnippet = `interface GcLink {
    id?: string;
    label?: string | null;
    url: string;
    /** Force le réseau au lieu de le deviner depuis l'URL. */
    icon?: string | null;
}`;

    protected readonly galleryTypeSnippet = `interface GcGalleryItem {
    id?: string;
    url: string;
    title?: string | null;
    thumbnailUrl?: string | null;
}`;

    protected readonly linkInputs: ApiRow[] = [
        {
            name: "links",
            type: "GcLink[]",
            default: "[]",
            description: "Liens à afficher. Ceux sans URL sont ignorés.",
        },
        {
            name: "editing",
            type: "boolean",
            default: "false",
            description: "Remplace la liste par l’éditeur interne (brouillon, puis enregistrer ou annuler).",
        },
        {
            name: "emptyLabel",
            type: "string",
            default: "'No link yet.'",
            description: "Message affiché quand aucun lien exploitable ne subsiste.",
        },
    ];

    protected readonly galleryInputs: ApiRow[] = [
        { name: "items", type: "GcGalleryItem[]", default: "[]", description: "Médias à présenter." },
        {
            name: "editing",
            type: "boolean",
            default: "false",
            description: "Remplace la galerie par l’éditeur interne (brouillon, puis enregistrer ou annuler).",
        },
        {
            name: "kind",
            type: "'photo' | 'video'",
            default: "'photo'",
            description: "En mode video, les URL publiques sont converties en URL de lecteur.",
        },
        {
            name: "emptyLabel",
            type: "string",
            default: "'Nothing here yet.'",
            description: "Message affiché quand la liste est vide.",
        },
    ];

    protected readonly twitchInputs: ApiRow[] = [
        {
            name: "channel",
            type: "string",
            default: "''",
            description: "Nom de chaîne ou URL twitch.tv. Une valeur non reconnue affiche le message de repli.",
        },
        {
            name: "emptyLabel",
            type: "string",
            default: "'Add a Twitch channel to display the player.'",
            description: "Message affiché en absence de chaîne exploitable.",
        },
    ];

    protected readonly helpers: ApiRow[] = [
        {
            name: "twitchChannel(raw)",
            type: "string | null",
            description: "Extrait le nom de chaîne d'une saisie ou d'une URL, ou null si rien de valide.",
        },
        {
            name: "twitchPlayerUrl(channel)",
            type: "string",
            description: "Construit l’URL du lecteur, domaine parent compris.",
        },
        {
            name: "videoEmbedUrl(raw)",
            type: "string | null",
            description:
                "Convertit une page vidéo publique en URL de lecteur, ou null si le service n'est pas reconnu.",
        },
        {
            name: "linkNetwork(url)",
            type: "string",
            description: "Devine la clé de réseau d'une URL, avec repli sur 'link'.",
        },
        { name: "linkLabel(url)", type: "string", description: "Renvoie le nom d'hôte nettoyé de son préfixe www." },
    ];
}
