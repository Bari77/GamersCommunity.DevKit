import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { PageComponent } from '../../shared/page.component';

@Component({
    selector: 'gcd-lfg-chat-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, ApiTableComponent, CodeBlockComponent],
    template: `
        <gcd-page
            lead="Shell de chat LFG / recrutement : fil, stick-to-bottom, composer Nebular et sélecteur « poster as »."
        >
            <p>
                Le remote conserve stores, realtime et mapping domaine →
                <code>LfgChatMessage</code>. Le shell gère le scroll (anciens messages, jump-to-latest) et l’état du
                composer via <code>composerState</code>.
            </p>

            <div class="gcd-note">
                <p>
                    Peers Nebular (<code>NbChatModule</code>, <code>NbSelectModule</code>). Pas de démo live dans la
                    doc : branchez-le depuis un remote déjà thématisé.
                </p>
            </div>

            <h2>Slots</h2>

            <ul>
                <li>
                    <code>ng-template gcLfgChatLeading</code> — avatar / blason (<code>$implicit</code> = message) ;
                </li>
                <li>
                    <code>ng-template gcLfgChatMeta</code> — ligne méta sous l’émetteur (sinon
                    <code>metaParts</code>) ;
                </li>
                <li><code>gcLfgChatNeedsSheet</code> — mur « créer une fiche » ;</li>
                <li><code>gcLfgChatPublishError</code> — alerte d’erreur de publication.</li>
            </ul>

            <gcd-code language="html" [code]="usageSnippet" />

            <h2>API</h2>

            <gcd-api heading="Entrées" [rows]="inputs" />
            <gcd-api heading="Sorties" [rows]="outputs" [showDefault]="false" />

            <gcd-code language="typescript" label="Types message / composer" [code]="typesSnippet" />
        </gcd-page>
    `,
})
export class LfgChatPageComponent {
    protected readonly usageSnippet = `<gc-lfg-chat
    [title]="title()"
    [messages]="viewMessages()"
    [loading]="store.loading()"
    [hasMore]="store.hasMore()"
    [isLive]="realtime.isLive()"
    [composerState]="composerState()"
    [labels]="labels"
    (send)="store.send($event)"
    (requestOlder)="store.loadOlder()"
    (selectPoster)="store.selectTeam($event)"
>
    <ng-template gcLfgChatLeading let-message>…</ng-template>
    <app-create-sheet-wall gcLfgChatNeedsSheet variant="inline" [message]="sheetWallMessage" />
</gc-lfg-chat>`;

    protected readonly typesSnippet = `export type LfgChatComposerState =
  | 'muted' | 'noPoster' | 'cooldown' | 'ready'
  | 'pickPoster' | 'needsSheet' | 'login' | 'hidden';

export interface LfgChatMessage {
  publicId: string;
  body: string;
  creationDate: Date;
  handleLabel: string;
  initial: string;
  isMine: boolean;
  avatarUrl?: string | null;
  metaParts?: string[];
  senderLink?: unknown[] | null;
  context?: unknown;
}`;

    protected readonly inputs: ApiRow[] = [
        { name: 'title', type: 'string', default: 'required', description: 'Titre du panneau.' },
        { name: 'messages', type: 'LfgChatMessage[]', default: 'required', description: 'Fil ordonné.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Squelette initial.' },
        { name: 'loadingOlder', type: 'boolean', default: 'false', description: 'Hint « loading older ».' },
        { name: 'hasMore', type: 'boolean', default: 'false', description: 'Autorise requestOlder au scroll haut.' },
        { name: 'isLive', type: 'boolean', default: 'false', description: 'Pastille Live.' },
        { name: 'offlineMessage', type: 'string | null', default: 'null', description: 'Bandeau offline.' },
        {
            name: 'offlineConnecting',
            type: 'boolean',
            default: 'false',
            description: 'Style « connecting » du bandeau.',
        },
        {
            name: 'composerState',
            type: 'LfgChatComposerState',
            default: "'hidden'",
            description: 'Quel pied de panneau afficher.',
        },
        { name: 'cooldownSeconds', type: 'number', default: '0', description: 'Compteur si cooldown.' },
        {
            name: 'showPosterPicker',
            type: 'boolean',
            default: 'false',
            description: 'Sélecteur équipe/guilde si plusieurs options.',
        },
        {
            name: 'posterOptions',
            type: 'LfgChatPosterOption[]',
            default: '[]',
            description: 'Options du sélecteur.',
        },
        {
            name: 'selectedPosterId',
            type: 'string | null',
            default: 'null',
            description: 'Option sélectionnée.',
        },
        {
            name: 'labels',
            type: 'Partial<LfgChatLabels>',
            default: '{}',
            description: 'Surcharge i18n des textes du shell.',
        },
    ];

    protected readonly outputs: ApiRow[] = [
        { name: 'send', type: 'string', description: 'Corps du message à publier.' },
        { name: 'requestOlder', type: 'void', description: 'Charger la page précédente.' },
        { name: 'selectPoster', type: 'string', description: 'publicId choisi dans le picker.' },
    ];
}
