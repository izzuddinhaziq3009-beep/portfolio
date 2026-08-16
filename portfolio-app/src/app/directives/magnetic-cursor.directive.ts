import { Directive, HostListener, Input, inject } from '@angular/core';

import { CursorVariant, CustomCursorService } from '../core/custom-cursor.service';

/**
 * Marks an element as a target for the custom cursor's hover affordance
 * (nav links, buttons, project cards, social icons): while hovered, the
 * cursor grows/glows per `variant`, but always keeps tracking the real
 * pointer position — it never moves to or centers on the element. The
 * element's own `:hover` CSS (lift, shadow, etc.) keeps working unmodified.
 *
 * Usage: `<a appMagneticCursor="text">` or `<a appMagneticCursor>` (defaults to 'default').
 */
@Directive({
  selector: '[appMagneticCursor]',
  standalone: true,
})
export class MagneticCursorDirective {
  @Input('appMagneticCursor') variant: CursorVariant | '' = 'default';

  private readonly cursorService = inject(CustomCursorService);
  private token = 0;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.token = this.cursorService.setHover(this.variant || 'default');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.cursorService.clearHover(this.token);
  }
}
