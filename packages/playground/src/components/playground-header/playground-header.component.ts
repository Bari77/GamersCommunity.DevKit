import { Component, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SkeletonComponent } from "@bari77/gc-ui";
import { NbButtonModule, NbContextMenuModule, NbIconModule, NbMenuItem, NbTooltipModule } from "@nebular/theme";
import { PLAYGROUND_BANNER } from "../../index";
import { PlaygroundHeaderLabels } from "./playground-header-labels.model";
import { PlaygroundHeaderSession } from "./playground-header-session.model";

export const DEFAULT_PLAYGROUND_HEADER_LABELS: PlaygroundHeaderLabels = {
    home: "Home",
    notificationsOff: "Notifications are off in the playground",
    copy: "Copy",
    copied: "Copied",
    profile: "Profile",
    switchAccount: "Switch account",
    login: "Login",
};

/**
 * Playground stand-in for the Platform shell header: game logo, playground mark, muted bell,
 * handle + avatar menu (profile / switch account). Place inside `<nb-layout-header>`.
 * Needs `NbMenuModule.forRoot()` (see `providePlaygroundUi`).
 */
@Component({
    standalone: true,
    selector: "gc-playground-header",
    imports: [RouterLink, SkeletonComponent, NbButtonModule, NbIconModule, NbTooltipModule, NbContextMenuModule],
    templateUrl: "./playground-header.component.html",
    styleUrl: "./playground-header.component.scss",
    host: { style: "display: contents" },
})
export class PlaygroundHeaderComponent {
    public readonly homeLink = input.required<string>();
    public readonly logoSrc = input("favicon.png");
    public readonly mark = input(PLAYGROUND_BANNER);
    public readonly session = input<PlaygroundHeaderSession | null>(null);
    public readonly loading = input(false);
    public readonly loginLink = input("/users/login");
    public readonly labels = input<Partial<PlaygroundHeaderLabels>>({});

    protected readonly text = computed<PlaygroundHeaderLabels>(() => ({
        ...DEFAULT_PLAYGROUND_HEADER_LABELS,
        ...this.labels(),
    }));
    protected readonly copied = signal(false);

    protected readonly menuItems = computed<NbMenuItem[]>(() => {
        const session = this.session();
        if (!session) {
            return [];
        }
        const text = this.text();
        return [
            { title: text.profile, icon: "person-outline", link: `/users/${session.publicId}` },
            { title: text.switchAccount, icon: "power-outline", link: this.loginLink() },
        ];
    });

    protected copyHandle(): void {
        const session = this.session();
        if (!session) {
            return;
        }
        void navigator.clipboard.writeText(`${session.nickname}#${session.discriminator}`);
        this.copied.set(true);
    }
}
