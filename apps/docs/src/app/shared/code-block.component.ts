import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

export type CodeLanguage = 'typescript' | 'html' | 'scss' | 'bash' | 'json';

@Component({
    selector: 'gcd-code',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './code-block.component.html',
    styleUrl: './code-block.component.scss',
})
export class CodeBlockComponent {
    public readonly code = input.required<string>();

    public readonly language = input<CodeLanguage>('typescript');

    public readonly label = input('');

    protected readonly copied = signal(false);

    protected readonly highlighted = computed(
        () => hljs.highlight(this.code().trim(), { language: this.language() }).value,
    );

    protected async copy(): Promise<void> {
        await navigator.clipboard.writeText(this.code().trim());
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 1600);
    }
}
