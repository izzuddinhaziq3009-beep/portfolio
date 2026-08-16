import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

import { ActiveSectionService } from '../core/active-section.service';

/**
 * Registers the host `<section>` with `ActiveSectionService` so the navbar
 * can highlight the corresponding link while it is in view.
 */
@Directive({
  selector: '[appSection]',
  standalone: true,
})
export class SectionObserverDirective implements OnInit, OnDestroy {
  @Input('appSection') fragment = '';

  private stopObserving?: () => void;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly activeSection: ActiveSectionService,
  ) {}

  ngOnInit(): void {
    if (this.fragment) {
      this.stopObserving = this.activeSection.observe(this.host.nativeElement, this.fragment);
    }
  }

  ngOnDestroy(): void {
    this.stopObserving?.();
  }
}
