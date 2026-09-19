import changelog from '../../../../CHANGELOG.json';

/** Which part of the DevKit a change lands in, shown as a badge next to the entry. */
export type ReleaseScope = 'gc-ui' | 'gc-widgets' | 'gc-theme' | 'gc-workspace-editor' | 'docs' | 'devkit';

export type ReleaseKind = 'added' | 'changed' | 'fixed';

export interface ReleaseChange {
    package: ReleaseScope;
    kind: ReleaseKind;
    text: string;
}

export interface Release {
    version: string;
    date: string;
    summary: string;
    changes: ReleaseChange[];
}

/**
 * Release notes, newest first. `CHANGELOG.json` at the repository root is the single source: the
 * release workflow reads the same file to write the body of the GitHub Release, so a version can
 * never say one thing here and another there.
 */
export const releases = changelog as Release[];

export const KIND_LABELS: Record<ReleaseKind, string> = {
    added: 'Ajout',
    changed: 'Changement',
    fixed: 'Correction',
};
