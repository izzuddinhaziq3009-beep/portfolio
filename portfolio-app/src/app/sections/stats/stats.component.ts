import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  animations: [revealAnimation],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  readonly stats = portfolioData.stats;
  revealed = false;
}
