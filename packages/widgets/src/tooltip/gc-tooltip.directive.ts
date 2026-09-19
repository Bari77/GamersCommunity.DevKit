import { Directive, ElementRef, HostListener, inject, input, OnDestroy, Renderer2 } from '@angular/core';

const STYLE_ID = 'gc-tooltip-styles';
const SHOW_DELAY_MS = 100;

/**
 * Overlay tooltip. Native `title` is delayed and unstyled; CSS `::after` is clipped by
 * `.gc-widget { overflow: hidden }`. The bubble is appended to `document.body` so it
 * sits above the grid the same way a host Nebular tooltip would.
 */
@Directive({
    selector: '[gcTooltip]',
    standalone: true,
})
export class GcTooltipDirective implements OnDestroy {
    public readonly gcTooltip = input('');

    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);
    private tip: HTMLElement | null = null;
    private showTimer: ReturnType<typeof setTimeout> | null = null;

    @HostListener('mouseenter')
    @HostListener('focus')
    protected onEnter(): void {
        this.clearTimer();
        this.showTimer = setTimeout(() => this.show(), SHOW_DELAY_MS);
    }

    @HostListener('mouseleave')
    @HostListener('blur')
    protected onLeave(): void {
        this.hide();
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    protected onViewportChange(): void {
        this.hide();
    }

    public ngOnDestroy(): void {
        this.hide();
    }

    private show(): void {
        const text = this.gcTooltip().trim();
        if (!text || this.tip) {
            return;
        }

        ensureStyles();

        const tip = this.renderer.createElement('div') as HTMLElement;
        this.renderer.addClass(tip, 'gc-tooltip');
        this.renderer.setAttribute(tip, 'role', 'tooltip');
        this.renderer.appendChild(tip, this.renderer.createText(text));
        this.renderer.appendChild(document.body, tip);
        this.tip = tip;
        this.position(tip);
    }

    private position(tip: HTMLElement): void {
        const rect = this.host.nativeElement.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        const gap = 8;
        let top = rect.bottom + gap;
        let placement: 'top' | 'bottom' = 'bottom';

        if (top + tipRect.height > window.innerHeight - 8) {
            top = rect.top - tipRect.height - gap;
            placement = 'top';
        }

        const left = Math.min(
            Math.max(8, rect.left + rect.width / 2 - tipRect.width / 2),
            window.innerWidth - tipRect.width - 8,
        );

        this.renderer.setStyle(tip, 'top', `${Math.max(8, top)}px`);
        this.renderer.setStyle(tip, 'left', `${left}px`);
        this.renderer.addClass(tip, `gc-tooltip--${placement}`);
    }

    private hide(): void {
        this.clearTimer();
        if (!this.tip) {
            return;
        }

        this.renderer.removeChild(document.body, this.tip);
        this.tip = null;
    }

    private clearTimer(): void {
        if (this.showTimer !== null) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }
}

function ensureStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.gc-tooltip {
    position: fixed;
    z-index: 10000;
    padding: 0.4rem 0.75rem;
    border-radius: 0.25rem;
    background: var(--gc-tooltip-bg, #1a2138);
    color: var(--gc-tooltip-fg, #fff);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0.01em;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 0.5rem 1rem 0 rgba(0, 0, 0, 0.35);
}
.gc-tooltip--bottom::before,
.gc-tooltip--top::before {
    content: '';
    position: absolute;
    left: 50%;
    border: 5px solid transparent;
    transform: translateX(-50%);
}
.gc-tooltip--bottom::before {
    bottom: 100%;
    border-bottom-color: var(--gc-tooltip-bg, #1a2138);
}
.gc-tooltip--top::before {
    top: 100%;
    border-top-color: var(--gc-tooltip-bg, #1a2138);
}
`;
    document.head.appendChild(style);
}
