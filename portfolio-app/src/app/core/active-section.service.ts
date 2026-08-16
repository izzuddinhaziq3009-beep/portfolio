import { Injectable, signal } from '@angular/core';

/**
 * Tracks which page section is currently most visible, so the navbar can
 * highlight the corresponding link. Sections register themselves via
 * `observe()` and are compared by intersection ratio.
 */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  readonly activeFragment = signal<string>('home');

  private readonly ratios = new Map<string, number>();
  private observer?: IntersectionObserver;

  observe(element: HTMLElement, fragment: string): () => void {
    if (!('IntersectionObserver' in window)) {
      return () => {};
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset['fragment'];
            if (id) {
              this.ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
            }
          }
          this.pickActive();
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
    }

    element.dataset['fragment'] = fragment;
    this.observer.observe(element);

    return () => this.observer?.unobserve(element);
  }

  private pickActive(): void {
    let best: string | null = null;
    let bestRatio = 0;
    for (const [fragment, ratio] of this.ratios) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = fragment;
      }
    }
    if (best) {
      this.activeFragment.set(best);
    }
  }
}
