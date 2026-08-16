import { Injectable, signal } from '@angular/core';

/**
 * 'card-action' is for small interactive elements (links/buttons) nested
 * inside a 'card'-variant container — e.g. the "Live Demo"/"Code / GitHub"
 * links inside a project card. It shows the same hover glow as 'text' but
 * skips the magnetic position pull, so the cursor keeps tracking the real
 * pointer exactly instead of easing toward the target's center — that pull
 * is what made those small nested buttons feel hard to click.
 */
export type CursorVariant = 'default' | 'text' | 'card' | 'card-action';

export interface CursorHoverTarget {
  rect: DOMRect;
  variant: CursorVariant;
}

/**
 * Bridges MagneticCursorDirective instances (scattered across nav links,
 * buttons, cards, social icons) to the single CustomCursorComponent. Each
 * hover registration gets a token so a stale mouseleave can't clobber a
 * newer mouseenter if the pointer crosses two elements in the same tick.
 */
@Injectable({ providedIn: 'root' })
export class CustomCursorService {
  readonly hoverTarget = signal<CursorHoverTarget | null>(null);

  private currentToken = 0;

  setHover(rect: DOMRect, variant: CursorVariant): number {
    const token = ++this.currentToken;
    this.hoverTarget.set({ rect, variant });
    return token;
  }

  clearHover(token: number): void {
    if (token === this.currentToken) {
      this.hoverTarget.set(null);
    }
  }
}
