import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GcGalleryItem, GcLink, LinkListComponent, MediaGalleryComponent, TwitchEmbedComponent } from '@bari77/gc-widgets';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DemoComponent } from '../../shared/demo.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-built-in-page',
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
    template: `
        <gcd-page
            eyebrow="&#64;bari77/gc-widgets"
            heading="Widgets fournis"
            lead="Trois contenus prêts à brancher dans un gabarit gcWidget, utilisables aussi bien en dehors du tableau de bord."
            [importSnippet]="importSnippet"
        >
            <p>
                Ce sont des composants indépendants : ils ne connaissent ni le workspace ni le catalogue, et se
                contentent de leurs entrées. Rien n'empêche de les utiliser sur une page ordinaire.
            </p>

            <h2>gc-link-list</h2>

            <p>
                Affiche une liste de liens en devinant le réseau à partir de l'URL, ce qui lui donne son icône et sa
                couleur. Les entrées sans adresse sont ignorées, et un libellé absent est remplacé par le nom
                d'hôte.
            </p>

            <gcd-demo title="Liste de liens" [html]="linksHtml" [bare]="true">
                <gc-link-list [links]="links" emptyLabel="Aucun lien pour l'instant." />
            </gcd-demo>

            <gcd-api heading="Entrées" [rows]="linkInputs" />

            <gcd-code language="typescript" label="Type GcLink" [code]="linkTypeSnippet" />

            <h2>gc-media-gallery</h2>

            <p>
                Présente une grille de photos ou de vidéos. En mode <code>video</code>, l'URL publique est convertie
                en URL de lecteur pour YouTube, Vimeo, Dailymotion, ainsi que les VOD et les clips Twitch ; une
                adresse non reconnue retombe sur une lecture directe.
            </p>

            <gcd-demo title="Galerie de photos" [html]="galleryHtml" [bare]="true">
                <gc-media-gallery [items]="photos" kind="photo" emptyLabel="Aucune image." />
            </gcd-demo>

            <gcd-api heading="Entrées" [rows]="galleryInputs" />

            <gcd-code language="typescript" label="Type GcGalleryItem" [code]="galleryTypeSnippet" />

            <div class="gcd-note">
                <p>
                    La visionneuse plein écran est déplacée dans <code>&lt;body&gt;</code> à l'ouverture. C'est
                    volontaire : une tuile de grille est positionnée par <code>transform</code>, ce qui ancrerait
                    autrement une surimpression <code>fixed</code> sur le widget au lieu de la fenêtre.
                </p>
            </div>

            <h2>gc-twitch-embed</h2>

            <p>
                Intègre le lecteur d'une chaîne. L'entrée accepte aussi bien un nom de chaîne qu'une URL
                <code>twitch.tv</code> complète ; une valeur non reconnue affiche le message de repli plutôt qu'un
                cadre vide.
            </p>

            <gcd-demo title="Lecteur Twitch" description="Le lecteur exige que le domaine parent soit autorisé côté Twitch." [html]="twitchHtml" [bare]="true">
                <div class="gcd-twitch">
                    <gc-twitch-embed channel="gamerscommunity" emptyLabel="Ajoutez une chaîne pour afficher le lecteur." />
                </div>
            </gcd-demo>

            <gcd-api heading="Entrées" [rows]="twitchInputs" />

            <div class="gcd-note">
                <p>
                    L'URL du lecteur transporte le domaine courant en paramètre <code>parent</code>, comme Twitch
                    l'exige. En local, cela vaut <code>localhost</code> ; en production, le domaine servant
                    l'application doit être déclaré dans la console Twitch.
                </p>
            </div>

            <h2>Aides d'URL</h2>

            <p>
                Les fonctions utilisées par ces widgets sont exportées : elles servent à préparer une donnée avant
                de l'enregistrer, ou à valider une saisie.
            </p>

            <gcd-api [rows]="helpers" [showDefault]="false" />
        </gcd-page>
    `,
    styles: [
        `
            .gcd-twitch {
                width: 100%;
                min-height: 16rem;
            }
        `,
    ],
})
export class BuiltInPageComponent {
    protected readonly links: GcLink[] = [
        { url: 'https://twitch.tv/gamerscommunity', label: 'Ma chaîne' },
        { url: 'https://github.com/Bari77' },
        { url: 'https://youtube.com/@gamerscommunity', label: 'Rediffusions' },
        { url: 'https://example.com/blog', label: 'Mon blog' },
    ];

    protected readonly photos: GcGalleryItem[] = [
        { url: 'https://picsum.photos/seed/gc-raid/640/360', title: 'Fin de raid' },
        { url: 'https://picsum.photos/seed/gc-guild/640/360', title: 'Photo de guilde' },
        { url: 'https://picsum.photos/seed/gc-arena/640/360', title: 'Arène' },
    ];

    protected readonly importSnippet = `import {
    LinkListComponent,
    MediaGalleryComponent,
    TwitchEmbedComponent,
} from '@bari77/gc-widgets';

import type { GcGalleryItem, GcLink } from '@bari77/gc-widgets';`;

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
        { name: 'links', type: 'GcLink[]', default: '[]', description: 'Liens à afficher. Ceux sans URL sont ignorés.' },
        {
            name: 'emptyLabel',
            type: 'string',
            default: "'No link yet.'",
            description: 'Message affiché quand aucun lien exploitable ne subsiste.',
        },
    ];

    protected readonly galleryInputs: ApiRow[] = [
        { name: 'items', type: 'GcGalleryItem[]', default: '[]', description: 'Médias à présenter.' },
        {
            name: 'kind',
            type: "'photo' | 'video'",
            default: "'photo'",
            description: "En mode video, les URL publiques sont converties en URL de lecteur.",
        },
        {
            name: 'emptyLabel',
            type: 'string',
            default: "'Nothing here yet.'",
            description: 'Message affiché quand la liste est vide.',
        },
    ];

    protected readonly twitchInputs: ApiRow[] = [
        {
            name: 'channel',
            type: 'string',
            default: "''",
            description: "Nom de chaîne ou URL twitch.tv. Une valeur non reconnue affiche le message de repli.",
        },
        {
            name: 'emptyLabel',
            type: 'string',
            default: "'Add a Twitch channel to display the player.'",
            description: 'Message affiché en absence de chaîne exploitable.',
        },
    ];

    protected readonly helpers: ApiRow[] = [
        {
            name: 'twitchChannel(raw)',
            type: 'string | null',
            description: "Extrait le nom de chaîne d'une saisie ou d'une URL, ou null si rien de valide.",
        },
        {
            name: 'twitchPlayerUrl(channel)',
            type: 'string',
            description: 'Construit l’URL du lecteur, domaine parent compris.',
        },
        {
            name: 'videoEmbedUrl(raw)',
            type: 'string | null',
            description: "Convertit une page vidéo publique en URL de lecteur, ou null si le service n'est pas reconnu.",
        },
        {
            name: 'linkNetwork(url)',
            type: 'string',
            description: "Devine la clé de réseau d'une URL, avec repli sur 'link'.",
        },
        { name: 'linkLabel(url)', type: 'string', description: "Renvoie le nom d'hôte nettoyé de son préfixe www." },
    ];
}
