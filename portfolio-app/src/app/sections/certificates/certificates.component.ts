import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { revealAnimation } from '../../animations/reveal.animation';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SectionObserverDirective } from '../../directives/section-observer.directive';
import { MagneticCursorDirective } from '../../directives/magnetic-cursor.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    ScrollRevealDirective,
    SectionObserverDirective,
    MagneticCursorDirective,
  ],
  animations: [revealAnimation],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss',
})
export class CertificatesComponent {
  readonly certificates = portfolioData.certificates;
  revealed = false;

  /** Tracks which cards' <img> failed to load, so they fall back to a Material icon. */
  private readonly failedImages = new Set<number>();

  onImageError(index: number): void {
    this.failedImages.add(index);
  }

  showImage(index: number): boolean {
    return !!this.certificates[index].image && !this.failedImages.has(index);
  }
}
