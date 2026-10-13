import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from "@angular/core";
import { isRichHtmlBlank, RichContentComponent, RichEditorComponent } from "@bari77/gc-ui";

/** In-place note editor for the live workspace demo: draft, then save or cancel. */
@Component({
    selector: "gcd-demo-note",
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RichContentComponent, RichEditorComponent],
    templateUrl: "./demo-note.component.html",
    styleUrl: "./demo-note.component.scss",
})
export class DemoNoteComponent {
    public readonly html = input("");
    public readonly editing = input(false);
    public readonly save = output<string>();
    public readonly cancel = output<void>();

    protected readonly draft = signal("");
    protected readonly blank = computed(() => isRichHtmlBlank(this.html()));

    public constructor() {
        effect(() => {
            const editing = this.editing();
            untracked(() => {
                if (editing) {
                    this.draft.set(this.html());
                }
            });
        });
    }

    protected commit(): void {
        const html = this.draft();
        this.save.emit(isRichHtmlBlank(html) ? "" : html);
    }
}
