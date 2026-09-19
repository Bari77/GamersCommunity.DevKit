import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    effect,
    inject,
    input,
    output,
    viewChild,
} from '@angular/core';

/** Centred overlay panel hosting arbitrary projected content. */
@Component({
    selector: 'gc-modal',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
    host: {
        '[class.gc-modal--open]': 'open()',
        '(document:keydown.escape)': 'requestClose("escape")',
    },
})
export class ModalComponent {
    public readonly open = input(false);

    public readonly ariaLabel = input('');

    /** Set to false for a blocking modal that only its own actions can close. */
    public readonly dismissible = input(true);

    public readonly dismissed = output<'backdrop' | 'escape'>();

    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly destroyRef = inject(DestroyRef);
    private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

    public constructor() {
        // A transformed or overflow-clipped ancestor (profile sheet, `.gc-enter`) would pin
        // `position: fixed` to that box. The overlay belongs to the viewport.
        effect(() => {
            const element = this.host.nativeElement;
            if (this.open() && element.parentElement !== document.body) {
                document.body.appendChild(element);
            }
        });

        this.destroyRef.onDestroy(() => {
            const element = this.host.nativeElement;
            if (element.parentElement === document.body) {
                element.remove();
            }
        });

        effect(() => this.panel()?.nativeElement.focus());
    }

    protected requestClose(origin: 'backdrop' | 'escape'): void {
        if (this.open() && this.dismissible()) {
            this.dismissed.emit(origin);
        }
    }
}
