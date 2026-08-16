import { Component } from '@angular/core';

import { NavbarComponent } from './sections/navbar/navbar.component';
import { ProfileCardComponent } from './sections/profile-card/profile-card.component';
import { HeroComponent } from './sections/hero/hero.component';
import { StatsComponent } from './sections/stats/stats.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { ExperienceComponent } from './sections/experience/experience.component';
import { EducationComponent } from './sections/education/education.component';
import { StackComponent } from './sections/stack/stack.component';
import { AboutComponent } from './sections/about/about.component';
import { CertificatesComponent } from './sections/certificates/certificates.component';
import { ContactComponent } from './sections/contact/contact.component';
import { FooterComponent } from './sections/footer/footer.component';
import { ParticleNetworkBackgroundComponent } from './shared/particle-network-background.component';
import { CodeTypewriterBackgroundComponent } from './shared/code-typewriter-background.component';
import { CustomCursorComponent } from './shared/custom-cursor.component';
import { PreloaderComponent } from './shared/preloader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    PreloaderComponent,
    ParticleNetworkBackgroundComponent,
    CodeTypewriterBackgroundComponent,
    CustomCursorComponent,
    NavbarComponent,
    ProfileCardComponent,
    HeroComponent,
    StatsComponent,
    ProjectsComponent,
    ExperienceComponent,
    EducationComponent,
    StackComponent,
    AboutComponent,
    CertificatesComponent,
    ContactComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
