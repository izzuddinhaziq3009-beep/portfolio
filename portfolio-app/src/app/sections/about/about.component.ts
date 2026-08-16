import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SectionObserverDirective } from '../../directives/section-observer.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, ScrollRevealDirective, SectionObserverDirective],
  animations: [revealAnimation],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly about = portfolioData.about;
  readonly initials = portfolioData.hero.name.charAt(0);
  revealed = false;
}
