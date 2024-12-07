import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterModule, } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';


@Component({
  selector: 'app-landing-reset-send-email',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIcon,
    MatIconModule, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatButton],
  templateUrl: './landing-reset-send-email.component.html',
  styleUrl: './landing-reset-send-email.component.scss'
})
export class LandingResetSendEmailComponent {
  isFocused = { email: false, };
  showSuccessMessage = false;
  authService = inject(AuthserviceService)
  resetForm: FormGroup;
  errorMessage: string | null = null;

  /**
   * Constructor for the component.
   * @param fb The form builder that is used to create the form.
   * @param router The router that is used to navigate to the login page.
   * The form is created with the email field and the required and email validators.
   */
  constructor(private fb: FormBuilder, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    });
  }

  /**
   * Called when an input field receives focus.
   * Sets the corresponding isFocused property to true.
   * @param inputType The type of the input field.
   */
  onInputFocus(inputType: 'email') {
    this.isFocused[inputType] = true;
  }

  /**
   * Called when an input field loses focus.
   * Sets the corresponding isFocused property to false.
   * @param inputType The type of the input field.
   */
  onInputBlur(inputType: 'email') {
    this.isFocused[inputType] = false;
  }

  /**
   * Called when the form is submitted.
   * If the form is valid, it calls the resetPassword method of the AuthService with the email address.
   * If the promise is resolved, it navigates back to the login page.
   * If the promise is rejected, it shows an error message.
   */
  onSubmit() {
    if (this.resetForm.valid) {
      const email = this.resetForm.get('email')?.value;
      this.authService.resetPassword(email).subscribe(
        () => this.navigateToLogin(),
        (error) => this.showError(error),
      );
    }
  }

/**
 * Handles errors returned from the AuthService when resetting the password.
 * Sets the error message based on the error code received.
 * Resets the showSuccessMessage to false.
 */
  showError(error: any) {
    switch (error.code) {
      case 'auth/invalid-email':
        this.errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'; break;
      case 'auth/user-not-found':
        this.errorMessage = 'Kein Konto mit dieser E-Mail-Adresse gefunden.'; break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'; break;
      case 'auth/missing-email':
        this.errorMessage = 'Eine E-Mail-Adresse ist erforderlich.'; break;
      default:
        this.errorMessage = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
    this.showSuccessMessage = false;
  }


  /**
   * Called when the password reset process is successful.
   * Sets the success message property to true, sets the error message property to null,
   * and navigates back to the login page after a 2 second delay.
   */
  navigateToLogin() {
    this.showSuccessMessage = true;
    this.errorMessage = null;
    setTimeout(() => { this.showSuccessMessage = false; this.router.navigate(['/']); }, 2000);
  }
}
