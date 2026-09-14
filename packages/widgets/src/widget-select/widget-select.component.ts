import {
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    output,
    signal,
} from '@angular/core';

export interface WidgetSelectOption {
    value: string;
    label: string;
    /** Secondary line under the label, e.g. the file a layout is read from. */
    hint?: string;
}

let nextSelectId = 0;

/**
 * Drop-down drawn by the kit. A native `select` paints its list with the operating system,
 * which no stylesheet can reach, so the panel is plain markup driven by the listbox pattern.
 */
@Component({
    selector: 'gc-widget-select',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './widget-select.component.html',
    styleUrl: './widget-select.component.scss',
    host: {
        '[class.gc-select--compact]': 'compact()',
        '[class.gc-select--open]': 'open()',
        '(keydown)': 'onKeydown($event)',
        '(focusout)': 'onFocusOut($event)',
        '(document:pointerdown)': 'onDocumentPointerDown($event)',
    },
})
export class WidgetSelectComponent {
    public readonly options = input.required<WidgetSelectOption[]>();

    public readonly value = input<string | null>(null);

    public readonly ariaLabel = input('');

    public readonly placeholder = input('Select…');

    public readonly disabled = input(false, { transform: booleanAttribute });

    /** Dense flavour for tight spots such as the page rail. */
    public readonly compact = input(false, { transform: booleanAttribute });

    public readonly valueChange = output<string>();

    protected readonly id = `gc-select-${nextSelectId++}`;
    protected readonly open = signal(false);
    protected readonly activeIndex = signal(-1);

    protected readonly selected = computed(
        () => this.options().find((option) => option.value === this.value()) ?? null,
    );

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    public constructor() {
        afterRenderEffect(() => {
            const index = this.activeIndex();
            if (!this.open() || index < 0) {
                return;
            }

            this.host.nativeElement
                .querySelector(`#${this.id}-option-${index}`)
                ?.scrollIntoView({ block: 'nearest' });
        });
    }

    protected toggle(): void {
        if (this.open()) {
            this.close();
            return;
        }

        this.openPanel();
    }

    protected pick(option: WidgetSelectOption): void {
        this.close();

        if (option.value !== this.value()) {
            this.valueChange.emit(option.value);
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (this.disabled()) {
            return;
        }

        if (event.key === 'Escape' && this.open()) {
            this.close();
            event.stopPropagation();
            return;
        }

        if (event.key === 'Tab') {
            this.open.set(false);
            return;
        }

        if (!this.open()) {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
                this.openPanel();
                event.preventDefault();
            }
            return;
        }

        const options = this.options();

        switch (event.key) {
            case 'ArrowDown':
                this.activeIndex.set(Math.min(this.activeIndex() + 1, options.length - 1));
                break;
            case 'ArrowUp':
                this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
                break;
            case 'Home':
                this.activeIndex.set(0);
                break;
            case 'End':
                this.activeIndex.set(options.length - 1);
                break;
            case 'Enter':
            case ' ': {
                const option = options[this.activeIndex()];
                if (option) {
                    this.pick(option);
                }
                break;
            }
            default:
                return;
        }

        event.preventDefault();
    }

    /** Tabbing or clicking away closes the panel; moving inside it does not. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;
        if (!next || !this.host.nativeElement.contains(next)) {
            this.open.set(false);
        }
    }

    protected onDocumentPointerDown(event: Event): void {
        if (!this.host.nativeElement.contains(event.target as Node)) {
            this.open.set(false);
        }
    }

    private openPanel(): void {
        if (this.disabled() || this.options().length === 0) {
            return;
        }

        const current = this.options().findIndex((option) => option.value === this.value());
        this.activeIndex.set(current < 0 ? 0 : current);
        this.open.set(true);
    }

    private close(): void {
        this.open.set(false);
        this.host.nativeElement.querySelector<HTMLButtonElement>(`#${this.id}-trigger`)?.focus();
    }
}
