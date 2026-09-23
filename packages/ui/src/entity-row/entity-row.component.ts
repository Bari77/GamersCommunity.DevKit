import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

export interface EntityRowFact {
  label: string;
  /** Muted word printed before the value, as in "iLvl 650". */
  prefix?: string;
  /** Tints the badge with the row accent. */
  accent?: boolean;
}

/**
 * Shared home-rail row: accent bar, leading visual, title, optional subtitle / facts / date.
 * Project `[rowVisual]`, optional `[rowTrailing]`, `[rowSubtitleLeading]`, and `[rowFacts]`.
 */
@Component({
  selector: "gc-entity-row",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: "./entity-row.component.html",
  styleUrl: "./entity-row.component.scss",
})
export class EntityRowComponent {
  public readonly link = input.required<unknown[]>();
  public readonly name = input.required<string>();

  /** Drives the left bar, the title and accented badges. Falls back to `--gc-accent`. */
  public readonly accent = input<string | null>(null);

  public readonly subtitle = input<string | null>(null);
  public readonly subtitleMuted = input(false);

  /** Small uppercase pill next to the name (e.g. "Main"). */
  public readonly badge = input<string | null>(null);

  public readonly level = input<number | null>(null);
  public readonly levelLabel = input("");

  public readonly date = input<Date | null>(null);

  public readonly facts = input<EntityRowFact[]>([]);

  public readonly description = input<string | null>(null);
  public readonly descriptionMuted = input(false);
}
