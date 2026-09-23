import { DatePipe, NgTemplateOutlet } from "@angular/common";
import {
  Component,
  contentChild,
  Directive,
  input,
  output,
  signal,
  TemplateRef,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { RichContentComponent, SkeletonComponent, SkeletonTextComponent } from "@bari77/gc-ui";
import { NbButtonModule, NbCardModule } from "@nebular/theme";

/** Minimal post shape rendered by {@link EntityWallComponent}. */
export interface EntityWallPost {
  publicId: string;
  body: string;
  creationDate: Date;
  authorPlatformUserPublicId: string | null;
  authorHandleLabel(): string;
  isContactable(): boolean;
  isMine(playerPublicId: string | null | undefined): boolean;
}

export interface EntityWallLabels {
  title: string;
  queue: string;
  queueEmpty: string;
  empty: string;
  queued: string;
  edit: string;
  approve: string;
  reject: string;
  delete: string;
  loadMore: string;
}

export const DEFAULT_ENTITY_WALL_LABELS: EntityWallLabels = {
  title: "Wall",
  queue: "Awaiting review",
  queueEmpty: "Nothing waiting for a decision.",
  empty: "The wall is empty for now.",
  queued: "Sent. Staff will review it shortly.",
  edit: "Edit",
  approve: "Approve",
  reject: "Reject",
  delete: "Delete",
  loadMore: "Load more",
};

/** Marks projected composer content for {@link EntityWallComponent}. */
@Directive({
  selector: "[gcEntityWallComposer]",
  standalone: true,
})
export class EntityWallComposerDirective {}

/** Marks projected edit-form template; context `$implicit` is the post being edited. */
@Directive({
  selector: "ng-template[gcEntityWallEdit]",
  standalone: true,
})
export class EntityWallEditDirective {
  public constructor(public readonly template: TemplateRef<{ $implicit: EntityWallPost }>) {}
}

/** Marks projected extras template under a post body (media, audience, …). */
@Directive({
  selector: "ng-template[gcEntityWallExtras]",
  standalone: true,
})
export class EntityWallExtrasDirective {
  public constructor(public readonly template: TemplateRef<{ $implicit: EntityWallPost }>) {}
}

@Component({
  standalone: true,
  selector: "gc-entity-wall",
  imports: [
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    NbButtonModule,
    NbCardModule,
    SkeletonComponent,
    SkeletonTextComponent,
    RichContentComponent,
  ],
  templateUrl: "./entity-wall.component.html",
  styleUrl: "./entity-wall.component.scss",
})
export class EntityWallComponent {
  public readonly posts = input.required<EntityWallPost[]>();
  public readonly pending = input<EntityWallPost[]>([]);
  public readonly canPublish = input(false);
  public readonly canModerate = input(false);
  public readonly playerPublicId = input<string | null>(null);
  public readonly loading = input(false);
  public readonly loadingPending = input(false);
  public readonly loadingMore = input(false);
  public readonly hasMore = input(false);
  public readonly posting = input(false);
  public readonly queuedNotice = input(false);
  public readonly labels = input<Partial<EntityWallLabels>>({});

  public readonly loadMoreClick = output<void>();
  public readonly moderateClick = output<{ post: EntityWallPost; approve: boolean }>();
  public readonly removeClick = output<EntityWallPost>();
  public readonly editStart = output<EntityWallPost>();

  protected readonly editingId = signal<string | null>(null);
  protected readonly postPlaceholders = [0, 1, 2];

  protected readonly editSlot = contentChild(EntityWallEditDirective);
  protected readonly extrasSlot = contentChild(EntityWallExtrasDirective);

  protected get resolvedLabels(): EntityWallLabels {
    return { ...DEFAULT_ENTITY_WALL_LABELS, ...this.labels() };
  }

  protected get pendingCount(): number {
    return this.pending().length;
  }

  protected startEdit(post: EntityWallPost): void {
    this.editingId.set(post.publicId);
    this.editStart.emit(post);
  }

  public clearEditing(): void {
    this.editingId.set(null);
  }

  protected canDelete(post: EntityWallPost): boolean {
    return this.canModerate() || this.isAuthor(post);
  }

  protected isAuthor(post: EntityWallPost): boolean {
    return post.isMine(this.playerPublicId());
  }
}
