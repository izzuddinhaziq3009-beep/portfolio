import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
} from '@angular/core';

import { PointerParallaxService } from '../core/pointer-parallax.service';
import { SHORT_SNIPPETS } from './code-snippets';

// Slightly less shift than the particle layer behind it, so the two
// backdrops separate into a subtle sense of depth rather than moving as one.
const PARALLAX_MAX_SHIFT_PX = 9;

type TokenClass = 'keyword' | 'string' | 'comment' | 'type' | 'fn' | 'tag' | 'plain';

interface CodeToken {
  text: string;
  cls: TokenClass;
}

const KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'async', 'await',
  'return', 'class', 'extends', 'implements', 'interface', 'type', 'readonly',
  'private', 'public', 'protected', 'static', 'new', 'this', 'typeof', 'instanceof',
  'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'throw', 'null',
  'undefined', 'true', 'false', 'void', 'as', 'in', 'of', 'get', 'set',
]);

// Small hand-rolled lexer: tried in order, first match at the current
// position wins. Good enough for convincing decorative highlighting across
// TS/JS/HTML/CSS snippets — not a correct per-language parser.
const RULES: ReadonlyArray<{ regex: RegExp; cls: TokenClass }> = [
  { regex: /^\/\/.*/, cls: 'comment' },
  { regex: /^<!--.*?-->/, cls: 'comment' },
  { regex: /^(['"`])(?:\\.|(?!\1).)*\1/, cls: 'string' },
  { regex: /^<\/?[A-Za-z][\w-]*/, cls: 'tag' },
  { regex: /^[A-Z][A-Za-z0-9_]*/, cls: 'type' },
  { regex: /^[a-zA-Z_$][\w$]*(?=\()/, cls: 'fn' },
  { regex: /^[a-zA-Z_$][\w$]*/, cls: 'plain' },
  { regex: /^\d+(\.\d+)?/, cls: 'plain' },
  { regex: /^\s+/, cls: 'plain' },
  { regex: /^./, cls: 'plain' },
];

function tokenizeLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let rest = line;
  while (rest.length > 0) {
    let matchedRule = false;
    for (const rule of RULES) {
      const match = rule.regex.exec(rest);
      if (match && match[0].length > 0) {
        let cls = rule.cls;
        if (cls === 'plain' && KEYWORDS.has(match[0])) {
          cls = 'keyword';
        }
        tokens.push({ text: match[0], cls });
        rest = rest.slice(match[0].length);
        matchedRule = true;
        break;
      }
    }
    if (!matchedRule) {
      tokens.push({ text: rest[0], cls: 'plain' });
      rest = rest.slice(1);
    }
  }
  return tokens;
}

const CHAR_DELAY_MS = 32;
const CHAR_DELAY_JITTER_MS = 26;
const LINE_PAUSE_MS = 220;
const HOLD_MS = 1300;
const HOLD_JITTER_MS = 500;
const FADE_MS = 450;
const GAP_MS = 350;
const GAP_JITTER_MS = 550;
const HIDDEN_RETRY_MS = 400;
const BASE_OPACITY = 0.17;

/**
 * Rectangle (percent of the hero area) roughly matching where the hero
 * text column sits, with margin. Random spawn positions avoid landing
 * inside it so a snippet never renders directly behind the heading/CTAs.
 */
const FORBIDDEN_ZONE = { xMin: 8, xMax: 64, yMin: 22, yMax: 78 };
const EDGE_MARGIN = 3;
const MAX_SAMPLE_ATTEMPTS = 12;

function samplePosition(xRange: readonly [number, number]): { xPct: number; yPct: number } {
  for (let attempt = 0; attempt < MAX_SAMPLE_ATTEMPTS; attempt++) {
    const xPct = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
    const yPct = EDGE_MARGIN + Math.random() * (100 - EDGE_MARGIN * 2 - 12);
    const insideForbidden =
      xPct > FORBIDDEN_ZONE.xMin && xPct < FORBIDDEN_ZONE.xMax && yPct > FORBIDDEN_ZONE.yMin && yPct < FORBIDDEN_ZONE.yMax;
    if (!insideForbidden) {
      return { xPct, yPct };
    }
  }
  // Fallback if every attempt landed inside the forbidden band: pin to the
  // strip just above or below it, still within the requested x range.
  const xPct = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
  const yPct = Math.random() < 0.5 ? EDGE_MARGIN + Math.random() * 12 : 84 + Math.random() * (12 - EDGE_MARGIN);
  return { xPct, yPct };
}

function pickSnippet(): readonly string[] {
  return SHORT_SNIPPETS[Math.floor(Math.random() * SHORT_SNIPPETS.length)];
}

function buildStaticSnippet(container: HTMLElement, xRange: readonly [number, number]): void {
  const { xPct, yPct } = samplePosition(xRange);
  const pre = document.createElement('pre');
  pre.className = 'pf-code-bg__pre';
  pre.style.left = `${xPct}%`;
  pre.style.top = `${yPct}%`;
  pre.style.setProperty('--pf-code-block-opacity', String(BASE_OPACITY));
  pre.style.opacity = '1';

  const code = document.createElement('code');
  code.className = 'pf-code-bg__code';
  for (const line of pickSnippet()) {
    const lineEl = document.createElement('div');
    lineEl.className = 'pf-code-bg__line';
    for (const token of tokenizeLine(line)) {
      const span = document.createElement('span');
      span.className = `pf-code-bg__tok pf-code-bg__tok--${token.cls}`;
      span.textContent = token.text;
      lineEl.appendChild(span);
    }
    code.appendChild(lineEl);
  }
  pre.appendChild(code);
  container.appendChild(pre);
}

/**
 * Drives a single slot's lifecycle: spawn at a random (non-central)
 * position, type one short snippet character-by-character, hold with a
 * blinking cursor, fade out, remove, then spawn again elsewhere. Only one
 * snippet is ever alive per slot, so nothing can pile up.
 */
class CodeSnippetSlot {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private el: HTMLElement | null = null;
  private codeEl: HTMLElement | null = null;
  private lineEl: HTMLElement | null = null;
  private tokenEl: HTMLElement | null = null;
  private cursorEl: HTMLElement | null = null;
  private lines: readonly string[] = [];
  private lineIndex = 0;
  private tokens: CodeToken[] = [];
  private tokenIndex = 0;
  private charIndex = 0;

  constructor(
    private readonly container: HTMLElement,
    private readonly xRange: readonly [number, number],
    private readonly isVisible: () => boolean,
  ) {}

  start(initialDelay: number): void {
    this.timerId = setTimeout(() => this.spawn(), initialDelay);
  }

  destroy(): void {
    this.clearTimer();
    this.el?.remove();
    this.el = null;
  }

  private spawn(): void {
    if (this.guardHidden(() => this.spawn())) {
      return;
    }

    const { xPct, yPct } = samplePosition(this.xRange);

    this.el = document.createElement('pre');
    this.el.className = 'pf-code-bg__pre';
    this.el.style.left = `${xPct}%`;
    this.el.style.top = `${yPct}%`;
    this.el.style.setProperty('--pf-code-block-opacity', String(BASE_OPACITY * (0.85 + Math.random() * 0.3)));
    this.el.style.setProperty('--pf-code-font-scale', String(0.9 + Math.random() * 0.25));
    this.el.style.opacity = '0';

    this.codeEl = document.createElement('code');
    this.codeEl.className = 'pf-code-bg__code';
    this.el.appendChild(this.codeEl);
    this.container.appendChild(this.el);

    // Flip to the target opacity on the next frame so the stylesheet's
    // opacity transition actually animates the fade-in from 0.
    requestAnimationFrame(() => {
      this.el?.style.removeProperty('opacity');
    });

    this.lines = pickSnippet();
    this.lineIndex = 0;
    this.cursorEl = document.createElement('span');
    this.cursorEl.className = 'pf-code-bg__cursor';

    this.beginLine();
    this.typeNextChar();
  }

  private beginLine(): void {
    this.lineEl = document.createElement('div');
    this.lineEl.className = 'pf-code-bg__line';
    this.codeEl!.appendChild(this.lineEl);
    this.lineEl.appendChild(this.cursorEl!);

    const text = this.lines[this.lineIndex] ?? '';
    this.tokens = text.length > 0 ? tokenizeLine(text) : [];
    this.tokenIndex = 0;
    this.charIndex = 0;
    this.tokenEl = null;
  }

  private typeNextChar(): void {
    if (this.guardHidden(() => this.typeNextChar())) {
      return;
    }

    if (this.tokens.length === 0) {
      this.finishLine();
      return;
    }

    const token = this.tokens[this.tokenIndex];
    if (!this.tokenEl) {
      this.tokenEl = document.createElement('span');
      this.tokenEl.className = `pf-code-bg__tok pf-code-bg__tok--${token.cls}`;
      this.lineEl!.insertBefore(this.tokenEl, this.cursorEl);
    }

    this.charIndex++;
    this.tokenEl.textContent = token.text.slice(0, this.charIndex);

    if (this.charIndex >= token.text.length) {
      this.tokenEl = null;
      this.charIndex = 0;
      this.tokenIndex++;
    }

    if (this.tokenIndex >= this.tokens.length) {
      this.finishLine();
      return;
    }

    this.timerId = setTimeout(
      () => this.typeNextChar(),
      CHAR_DELAY_MS + Math.random() * CHAR_DELAY_JITTER_MS,
    );
  }

  private finishLine(): void {
    if (this.guardHidden(() => this.finishLine())) {
      return;
    }

    this.lineIndex++;
    if (this.lineIndex >= this.lines.length) {
      this.timerId = setTimeout(() => this.beginFade(), HOLD_MS + Math.random() * HOLD_JITTER_MS);
      return;
    }

    this.timerId = setTimeout(() => {
      this.beginLine();
      this.typeNextChar();
    }, LINE_PAUSE_MS);
  }

  private beginFade(): void {
    if (this.guardHidden(() => this.beginFade())) {
      return;
    }
    if (this.el) {
      this.el.style.opacity = '0';
    }
    this.timerId = setTimeout(() => this.despawn(), FADE_MS);
  }

  private despawn(): void {
    this.el?.remove();
    this.el = null;
    this.codeEl = null;
    this.lineEl = null;
    this.tokenEl = null;
    this.cursorEl = null;
    this.timerId = setTimeout(() => this.spawn(), GAP_MS + Math.random() * GAP_JITTER_MS);
  }

  /** Pauses the cycle while the tab is hidden by re-polling instead of progressing. */
  private guardHidden(retry: () => void): boolean {
    if (!this.isVisible()) {
      this.timerId = setTimeout(retry, HIDDEN_RETRY_MS);
      return true;
    }
    return false;
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

/**
 * Renders one or two short code snippets that appear at random
 * (non-central) positions in the hero, type out, hold, and fade — one at
 * a time per slot, so nothing ever overlaps or piles up. Pure DOM + CSS:
 * colors come from `--pf-primary-rgb` / `--pf-text-rgb` custom properties,
 * so light/dark theme switching needs no JS re-render.
 *
 * Encapsulation is disabled: the snippet DOM (lines, tokens, cursor) is
 * built imperatively via `document.createElement`, not Angular's template
 * compiler, so those nodes never receive the `_ngcontent-*` attribute
 * Emulated encapsulation relies on to scope styles — every rule below
 * would silently fail to match them otherwise. Class names are prefixed
 * (`pf-code-bg__*`) to avoid collisions now that the styles are global.
 */
@Component({
  selector: 'app-code-typewriter-background',
  standalone: true,
  template: `<div #container class="pf-code-bg__container"></div>`,
  styleUrl: './code-typewriter-background.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class CodeTypewriterBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) private readonly containerRef!: ElementRef<HTMLElement>;

  private readonly pointerService = inject(PointerParallaxService);
  private unsubscribePointer: (() => void) | null = null;

  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private prefersReducedMotion = this.motionQuery.matches;
  private visible = !document.hidden;
  private slots: CodeSnippetSlot[] = [];
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly onVisibilityChange = (): void => {
    this.visible = !document.hidden;
  };

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion = event.matches;
    this.rebuild();
  };

  private readonly onResize = (): void => {
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
    }
    this.resizeTimer = setTimeout(() => this.rebuild(), 300);
  };

  constructor() {
    // Parallax shift for this layer. Not inside a rAF loop like the
    // particle canvas, so a CSS transition (see .pf-code-bg__container)
    // smooths the throttled position updates instead.
    effect(() => {
      const container = this.containerRef?.nativeElement;
      if (!container) {
        return;
      }
      const pointer = this.pointerService.pointer();
      if (!this.pointerService.enabled() || !pointer.active) {
        container.style.transform = '';
        return;
      }
      const offsetX = (pointer.clientX / window.innerWidth - 0.5) * 2;
      const offsetY = (pointer.clientY / window.innerHeight - 0.5) * 2;
      const shiftX = (offsetX * PARALLAX_MAX_SHIFT_PX).toFixed(2);
      const shiftY = (offsetY * PARALLAX_MAX_SHIFT_PX).toFixed(2);
      container.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });
  }

  ngOnInit(): void {
    this.unsubscribePointer = this.pointerService.subscribe();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.addEventListener('change', this.onMotionChange);
    window.addEventListener('resize', this.onResize, { passive: true });
    this.rebuild();
  }

  ngOnDestroy(): void {
    this.destroySlots();
    this.unsubscribePointer?.();
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.removeEventListener('change', this.onMotionChange);
    window.removeEventListener('resize', this.onResize);
  }

  private rebuild(): void {
    this.destroySlots();
    const container = this.containerRef.nativeElement;
    container.replaceChildren();

    const width = window.innerWidth;
    const useTwoSlots = width >= 900;
    // Each slot is confined to its own half so two concurrent snippets can
    // never land on top of each other, even in the worst case timing.
    const ranges: ReadonlyArray<[number, number]> = useTwoSlots
      ? [
          [2, 46],
          [54, 97],
        ]
      : [[2, 97]];

    if (this.prefersReducedMotion) {
      for (const range of ranges) {
        buildStaticSnippet(container, range);
      }
      return;
    }

    for (const range of ranges) {
      const slot = new CodeSnippetSlot(container, range, () => this.visible);
      slot.start(Math.random() * 1200);
      this.slots.push(slot);
    }
  }

  private destroySlots(): void {
    for (const slot of this.slots) {
      slot.destroy();
    }
    this.slots = [];
  }
}
