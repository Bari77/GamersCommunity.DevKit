import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CodeBlockComponent, CodeLanguage } from './code-block.component';

interface DemoTab {
    id: string;
    label: string;
    language: CodeLanguage;
    code: string;
}

/** Live example framed with the snippets needed to reproduce it. */
@Component({
    selector: 'gcd-demo',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CodeBlockComponent],
    templateUrl: './demo.component.html',
    styleUrl: './demo.component.scss',
})
export class DemoComponent {
    public readonly title = input('');

    public readonly description = input('');

    public readonly html = input('');

    public readonly ts = input('');

    public readonly scss = input('');

    /** Lets a demo needing room to breathe drop the centred preview box. */
    public readonly bare = input(false);

    protected readonly openTab = signal<string | null>(null);

    protected readonly tabs = computed<DemoTab[]>(() => {
        const tabs: DemoTab[] = [];
        if (this.html()) {
            tabs.push({ id: 'html', label: 'HTML', language: 'html', code: this.html() });
        }
        if (this.ts()) {
            tabs.push({ id: 'ts', label: 'TypeScript', language: 'typescript', code: this.ts() });
        }
        if (this.scss()) {
            tabs.push({ id: 'scss', label: 'SCSS', language: 'scss', code: this.scss() });
        }
        return tabs;
    });

    protected readonly activeTab = computed<DemoTab | null>(() => {
        const id = this.openTab();
        return this.tabs().find((tab) => tab.id === id) ?? null;
    });

    protected toggle(id: string): void {
        this.openTab.update((current) => (current === id ? null : id));
    }
}
