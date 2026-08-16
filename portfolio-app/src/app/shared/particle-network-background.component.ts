import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';

import { PointerParallaxService, PointerPosition } from '../core/pointer-parallax.service';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const MIN_PARTICLES = 18;
const MAX_PARTICLES = 70;
const PARTICLE_AREA_DIVISOR = 16000;
const PARTICLE_SPEED = 0.18;
const PARTICLE_RADIUS = 1.8;
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

// Interactive cursor effects — kept subtle: a small repulsion nudge near
// the pointer, thin connector lines to nearby particles, and a gentle
// whole-layer parallax shift. (The cursor itself now has its own dedicated
// visual treatment in CustomCursorComponent, so no glow is drawn here.)
const CURSOR_REPEL_RADIUS = 90;
const CURSOR_REPEL_STRENGTH = 16;
const CURSOR_CONNECT_RADIUS = 150;
const PARALLAX_MAX_SHIFT_PX = 14;

/**
 * Slow-drifting particle/constellation network rendered on a <canvas>, sat
 * as the base layer behind the hero's typed-code effect. Reads
 * --pf-primary-rgb from the current theme so it matches light/dark mode
 * without needing a ThemeService dependency. Also reacts to the cursor
 * (repulsion, connector lines, glow, parallax) via PointerParallaxService,
 * gated on a fine pointer + prefers-reduced-motion.
 */
@Component({
  selector: 'app-particle-network-background',
  standalone: true,
  template: `<canvas #canvas class="pf-particle-bg__canvas"></canvas>`,
  styleUrl: './particle-network-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ParticleNetworkBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly pointerService = inject(PointerParallaxService);
  private unsubscribePointer: (() => void) | null = null;

  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private prefersReducedMotion = false;
  private primaryRgb = '103, 80, 164';

  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Watches <html class="dark-theme"> so the static (reduced-motion) frame
  // repaints with the new palette even though no rAF loop is running to
  // pick it up naturally.
  private readonly themeObserver = new MutationObserver(() => {
    if (this.prefersReducedMotion) {
      this.render();
    }
  });

  private readonly onResize = (): void => {
    this.resize();
    if (this.prefersReducedMotion) {
      this.render();
    }
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.stop();
    } else if (!this.prefersReducedMotion) {
      this.start();
    }
  };

  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion = event.matches;
    if (this.prefersReducedMotion) {
      this.stop();
      this.render();
    } else {
      this.start();
    }
  };

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    this.ctx = ctx;
    this.prefersReducedMotion = this.motionQuery.matches;

    this.resize();
    this.initParticles();

    this.unsubscribePointer = this.pointerService.subscribe();
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.addEventListener('change', this.onMotionPreferenceChange);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (this.prefersReducedMotion) {
      this.render();
    } else {
      this.start();
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.unsubscribePointer?.();
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.removeEventListener('change', this.onMotionPreferenceChange);
    this.themeObserver.disconnect();
  }

  private resize(): void {
    if (!this.ctx) {
      return;
    }
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(rect.width, 1);
    this.height = Math.max(rect.height, 1);

    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width * this.dpr;
    canvas.height = this.height * this.dpr;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    for (const particle of this.particles) {
      particle.x = Math.min(particle.x, this.width);
      particle.y = Math.min(particle.y, this.height);
    }
  }

  private initParticles(): void {
    const area = this.width * this.height;
    const count = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.floor(area / PARTICLE_AREA_DIVISOR)));
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * PARTICLE_SPEED,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED,
    }));
  }

  private start(): void {
    if (this.animationFrameId !== null || !this.ctx) {
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
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < FRAME_INTERVAL_MS) {
      return;
    }
    this.lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL_MS);
    this.updateParticles();
    this.render();
  };

  private updateParticles(): void {
    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x <= 0 || particle.x >= this.width) {
        particle.vx *= -1;
        particle.x = Math.min(Math.max(particle.x, 0), this.width);
      }
      if (particle.y <= 0 || particle.y >= this.height) {
        particle.vy *= -1;
        particle.y = Math.min(Math.max(particle.y, 0), this.height);
      }
    }
  }

  private render(): void {
    const { ctx } = this;
    if (!ctx) {
      return;
    }

    const value = getComputedStyle(document.documentElement).getPropertyValue('--pf-primary-rgb').trim();
    if (value) {
      this.primaryRgb = value;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.classList.contains('dark-theme');
    const dotAlpha = isDark ? 0.42 : 0.3;
    const lineAlpha = isDark ? 0.16 : 0.1;
    const maxLineDistance = Math.min(140, Math.max(90, this.width / 9));

    const cursorActive = this.pointerService.enabled() && this.pointerService.pointer().active;
    const pointer = cursorActive ? this.pointerService.pointer() : null;

    this.applyParallax(pointer);

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < maxLineDistance) {
          const alpha = (1 - distance / maxLineDistance) * lineAlpha;
          ctx.strokeStyle = `rgba(${this.primaryRgb}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    const cursorLineAlphaBase = isDark ? 0.32 : 0.22;

    for (const particle of this.particles) {
      let displayX = particle.x;
      let displayY = particle.y;

      if (pointer) {
        const dx = particle.x - pointer.clientX;
        const dy = particle.y - pointer.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Gentle repulsion: a purely visual nudge computed fresh each
        // frame from the current distance — never stored, so it can't
        // accumulate and always relaxes back the instant the cursor moves on.
        if (distance < CURSOR_REPEL_RADIUS && distance > 0.01) {
          const strength = (1 - distance / CURSOR_REPEL_RADIUS) * CURSOR_REPEL_STRENGTH;
          displayX += (dx / distance) * strength;
          displayY += (dy / distance) * strength;
        }

        if (distance < CURSOR_CONNECT_RADIUS) {
          const alpha = (1 - distance / CURSOR_CONNECT_RADIUS) * cursorLineAlphaBase;
          ctx.strokeStyle = `rgba(${this.primaryRgb}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(displayX, displayY);
          ctx.lineTo(pointer.clientX, pointer.clientY);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${this.primaryRgb}, ${dotAlpha})`;
      ctx.arc(displayX, displayY, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Subtle whole-layer depth shift, driven by cursor offset from viewport center. */
  private applyParallax(pointer: PointerPosition | null): void {
    const canvas = this.canvasRef.nativeElement;
    if (!pointer) {
      canvas.style.transform = '';
      return;
    }
    const offsetX = (pointer.clientX / this.width - 0.5) * 2;
    const offsetY = (pointer.clientY / this.height - 0.5) * 2;
    const shiftX = (offsetX * PARALLAX_MAX_SHIFT_PX).toFixed(2);
    const shiftY = (offsetY * PARALLAX_MAX_SHIFT_PX).toFixed(2);
    canvas.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
  }
}
