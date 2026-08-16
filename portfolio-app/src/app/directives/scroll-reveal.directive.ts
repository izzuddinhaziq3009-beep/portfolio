import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

/**
 * Emits `true` once when the host element first enters the viewport, so a
 * host component can drive its `[@reveal]` binding. Respects
 * prefers-reduced-motion by firing immediately without observing.
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Output() readonly appScrollRevealChange = new EventEmitter<boolean>();

  private observer?: IntersectionObserver;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Defer past the current change-detection pass — emitting synchronously
      // here would mutate the parent's `[@reveal]` binding after Angular has
      // already checked it in this same tick (NG0100).
      queueMicrotask(() => this.appScrollRevealChange.emit(true));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.appScrollRevealChange.emit(true);
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
