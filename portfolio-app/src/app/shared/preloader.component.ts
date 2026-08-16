import { Component, OnDestroy, OnInit } from '@angular/core';

import { portfolioData } from '../portfolio-data';

const SESSION_KEY = 'pf-preloader-shown';
/** Absolute ceiling — whatever else happens, the site must be reachable by this point. */
const HARD_TIMEOUT_MS = 3000;
/** Reduced motion: brief static appearance, then instant removal (no animated exit). */
const REDUCED_MOTION_HOLD_MS = 400;
const ANIMATE_IN_DELAY_MS = 60;
const HOLD_MS = 1900;
const EXIT_DURATION_MS = 550;

/**
 * Full-screen intro overlay shown once per browser session on first load:
 * profile photo + name animate in, a progress bar fills, then the whole
 * thing slides up to reveal the page. Purely decorative (aria-hidden, no
 * focusable content), so there is nothing to focus-trap. A hard timeout
 * guarantees it is never stuck on screen even if something goes wrong.
 */
@Component({
  selector: 'app-preloader',
  standalone: true,
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss',
})
export class PreloaderComponent implements OnInit, OnDestroy {
  private readonly motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  readonly name = portfolioData.hero.name;
  readonly initials = portfolioData.hero.name.charAt(0);
  readonly profileImageUrl = portfolioData.hero.profileImageUrl;

  visible = false;
  animateIn = false;
  exiting = false;
  imageFailed = false;

  ngOnInit(): void {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      return;
    }

    this.visible = true;
    document.body.classList.add('pf-no-scroll');

    // Absolute safety net: never trap the user, regardless of what else happens.
    this.timers.push(setTimeout(() => this.dismiss(), HARD_TIMEOUT_MS));

    if (this.motionQuery.matches) {
      this.timers.push(setTimeout(() => this.hardRemove(), REDUCED_MOTION_HOLD_MS));
      return;
    }

    this.timers.push(setTimeout(() => (this.animateIn = true), ANIMATE_IN_DELAY_MS));
    this.timers.push(setTimeout(() => this.dismiss(), HOLD_MS));
  }

  ngOnDestroy(): void {
    this.clearTimers();
    document.body.classList.remove('pf-no-scroll');
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  /** Plays the slide-up wipe, then fully removes the overlay. */
  private dismiss(): void {
    if (this.exiting || !this.visible) {
      return;
    }
    this.exiting = true;
    this.clearTimers();
    this.timers.push(setTimeout(() => this.hardRemove(), EXIT_DURATION_MS));
  }

  /** Immediate removal with no exit transition (used by the reduced-motion path). */
  private hardRemove(): void {
    this.clearTimers();
    this.visible = false;
    document.body.classList.remove('pf-no-scroll');
    sessionStorage.setItem(SESSION_KEY, '1');
  }

  private clearTimers(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.length = 0;
  }
}
