import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SectionObserverDirective } from '../../directives/section-observer.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-stack',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective, SectionObserverDirective],
  animations: [revealAnimation],
  templateUrl: './stack.component.html',
  styleUrl: './stack.component.scss',
})
export class StackComponent {
  readonly stack = portfolioData.stack;
  revealed = false;

  /** Devicon's monochrome ("original") marks render solid black — invert them in dark mode so they stay visible. */
  isMonochrome(icon: string): boolean {
    return !icon.includes('colored');
  }
}
