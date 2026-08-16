import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeService } from '../../core/theme.service';
import { ActiveSectionService } from '../../core/active-section.service';
import { MagneticCursorDirective } from '../../directives/magnetic-cursor.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MagneticCursorDirective,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly navLinks = portfolioData.navLinks;
  readonly brandName = portfolioData.hero.name;

  constructor(
    readonly theme: ThemeService,
    readonly activeSection: ActiveSectionService,
  ) {}

  isActive(fragment: string): boolean {
    return this.activeSection.activeFragment() === fragment;
  }
}
