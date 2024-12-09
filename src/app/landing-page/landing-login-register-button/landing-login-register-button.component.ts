import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-login-register-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-login-register-button.component.html',
  styleUrl: './landing-login-register-button.component.scss'
})
export class LandingLoginRegisterButtonComponent {

}
