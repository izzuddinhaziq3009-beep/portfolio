import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SectionObserverDirective } from '../../directives/section-observer.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective, SectionObserverDirective],
  animations: [revealAnimation],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly hero = portfolioData.hero;
  revealed = false;
}
