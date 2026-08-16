import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MagneticCursorDirective } from '../../directives/magnetic-cursor.directive';
import { portfolioData } from '../../portfolio-data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MagneticCursorDirective],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly copyright = portfolioData.footer.copyright;
  readonly socials = portfolioData.contact.socials;
}
