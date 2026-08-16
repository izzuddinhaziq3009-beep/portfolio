import { animate, state, style, transition, trigger } from '@angular/animations';

/**
 * Shared fade + slide-up reveal, driven by ScrollRevealDirective toggling
 * between the 'hidden' and 'visible' states as elements enter the viewport.
 */
export const revealAnimation = trigger('reveal', [
  state('hidden', style({ opacity: 0, transform: 'translateY(24px)' })),
  state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
  transition('hidden => visible', animate('560ms cubic-bezier(0.22, 1, 0.36, 1)')),
]);
