import { computed, inject, Injectable, resource, signal } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { PlatformSession, PlatformSessionService } from "../platform/platform-session.service";
import { PromiseUtils } from "../utils/promise.utils";
import { ResourceUtils } from "../utils/resource.utils";
import {
  GAME_MEMBERSHIP_CONFIG,
  GAME_PLAYER_SHEET_API,
  type GameSheetResolveResult,
} from "./tokens";

const NO_SHEET: GameSheetResolveResult = { playerPublicId: null, hasSheet: false };

/**
 * Single source of truth for "who is visiting and does he own a sheet in this game".
 *
 * Browsing stays anonymous: nothing here writes to the back. The sheet only ever comes
 * into existence through {@link createSheet}, on an explicit user action.
 */
@Injectable()
export class GameMembershipStore {
  public readonly session = computed(() => this.sessionResource.value());
  public readonly isAuthenticated = computed(() => this.session() !== null);

  public readonly playerPublicId = computed(
    () => this.createdPlayerPublicId() ?? this.resolutionResource.value().playerPublicId,
  );
  public readonly hasSheet = computed(
    () => this.createdPlayerPublicId() !== null || this.resolutionResource.value().hasSheet,
  );

  /** Lookup is only awaited for a logged-in visitor: an anonymous one has nothing to resolve. */
  public readonly loading = computed(
    () =>
      ResourceUtils.isPending(this.sessionResource) ||
      (this.isAuthenticated() && ResourceUtils.isPending(this.resolutionResource)),
  );

  /** Lookup answered for the current session, so `hasSheet()` can be trusted. */
  public readonly resolved = computed(() => this.isAuthenticated() && !this.loading());

  /** Logged in, lookup done, still no sheet: the create wall / popup target state. */
  public readonly needsSheet = computed(() => this.resolved() && !this.hasSheet());

  public readonly creating = signal(false);

  public readonly promptDismissed = computed(() => this.dismissed());
  public readonly shouldPromptSheetCreation = computed(
    () => this.needsSheet() && !this.promptDismissed(),
  );

  private readonly config = inject(GAME_MEMBERSHIP_CONFIG);
  private readonly platformSession = inject(PlatformSessionService);
  private readonly players = inject(GAME_PLAYER_SHEET_API);
  private readonly router = inject(Router);

  private readonly promptDismissedKey = `gc.game-sheet-prompt.dismissed.${this.config.gameId}`;

  /** A failed touch just means nobody is logged in, which is a supported way to browse. */
  private readonly sessionResource = resource({
    loader: () => firstValueFrom(this.platformSession.touch()).catch(() => null),
    defaultValue: null as PlatformSession | null,
  });

  /** Read-only lookup, unlike `players.load()` which upserts the sheet. */
  private readonly resolutionResource = resource({
    params: () => this.session()?.publicId,
    loader: ({ params }) => firstValueFrom(this.players.resolve(params)).catch(() => NO_SHEET),
    defaultValue: NO_SHEET,
  });

  private readonly createdPlayerPublicId = signal<string | null>(null);
  private readonly dismissed = signal(this.readDismissed());

  /** Lets imperative callers read the signals above once they hold their final value. */
  public whenResolved(): Promise<void> {
    return PromiseUtils.waitUntilFalse(() => this.loading());
  }

  /**
   * Creates the sheet for the current session and returns its public id, or null on failure.
   *
   * This is the only path that may call `load()`, and it must stay behind an explicit user action.
   */
  public async createSheet(): Promise<string | null> {
    const session = this.session();
    if (!session || this.creating()) {
      return null;
    }

    const existing = this.playerPublicId();
    if (existing) {
      return existing;
    }

    this.creating.set(true);
    try {
      const sheet = await firstValueFrom(
        this.players.load({
          platformUserId: session.id,
          platformUserPublicId: session.publicId,
        }),
      );
      this.createdPlayerPublicId.set(sheet.publicId);
      return sheet.publicId;
    } catch {
      return null;
    } finally {
      this.creating.set(false);
    }
  }

  /** Creation always lands on the sheet, so the visitor is invited to fill it in right away. */
  public async createSheetAndOpen(): Promise<void> {
    const playerPublicId = await this.createSheet();
    if (playerPublicId) {
      await this.router.navigate([`${this.config.gameUrl}/players`, playerPublicId]);
    }
  }

  public dismissPrompt(): void {
    this.dismissed.set(true);
    this.writeDismissed();
  }

  private readDismissed(): boolean {
    try {
      return localStorage.getItem(this.promptDismissedKey) === "true";
    } catch {
      return false;
    }
  }

  private writeDismissed(): void {
    try {
      localStorage.setItem(this.promptDismissedKey, "true");
    } catch {
      // Private browsing: the refusal is lost next visit.
    }
  }
}
