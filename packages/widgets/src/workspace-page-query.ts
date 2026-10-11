import { effect, inject, signal, untracked, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

/** Query param used by sheet hosts to deep-link a workspace page. */
export const WORKSPACE_PAGE_QUERY_PARAM = 'page';

/** Default page id omitted from the URL so share links stay short. */
export const WORKSPACE_HOME_PAGE_ID = 'home';

export interface WorkspacePageQueryOptions {
    /** Query param name. Defaults to {@link WORKSPACE_PAGE_QUERY_PARAM}. */
    param?: string;
    /** Page id stored as "no query param". Defaults to {@link WORKSPACE_HOME_PAGE_ID}. */
    omitId?: string;
}

/**
 * Two-way binding between `gc-widget-workspace` `activePageId` and `?page=`.
 * Call from an injection context (component field initializer or constructor).
 *
 * - Tab changes update the URL with `replaceUrl` (shareable, no history spam).
 * - Browser back/forward restores the page from the query.
 * - Unknown / filtered pages fall back inside the workspace; the URL follows.
 */
export function bindWorkspacePageQuery(options?: WorkspacePageQueryOptions): WritableSignal<string | null> {
    const param = options?.param ?? WORKSPACE_PAGE_QUERY_PARAM;
    const omitId = options?.omitId ?? WORKSPACE_HOME_PAGE_ID;
    const route = inject(ActivatedRoute);
    const router = inject(Router);

    const queryPage = toSignal(route.queryParamMap.pipe(map((params) => params.get(param))), {
        initialValue: route.snapshot.queryParamMap.get(param),
    });

    const activePageId = signal<string | null>(queryPage());

    effect(() => {
        const fromUrl = queryPage();
        untracked(() => {
            if (fromUrl !== activePageId()) {
                activePageId.set(fromUrl);
            }
        });
    });

    effect(() => {
        const id = activePageId();
        untracked(() => {
            const current = route.snapshot.queryParamMap.get(param);
            const next = !id || id === omitId ? null : id;
            if (current === next) {
                return;
            }

            void router.navigate([], {
                relativeTo: route,
                queryParams: { [param]: next },
                queryParamsHandling: 'merge',
                replaceUrl: true,
            });
        });
    });

    return activePageId;
}
