import { DatePipe, NgTemplateOutlet } from "@angular/common";
import {
  afterRenderEffect,
  Component,
  contentChild,
  Directive,
  ElementRef,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { SkeletonComponent } from "@bari77/gc-ui";
import { NbChatModule, NbSelectModule } from "@nebular/theme";

const NEAR_BOTTOM_PX = 48;
const NEAR_TOP_PX = 48;

/** Minimal message shape rendered by {@link LfgChatComponent}. */
export interface LfgChatMessage {
  publicId: string;
  body: string;
  creationDate: Date;
  handleLabel: string;
  initial: string;
  isMine: boolean;
  /** Shown when no leading template is projected. */
  avatarUrl?: string | null;
  /** Optional muted meta line under the sender (e.g. region / role). */
  metaParts?: string[];
  /** Router link for the sender handle; omit for a static label. */
  senderLink?: unknown[] | null;
  /** Opaque remote payload for projected leading/meta templates. */
  context?: unknown;
}

export interface LfgChatPosterOption {
  publicId: string;
  handleLabel: string;
}

export type LfgChatComposerState =
  | "muted"
  | "noPoster"
  | "cooldown"
  | "ready"
  | "pickPoster"
  | "needsSheet"
  | "login"
  | "hidden";

export interface LfgChatLabels {
  live: string;
  empty: string;
  loadingOlder: string;
  newMessages: string;
  composePlaceholder: string;
  posterPickerPlaceholder: string;
  muted: string;
  noPoster: string;
  pickPoster: string;
  cooldown: string;
  cooldownHint: string;
  login: string;
  loginHint: string;
  loginHref: string;
}

export const DEFAULT_LFG_CHAT_LABELS: LfgChatLabels = {
  live: "Live",
  empty: "No messages yet. Say hello!",
  loadingOlder: "Loading older messages...",
  newMessages: "New messages",
  composePlaceholder: "Type a message...",
  posterPickerPlaceholder: "Post as...",
  muted: "You are muted and cannot post LFG messages.",
  noPoster: "Only officers can post here.",
  pickPoster: "Pick who you are posting for to enable the composer.",
  cooldown: "Please wait",
  cooldownHint: " before posting again.",
  login: "Log in",
  loginHint: " to join the global LFG chat.",
  loginHref: "/users/login",
};

/** Marks projected leading visual template; context `$implicit` is the message. */
@Directive({
  selector: "ng-template[gcLfgChatLeading]",
  standalone: true,
})
export class LfgChatLeadingDirective {
  public constructor(public readonly template: TemplateRef<{ $implicit: LfgChatMessage }>) {}
}

/** Marks projected meta line under the sender; context `$implicit` is the message. */
@Directive({
  selector: "ng-template[gcLfgChatMeta]",
  standalone: true,
})
export class LfgChatMetaDirective {
  public constructor(public readonly template: TemplateRef<{ $implicit: LfgChatMessage }>) {}
}

/** Marks projected sheet-wall content for the `needsSheet` composer state. */
@Directive({
  selector: "[gcLfgChatNeedsSheet]",
  standalone: true,
})
export class LfgChatNeedsSheetDirective {}

/** Marks projected publish-error content (alerts). */
@Directive({
  selector: "[gcLfgChatPublishError]",
  standalone: true,
})
export class LfgChatPublishErrorDirective {}

/**
 * Shared LFG / recruitment chat shell: thread, stick-to-bottom, composer, poster picker.
 * Domain stores, realtime, and game-specific bubble chrome stay in the remote.
 */
@Component({
  standalone: true,
  selector: "gc-lfg-chat",
  imports: [
    DatePipe,
    FormsModule,
    NgTemplateOutlet,
    RouterLink,
    NbChatModule,
    NbSelectModule,
    SkeletonComponent,
  ],
  templateUrl: "./lfg-chat.component.html",
  styleUrl: "./lfg-chat.component.scss",
})
export class LfgChatComponent {
  public readonly title = input.required<string>();
  public readonly messages = input.required<LfgChatMessage[]>();
  public readonly loading = input(false);
  public readonly loadingOlder = input(false);
  public readonly hasMore = input(false);
  public readonly isLive = input(false);
  public readonly offlineMessage = input<string | null>(null);
  public readonly offlineConnecting = input(false);
  public readonly composerState = input<LfgChatComposerState>("hidden");
  public readonly cooldownSeconds = input(0);
  public readonly showPosterPicker = input(false);
  public readonly posterOptions = input<LfgChatPosterOption[]>([]);
  public readonly selectedPosterId = input<string | null>(null);
  public readonly labels = input<Partial<LfgChatLabels>>({});

  public readonly send = output<string>();
  public readonly requestOlder = output<void>();
  public readonly selectPoster = output<string>();

  protected readonly messagePlaceholders = [0, 1, 2, 3];
  protected readonly stickToBottom = signal(true);
  protected readonly pendingBelowCount = signal(0);

  private readonly viewport = viewChild<ElementRef<HTMLElement>>("viewport");
  private lastTailPublicId: string | null = null;
  private loadingOlderGuard = false;
  private pendingOlderRestore: { height: number; top: number } | null = null;

  protected readonly leadingSlot = contentChild(LfgChatLeadingDirective);
  protected readonly metaSlot = contentChild(LfgChatMetaDirective);

  public constructor() {
    afterRenderEffect(() => {
      const messages = this.messages();
      const loading = this.loading();
      const loadingOlder = this.loadingOlder();
      const tailPublicId = messages.at(-1)?.publicId ?? null;

      if (this.pendingOlderRestore && !loadingOlder) {
        const restore = this.pendingOlderRestore;
        this.pendingOlderRestore = null;
        this.loadingOlderGuard = false;
        Promise.resolve().then(() => {
          const next = this.viewport()?.nativeElement;
          if (!next) {
            return;
          }
          next.scrollTop = next.scrollHeight - restore.height + restore.top;
        });
      }

      if (loading || messages.length === 0) {
        return;
      }

      if (tailPublicId == null || tailPublicId === this.lastTailPublicId) {
        if (messages.length > 0 && this.lastTailPublicId == null) {
          this.lastTailPublicId = tailPublicId;
          this.scrollToBottom(false);
        }
        return;
      }

      const isInitialPin = this.lastTailPublicId == null;
      this.lastTailPublicId = tailPublicId;
      if (this.stickToBottom()) {
        this.pendingBelowCount.set(0);
        this.scrollToBottom(!isInitialPin);
        return;
      }

      this.pendingBelowCount.update((count) => count + 1);
    });
  }

  protected get resolvedLabels(): LfgChatLabels {
    return { ...DEFAULT_LFG_CHAT_LABELS, ...this.labels() };
  }

  protected onChatSend(event: { message: string; files: File[] }): void {
    const text = event.message.trim();
    if (!text || this.composerState() !== "ready") {
      return;
    }
    this.stickToBottom.set(true);
    this.pendingBelowCount.set(0);
    this.send.emit(text);
    this.scrollToBottom(true);
  }

  protected onViewportScroll(): void {
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }

    const distanceBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceBottom <= NEAR_BOTTOM_PX;
    this.stickToBottom.set(nearBottom);
    if (nearBottom) {
      this.pendingBelowCount.set(0);
    }

    if (el.scrollTop <= NEAR_TOP_PX) {
      this.tryRequestOlder(el);
    }
  }

  protected jumpToLatest(): void {
    this.pendingBelowCount.set(0);
    this.stickToBottom.set(true);
    this.scrollToBottom(true);
  }

  private scrollToBottom(smooth: boolean): void {
    const el = this.viewport()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }

  private tryRequestOlder(el: HTMLElement): void {
    if (this.loadingOlderGuard || this.loadingOlder() || !this.hasMore()) {
      return;
    }

    this.loadingOlderGuard = true;
    this.pendingOlderRestore = { height: el.scrollHeight, top: el.scrollTop };
    this.requestOlder.emit();
    Promise.resolve().then(() => {
      if (!this.loadingOlder()) {
        this.loadingOlderGuard = false;
        this.pendingOlderRestore = null;
      }
    });
  }
}
