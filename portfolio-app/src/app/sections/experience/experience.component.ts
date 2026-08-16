import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SectionObserverDirective } from '../../directives/section-observer.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    ScrollRevealDirective,
    SectionObserverDirective,
  ],
  animations: [revealAnimation],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  readonly experience = portfolioData.experience;
  revealed = false;
}
