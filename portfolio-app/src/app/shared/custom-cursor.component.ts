import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
} from '@angular/core';

import { CustomCursorService } from '../core/custom-cursor.service';
import { PointerParallaxService } from '../core/pointer-parallax.service';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
}

// The arrow's SVG viewBox is 24x24 with its tip drawn at (4, 3). The wrapper
// element is pinned via `transform-origin` set to that same point (in
// rendered px), so translate/rotate/scale all pivot around the tip — it
// stays exactly under the pointer no matter how the arrow grows or leans.
const ARROW_SIZE = 30;
const ARROW_TIP_X = ARROW_SIZE * (4 / 24);
const ARROW_TIP_Y = ARROW_SIZE * (3 / 24);

const ARROW_BASE_SCALE = 1;
const ARROW_HOVER_SCALE = 1.2;
const ARROW_CARD_SCALE = 1.45;
const ARROW_SCALE_EASE = 0.22;
const ARROW_MAGNET_EASE = 0.16;

const ARROW_MAX_TILT_DEG = 16;
const ARROW_TILT_VELOCITY_FACTOR = 1.6;
const ARROW_TILT_EASE = 0.18;

const TRAIL_MAX_PARTICLES = 24;
const TRAIL_SPAWN_MIN_DIST = 9;
const TRAIL_PARTICLE_LIFE_MS = 320;
const TRAIL_ALPHA = 0.32;
const BURST_PARTICLE_COUNT = 14;
const BURST_PARTICLE_LIFE_MS = 550;

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Custom cursor: a designed SVG arrow whose tip sits exactly at the pointer
 * when idle, and magnetically eases toward + grows over elements marked
 * with [appMagneticCursor] (the "grab"). Leans subtly in the direction of
 * travel, morphs (scale + accent glow) on hover, and leaves a short particle
 * trail + click burst in the purple accent. Fully disabled on coarse-pointer
 * (touch) devices; shows a simple, static (no trail/tilt) arrow under
 * prefers-reduced-motion.
 */
@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  template: `
    @if (hasFinePointer) {
      <canvas #trailCanvas class="pf-cursor__trail"></canvas>
      <div #arrow class="pf-cursor__arrow">
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path
            class="pf-cursor__arrow-path"
            d="M4 3 L4 19.5 L8.2 15.6 L11.4 22.6 L14.6 21.1 L11.5 14.1 L17.3 14.1 Z"
          />
          <circle class="pf-cursor__arrow-accent" cx="14.6" cy="6.4" r="2" />
        </svg>
      </div>
    }
  `,
  styleUrl: './custom-cursor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class CustomCursorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('arrow') private readonly arrowRef?: ElementRef<HTMLElement>;
  @ViewChild('trailCanvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly pointerService = inject(PointerParallaxService);
  private readonly cursorService = inject(CustomCursorService);

  readonly hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private prefersReducedMotion = this.motionQuery.matches;

  private unsubscribePointer: (() => void) | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  private ctx: CanvasRenderingContext2D | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private primaryRgb = '103, 80, 164';

  private arrowX = 0;
  private arrowY = 0;
  private arrowScale = ARROW_BASE_SCALE;
  private arrowTilt = 0;

  private readonly trailParticles: TrailParticle[] = [];
  private lastTrailX = 0;
  private lastTrailY = 0;

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion = event.matches;
    if (this.prefersReducedMotion) {
      this.stop();
      this.trailParticles.length = 0;
      this.ctx?.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    } else {
      this.start();
    }
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.stop();
    } else if (!this.prefersReducedMotion) {
      this.start();
    }
  };

  private readonly onResize = (): void => {
    this.resizeCanvas();
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (this.prefersReducedMotion) {
      return;
    }
    this.spawnBurst(event.clientX, event.clientY);
  };

  constructor() {
    // Reduced-motion path: snap the arrow straight to the current pointer +
    // hover state with no easing, no tilt, no trail — driven off the
    // signals directly rather than the rAF loop.
    effect(() => {
      if (!this.hasFinePointer || !this.prefersReducedMotion) {
        return;
      }
      const pointer = this.pointerService.pointer();
      const hover = this.cursorService.hoverTarget();
      this.applyStaticFrame(pointer.clientX, pointer.clientY, pointer.active, hover);
    });
  }

  ngOnInit(): void {
    if (!this.hasFinePointer) {
      return;
    }

    document.documentElement.classList.add('pf-custom-cursor-active');
    this.unsubscribePointer = this.pointerService.subscribe();

    this.motionQuery.addEventListener('change', this.onMotionChange);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('click', this.onClick, { passive: true });
  }

  ngAfterViewInit(): void {
    if (!this.hasFinePointer) {
      return;
    }

    // The cursor's DOM sits behind an `@if`, so these ViewChild refs only
    // resolve here — not in ngOnInit — hence canvas + transform-origin
    // setup happens in this hook instead.
    const canvas = this.canvasRef?.nativeElement;
    this.ctx = canvas?.getContext('2d') ?? null;
    this.resizeCanvas();

    const arrow = this.arrowRef?.nativeElement;
    if (arrow) {
      arrow.style.transformOrigin = `${ARROW_TIP_X}px ${ARROW_TIP_Y}px`;
    }

    if (!this.prefersReducedMotion) {
      this.start();
    }
  }

  ngOnDestroy(): void {
    if (!this.hasFinePointer) {
      return;
    }
    this.stop();
    this.unsubscribePointer?.();
    document.documentElement.classList.remove('pf-custom-cursor-active');
    this.motionQuery.removeEventListener('change', this.onMotionChange);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('click', this.onClick);
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    canvas.width = this.canvasWidth * dpr;
    canvas.height = this.canvasHeight * dpr;
    canvas.style.width = `${this.canvasWidth}px`;
    canvas.style.height = `${this.canvasHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private start(): void {
    if (this.animationFrameId !== null) {
      return;
    }
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private readonly loop = (timestamp: number): void => {
    this.animationFrameId = requestAnimationFrame(this.loop);
    const deltaMs = this.lastFrameTime ? timestamp - this.lastFrameTime : 16;
    this.lastFrameTime = timestamp;

    const arrow = this.arrowRef?.nativeElement;
    if (!arrow) {
      return;
    }

    const value = getComputedStyle(document.documentElement).getPropertyValue('--pf-primary-rgb').trim();
    if (value) {
      this.primaryRgb = value;
    }

    const pointer = this.pointerService.pointer();
    const hover = this.cursorService.hoverTarget();

    arrow.style.opacity = pointer.active ? '1' : '0';

    // Exact pointer position when idle (ease factor 1 == instant snap);
    // magnetically eases toward the hovered element's center — the
    // "grab" — while hovering. 'card-action' targets (small buttons nested
    // inside a card) opt out of the pull entirely so the cursor never drifts
    // away from the real click point.
    const magnetic = !!hover && hover.variant !== 'card-action';
    const targetX = magnetic ? hover!.rect.left + hover!.rect.width / 2 : pointer.clientX;
    const targetY = magnetic ? hover!.rect.top + hover!.rect.height / 2 : pointer.clientY;
    const positionEase = magnetic ? ARROW_MAGNET_EASE : 1;

    const beforeX = this.arrowX;
    this.arrowX = lerp(this.arrowX, targetX, positionEase);
    this.arrowY = lerp(this.arrowY, targetY, positionEase);

    // Subtle lean in the direction of travel, derived from raw frame-to-frame
    // velocity (not the eased magnet position), clamped to a small range so
    // it reads as a lively lean rather than the arrow spinning to face travel.
    const velocityX = deltaMs > 0 ? (this.arrowX - beforeX) / deltaMs : 0;
    const targetTilt = clamp(velocityX * ARROW_TILT_VELOCITY_FACTOR * 16, -ARROW_MAX_TILT_DEG, ARROW_MAX_TILT_DEG);
    this.arrowTilt = lerp(this.arrowTilt, targetTilt, ARROW_TILT_EASE);

    const targetScale = !hover ? ARROW_BASE_SCALE : hover.variant === 'card' ? ARROW_CARD_SCALE : ARROW_HOVER_SCALE;
    this.arrowScale = lerp(this.arrowScale, targetScale, ARROW_SCALE_EASE);

    arrow.style.transform =
      `translate3d(${this.arrowX - ARROW_TIP_X}px, ${this.arrowY - ARROW_TIP_Y}px, 0) ` +
      `rotate(${this.arrowTilt.toFixed(2)}deg) scale(${this.arrowScale.toFixed(3)})`;
    arrow.classList.toggle('pf-cursor__arrow--active', !!hover);
    arrow.classList.toggle('pf-cursor__arrow--card', hover?.variant === 'card');

    if (pointer.active) {
      const dx = pointer.clientX - this.lastTrailX;
      const dy = pointer.clientY - this.lastTrailY;
      if (Math.hypot(dx, dy) > TRAIL_SPAWN_MIN_DIST) {
        this.spawnTrailParticle(pointer.clientX, pointer.clientY);
        this.lastTrailX = pointer.clientX;
        this.lastTrailY = pointer.clientY;
      }
    }

    this.updateAndDrawParticles(deltaMs);
  };

  private applyStaticFrame(
    x: number,
    y: number,
    active: boolean,
    hover: ReturnType<CustomCursorService['hoverTarget']>,
  ): void {
    const arrow = this.arrowRef?.nativeElement;
    if (!arrow) {
      return;
    }

    arrow.style.opacity = active ? '1' : '0';

    const magnetic = !!hover && hover.variant !== 'card-action';
    const cx = magnetic ? hover!.rect.left + hover!.rect.width / 2 : x;
    const cy = magnetic ? hover!.rect.top + hover!.rect.height / 2 : y;
    const scale = !hover ? ARROW_BASE_SCALE : hover.variant === 'card' ? ARROW_CARD_SCALE : ARROW_HOVER_SCALE;
    this.arrowX = cx;
    this.arrowY = cy;
    this.arrowScale = scale;
    this.arrowTilt = 0;
    arrow.style.transform = `translate3d(${cx - ARROW_TIP_X}px, ${cy - ARROW_TIP_Y}px, 0) scale(${scale})`;
    arrow.classList.toggle('pf-cursor__arrow--active', !!hover);
    arrow.classList.toggle('pf-cursor__arrow--card', hover?.variant === 'card');
  }

  private spawnTrailParticle(x: number, y: number): void {
    if (this.trailParticles.length >= TRAIL_MAX_PARTICLES) {
      this.trailParticles.shift();
    }
    this.trailParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      life: TRAIL_PARTICLE_LIFE_MS,
      maxLife: TRAIL_PARTICLE_LIFE_MS,
      radius: 1.2 + Math.random() * 0.8,
    });
  }

  private spawnBurst(x: number, y: number): void {
    for (let i = 0; i < BURST_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / BURST_PARTICLE_COUNT + Math.random() * 0.3;
      const speed = 1.2 + Math.random() * 1.6;
      this.trailParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: BURST_PARTICLE_LIFE_MS,
        maxLife: BURST_PARTICLE_LIFE_MS,
        radius: 2 + Math.random() * 1.5,
      });
    }
    const overflow = this.trailParticles.length - (TRAIL_MAX_PARTICLES + BURST_PARTICLE_COUNT);
    if (overflow > 0) {
      this.trailParticles.splice(0, overflow);
    }
  }

  private updateAndDrawParticles(deltaMs: number): void {
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const particle = this.trailParticles[i];
      particle.life -= deltaMs;
      if (particle.life <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.94;
      particle.vy *= 0.94;

      const alpha = (particle.life / particle.maxLife) * TRAIL_ALPHA;
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${this.primaryRgb}, ${alpha.toFixed(3)})`;
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
