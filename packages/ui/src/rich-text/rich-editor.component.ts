import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    effect,
    inject,
    input,
    model,
    viewChild,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { isRichHtmlBlank } from './rich-html.utils';

const SWATCH_COLORS = ['#222b45', '#3366ff', '#00d68f', '#ffaa00', '#ff3d71', '#a855f7'];

@Component({
    selector: 'gc-rich-editor',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './rich-editor.component.html',
    styleUrl: './rich-editor.component.scss',
    host: {
        '[class.gc-rich-editor-host--disabled]': 'disabled()',
    },
})
export class RichEditorComponent implements AfterViewInit, OnDestroy {
    /** Shorter toolbar and surface for catchphrases and one-liners. */
    public readonly compact = input(false);

    public readonly placeholder = input('');

    /** Limits plain-text length (not HTML byte size). */
    public readonly maxLength = input<number | null>(null);

    public readonly disabled = input(false);

    public readonly value = model('');

    protected readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');

    protected readonly swatchColors = SWATCH_COLORS;

    private editor: Editor | null = null;
    private syncingFromModel = false;

    public constructor() {
        const host = inject(ElementRef<HTMLElement>);

        effect(() => {
            const html = this.value();
            const editor = this.editor;
            if (!editor || this.syncingFromModel) {
                return;
            }
            const current = editor.getHTML();
            if (current === html) {
                return;
            }
            editor.commands.setContent(html || '', false);
        });

        effect(() => {
            const editor = this.editor;
            if (!editor) {
                return;
            }
            editor.setEditable(!this.disabled());
        });

        effect(() => {
            const compact = this.compact();
            if (!this.editor) {
                return;
            }
            host.nativeElement.classList.toggle('gc-rich-editor-host--compact', compact);
        });
    }

    public ngAfterViewInit(): void {
        const el = this.surface().nativeElement;
        const max = this.maxLength();

        this.editor = new Editor({
            element: el,
            editable: !this.disabled(),
            extensions: [
                StarterKit.configure({
                    heading: this.compact() ? false : { levels: [2, 3] },
                }),
                Underline,
                Link.configure({
                    openOnClick: false,
                    autolink: true,
                    linkOnPaste: true,
                    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
                }),
                TextStyle,
                Color,
                Placeholder.configure({ placeholder: this.placeholder() }),
                ...(max != null
                    ? [CharacterCount.configure({ limit: max, mode: 'textSize' })]
                    : []),
            ],
            content: this.value() || '',
            onUpdate: ({ editor }) => {
                this.syncingFromModel = true;
                this.value.set(editor.getHTML());
                this.syncingFromModel = false;
            },
        });
    }

    public ngOnDestroy(): void {
        this.editor?.destroy();
        this.editor = null;
    }

    protected isActive(name: string, attrs?: Record<string, unknown>): boolean {
        return this.editor?.isActive(name, attrs) ?? false;
    }

    protected toggleBold(): void {
        this.editor?.chain().focus().toggleBold().run();
    }

    protected toggleItalic(): void {
        this.editor?.chain().focus().toggleItalic().run();
    }

    protected toggleUnderline(): void {
        this.editor?.chain().focus().toggleUnderline().run();
    }

    protected toggleBulletList(): void {
        this.editor?.chain().focus().toggleBulletList().run();
    }

    protected toggleOrderedList(): void {
        this.editor?.chain().focus().toggleOrderedList().run();
    }

    protected setColor(color: string): void {
        this.editor?.chain().focus().setColor(color).run();
    }

    protected unsetColor(): void {
        this.editor?.chain().focus().unsetColor().run();
    }

    protected setLink(): void {
        const previous = this.editor?.getAttributes('link')['href'] as string | undefined;
        const url = window.prompt('URL', previous ?? 'https://');
        if (url === null) {
            return;
        }
        if (url === '') {
            this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        this.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }

    protected characters(): number {
        const storage = this.editor?.storage as { characterCount?: { characters: () => number } };
        return storage?.characterCount?.characters() ?? this.editor?.getText().length ?? 0;
    }

    protected showCounter(): boolean {
        return this.maxLength() != null;
    }

    protected counterLabel(): string {
        const max = this.maxLength();
        if (max == null) {
            return '';
        }
        return `${this.characters()} / ${max}`;
    }

    /** For parent forms: treat empty editor as blank. */
    public isBlank(): boolean {
        return isRichHtmlBlank(this.value());
    }
}
