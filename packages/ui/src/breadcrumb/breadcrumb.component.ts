import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';

/** One step of the navigation trail. */
export interface Breadcrumb {
    label: string;

    /** Absolute URL of the step, built from the route segments leading to it. */
    url: string;
}

/**
 * Navigation trail rebuilt from the router state after every navigation. A route joins the trail by
 * carrying a `breadcrumb` string in its `data`; routes without one are skipped, which keeps
 * redirect-only and componentless segments out of the way.
 *
 * The component stays empty as long as no route contributes a step, so the site root needs no
 * special casing: leave its `data` alone and nothing renders.
 */
@Component({
    selector: 'gc-breadcrumb',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    templateUrl: './breadcrumb.component.html',
    styleUrl: './breadcrumb.component.scss',
    host: {
        '[class.gc-breadcrumb--empty]': 'crumbs().length === 0',
    },
})
export class BreadcrumbComponent {
    /** Label of the leading step, prepended once the trail holds at least one route. Leave empty to drop it. */
    public readonly rootLabel = input('');

    public readonly rootLink = input('/');

    public readonly separator = input('/');

    public readonly ariaLabel = input('Breadcrumb');

    private readonly router = inject(Router);

    private readonly trail = signal<Breadcrumb[]>(this.readTrail());

    protected readonly crumbs = computed<Breadcrumb[]>(() => {
        const trail = this.trail();

        if (trail.length === 0) {
            return [];
        }

        const rootLabel = this.rootLabel();

        return rootLabel ? [{ label: rootLabel, url: this.rootLink() }, ...trail] : trail;
    });

    public constructor() {
        const subscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.trail.set(this.readTrail());
            }
        });

        inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }

    private readTrail(): Breadcrumb[] {
        const trail: Breadcrumb[] = [];
        let snapshot: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
        let url = '';

        while (snapshot) {
            const segments = snapshot.url.map((segment) => segment.path).join('/');

            if (segments) {
                url += `/${segments}`;
            }

            // Read the raw route config rather than `snapshot.data`: the latter inherits its parent's
            // data across empty-path routes, which would repeat a step for every componentless wrapper.
            const label: unknown = snapshot.routeConfig?.data?.['breadcrumb'];

            if (typeof label === 'string' && label.length > 0) {
                trail.push({ label, url });
            }

            snapshot = snapshot.firstChild;
        }

        return trail;
    }
}
