import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

import { CursorVariant, CustomCursorService } from '../core/custom-cursor.service';

/**
 * Marks an element as a target for the custom cursor's magnetic/hover
 * behavior (nav links, buttons, project cards, social icons). Reports its
 * bounding rect to CustomCursorService on hover so the cursor ring can
 * grow and ease toward the element's center; the element's own `:hover`
 * CSS (lift, shadow, etc.) keeps working unmodified.
 *
 * Usage: `<a appMagneticCursor="text">` or `<a appMagneticCursor>` (defaults to 'default').
 */
@Directive({
  selector: '[appMagneticCursor]',
  standalone: true,
})
export class MagneticCursorDirective {
  @Input('appMagneticCursor') variant: CursorVariant | '' = 'default';

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cursorService = inject(CustomCursorService);
  private token = 0;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.token = this.cursorService.setHover(rect, this.variant || 'default');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.cursorService.clearHover(this.token);
  }
}
