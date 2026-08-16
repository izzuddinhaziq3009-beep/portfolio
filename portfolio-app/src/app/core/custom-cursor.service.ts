import { Injectable, signal } from '@angular/core';

export type CursorVariant = 'default' | 'text' | 'card';

export interface CursorHoverTarget {
  variant: CursorVariant;
}

/**
 * Bridges MagneticCursorDirective instances (scattered across nav links,
 * buttons, cards, social icons) to the single CustomCursorComponent. Each
 * hover registration gets a token so a stale mouseleave can't clobber a
 * newer mouseenter if the pointer crosses two elements in the same tick.
 * The cursor always tracks the real pointer position — hover only changes
 * its size/glow (see CustomCursorComponent), never its position.
 */
@Injectable({ providedIn: 'root' })
export class CustomCursorService {
  readonly hoverTarget = signal<CursorHoverTarget | null>(null);

  private currentToken = 0;

  setHover(variant: CursorVariant): number {
    const token = ++this.currentToken;
    this.hoverTarget.set({ variant });
    return token;
  }

  clearHover(token: number): void {
    if (token === this.currentToken) {
      this.hoverTarget.set(null);
    }
  }
}
