import { Injectable, computed, signal } from '@angular/core';

export interface PointerPosition {
  clientX: number;
  clientY: number;
  active: boolean;
}

const THROTTLE_MS = 16;

/**
 * Single shared `window.mousemove` listener (ref-counted across
 * consumers, never duplicated) driving the hero's interactive background
 * effects — particle repulsion/connector-lines and the parallax shift on
 * both background layers.
 *
 * Listener attachment is skipped entirely on coarse-pointer (touch)
 * devices. `enabled` additionally folds in prefers-reduced-motion —
 * consumers should gate their actual visual effects on `enabled()`, which
 * stays reactive even though pointer capability is checked once.
 */
@Injectable({ providedIn: 'root' })
export class PointerParallaxService {
  private readonly hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly prefersReducedMotion = signal(this.motionQuery.matches);

  readonly enabled = computed(() => this.hasFinePointer && !this.prefersReducedMotion());
  readonly pointer = signal<PointerPosition>({ clientX: 0, clientY: 0, active: false });

  private subscriberCount = 0;
  private lastUpdate = 0;

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion.set(event.matches);
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    const now = performance.now();
    if (now - this.lastUpdate < THROTTLE_MS) {
      return;
    }
    this.lastUpdate = now;
    this.pointer.set({ clientX: event.clientX, clientY: event.clientY, active: true });
  };

  private readonly onPointerLeave = (): void => {
    this.pointer.update((p) => ({ ...p, active: false }));
  };

  constructor() {
    this.motionQuery.addEventListener('change', this.onMotionChange);
  }

  /** Call in ngOnInit; call the returned function in ngOnDestroy. */
  subscribe(): () => void {
    if (!this.hasFinePointer) {
      return () => {};
    }

    if (this.subscriberCount === 0) {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', this.onPointerLeave);
    }
    this.subscriberCount++;

    return () => {
      this.subscriberCount = Math.max(0, this.subscriberCount - 1);
      if (this.subscriberCount === 0) {
        window.removeEventListener('mousemove', this.onMouseMove);
        document.documentElement.removeEventListener('mouseleave', this.onPointerLeave);
      }
    };
  }
}
