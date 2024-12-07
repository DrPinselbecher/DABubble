import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LandingLoginDialogComponent } from "./landing-login-dialog/landing-login-dialog.component";
import { StartAnimationComponent } from './start-animation/start-animation.component';
import { LinksComponent } from './landing-shared/links/links.component';
import { SessionService } from './services/session.service';
import { LogoComponent } from "./landing-shared/logo/logo.component";
import { LandingLoginRegisterButtonComponent } from './landing-login-register-button/landing-login-register-button.component';
import { AuthserviceService } from './services/authservice.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingLoginDialogComponent, StartAnimationComponent, RouterLink, RouterLinkActive, LinksComponent, LogoComponent, LandingLoginRegisterButtonComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  showAnimation: boolean = true; 
  showLogo: boolean = false; 
  authService = inject(AuthserviceService);
  constructor(private sessionService: SessionService) { }

  /**
   * Sets the showAnimation and showLogo variables based on whether the user is
   * visiting the site for the first time. If it is their first visit, the
   * showAnimation variable is set to true and the showLogo variable is set to
   * false. If it is not their first visit, the showAnimation variable is set to
   * false and the showLogo variable is set to true.
   */
  ngOnInit(): void {
    if(this.authService.currentUserSig()){
      this.authService.logout();
    }
    if (this.sessionService.isFirstVisit()) {
      this.showAnimation = true; 
    } else {
      this.showAnimation = false; 
      this.showLogo = true; 
    }
  }

  /**
   * If the user is visiting the site for the first time, this function
   * waits 4 seconds and then sets the showAnimation variable to false and
   * the showLogo variable to true. This causes the animation to stop
   * playing and the logo to appear.
   */
  ngAfterViewInit() {
    if (this.showAnimation) {
      setTimeout(() => {
        this.showAnimation = false; 
        this.showLogo = true; 
      }, 4000); 
    }
  }
}
