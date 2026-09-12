import {
    findCatalogEntry,
    type WidgetCatalog,
    type WidgetCatalogEntry,
    type WidgetPageVisibilityOption,
    type WidgetSettingsField,
} from './widget-contract.js';
import type { ValidationIssue, ValidationSeverity } from './types.js';

const BUILTIN_WIDGET_TYPES = new Set(['gc-twitch', 'gc-links']);

function issue(path: string, message: string, severity: ValidationSeverity = 'error'): ValidationIssue {
    return { path, message, severity };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readWidget(item: Record<string, unknown>, index: number, pagePath: string, catalog: WidgetCatalog): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const base = `${pagePath}.widgets[${index}]`;

    const type = item['type'];
    if (typeof type !== 'string' || type.length === 0) {
        issues.push(issue(`${base}.type`, 'Widget type must be a non-empty string.'));
        return issues;
    }

    const entry = findCatalogEntry(catalog, type);
    if (!entry) {
        const known = catalog.map((row: WidgetCatalogEntry) => row.type).join(', ');
        issues.push(issue(`${base}.type`, `Unknown widget type "${type}". Catalog: ${known || '(empty)'}.`));
    }

    for (const key of ['x', 'y', 'cols', 'rows'] as const) {
        const value = item[key];
        if (!Number.isFinite(value)) {
            issues.push(issue(`${base}.${key}`, `${key} must be a number.`));
        }
    }

    const settings = item['settings'];
    if (settings !== undefined && !isRecord(settings)) {
        issues.push(issue(`${base}.settings`, 'settings must be an object when present.'));
    } else if (entry && isRecord(settings)) {
        issues.push(...validateSettings(`${base}.settings`, settings, entry));
    }

    return issues;
}

function validateSettings(path: string, settings: Record<string, unknown>, entry: WidgetCatalogEntry): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const fields = entry.fields ?? [];
    const fieldKeys = new Set(fields.map((field: WidgetSettingsField) => field.key));

    for (const field of fields) {
        issues.push(...validateFieldValue(`${path}.${field.key}`, settings[field.key], field));
    }

    for (const key of Object.keys(settings)) {
        if (key === 'title') {
            continue;
        }
        if (!fieldKeys.has(key)) {
            issues.push(
                issue(`${path}.${key}`, `Unexpected settings key "${key}" for widget type "${entry.type}".`, 'warning'),
            );
        }
    }

    return issues;
}

function validateFieldValue(path: string, value: unknown, field: WidgetSettingsField): ValidationIssue[] {
    if (field.type === 'list') {
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [issue(path, 'Expected an array.')];
        }

        return value.flatMap((row, index) => {
            if (!isRecord(row)) {
                return [issue(`${path}[${index}]`, 'Each list row must be an object.')];
            }
            return field.itemFields.flatMap((itemField: WidgetSettingsField) =>
                validateFieldValue(`${path}[${index}].${itemField.key}`, row[itemField.key], itemField),
            );
        });
    }

    if (value === undefined || value === null || value === '') {
        return [];
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
        return [issue(path, `Expected ${field.type}, got ${typeof value}.`)];
    }

    const text = String(value);
    if (field.type === 'url' && text.length > 0 && !/^https?:\/\//i.test(text) && !/^[a-z0-9._-]+$/i.test(text)) {
        return [issue(path, 'Expected an http(s) URL or a simple channel slug.', 'warning')];
    }

    if (field.type === 'number' && Number.isNaN(Number(text))) {
        return [issue(path, 'Expected a numeric value.')];
    }

    return [];
}

function validatePage(
    page: unknown,
    index: number,
    catalog: WidgetCatalog,
    columns: number,
    typeCounts: Map<string, number>,
    visibilityOptions: WidgetPageVisibilityOption[],
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const pagePath = `pages[${index}]`;

    if (!isRecord(page)) {
        return [issue(pagePath, 'Each page must be an object.')];
    }

    if (typeof page['title'] !== 'string' || page['title'].trim().length === 0) {
        issues.push(issue(`${pagePath}.title`, 'Page title must be a non-empty string.'));
    }

    const visibility = page['visibility'];
    if (visibility !== undefined) {
        if (typeof visibility !== 'string') {
            issues.push(issue(`${pagePath}.visibility`, 'Page visibility must be a string when present.'));
        } else if (!visibilityOptions.some((option) => option.value === visibility)) {
            const known = visibilityOptions.map((option) => option.value).join(', ');
            issues.push(
                issue(
                    `${pagePath}.visibility`,
                    `Unknown page visibility "${visibility}". Registry offers: ${known || '(none)'}.`,
                ),
            );
        }
    }

    const widgets = page['widgets'];
    if (!Array.isArray(widgets)) {
        issues.push(issue(`${pagePath}.widgets`, 'widgets must be an array.'));
        return issues;
    }

    widgets.forEach((widget, widgetIndex) => {
        if (!isRecord(widget)) {
            issues.push(issue(`${pagePath}.widgets[${widgetIndex}]`, 'Each widget must be an object.'));
            return;
        }

        issues.push(...readWidget(widget, widgetIndex, pagePath, catalog));

        const type = widget['type'];
        if (typeof type === 'string') {
            typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
        }

        const x = widget['x'];
        const cols = widget['cols'];
        if (Number.isFinite(x) && Number.isFinite(cols) && (x as number) + (cols as number) > columns) {
            issues.push(
                issue(
                    `${pagePath}.widgets[${widgetIndex}]`,
                    `Widget overflows the grid (x + cols > ${columns}).`,
                ),
            );
        }
    });

    return issues;
}

/** Validates a default layout JSON against a game's widget catalog. */
export function validateWorkspaceLayout(
    layout: unknown,
    catalog: WidgetCatalog,
    columns: number,
    visibilityOptions: WidgetPageVisibilityOption[] = [],
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!isRecord(layout)) {
        return [issue('layout', 'Layout must be a JSON object.')];
    }

    if (layout['version'] !== 2) {
        issues.push(issue('version', 'Layout version must be 2.'));
    }

    const pages = layout['pages'];
    if (!Array.isArray(pages) || pages.length === 0) {
        issues.push(issue('pages', 'Layout must contain at least one page.'));
        return issues;
    }

    const typeCounts = new Map<string, number>();
    pages.forEach((page, index) => {
        issues.push(...validatePage(page, index, catalog, columns, typeCounts, visibilityOptions));
    });

    for (const entry of catalog) {
        if (!entry.unique) {
            continue;
        }
        const count = typeCounts.get(entry.type) ?? 0;
        if (count > 1) {
            issues.push(issue('pages', `Widget type "${entry.type}" is unique but appears ${count} times.`));
        }
    }

    for (const [type, count] of typeCounts) {
        if (count > 0 && !findCatalogEntry(catalog, type) && !BUILTIN_WIDGET_TYPES.has(type)) {
            issues.push(issue('pages', `Widget type "${type}" is used ${count} time(s) but missing from the catalog.`));
        }
    }

    return issues;
}

export function formatIssues(issues: ValidationIssue[]): string {
    if (issues.length === 0) {
        return 'No issues found.';
    }

    return issues
        .map((row) => `${row.severity === 'error' ? 'error' : 'warn '} ${row.path}: ${row.message}`)
        .join('\n');
}

export function hasErrors(issues: ValidationIssue[]): boolean {
    return issues.some((row) => row.severity === 'error');
}
