import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MagneticCursorDirective } from '../../directives/magnetic-cursor.directive';
import { portfolioData } from '../../portfolio-data';

/**
 * Sticky left profile card (desktop) / top block (mobile): photo, name,
 * tagline, social links. Stays in view while the main content column
 * scrolls — see .pf-layout__sidebar in app.component.scss for the sticky
 * positioning itself.
 */
@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MagneticCursorDirective],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent {
  readonly hero = portfolioData.hero;
  readonly socials = portfolioData.contact.socials;
  readonly initials = portfolioData.hero.name.charAt(0);

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }
}
