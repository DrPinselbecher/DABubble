import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from '../landing-shared/links/links.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing-new-password',
  standalone: true,
  imports: [
    CommonModule, 
    LogoComponent, 
    LinksComponent, 
    MatIcon, 
    MatIconModule, 
    RouterLink, 
    RouterLinkActive, 
    ReactiveFormsModule, 
    RouterModule, 
    MatButtonModule
  ],
  templateUrl: './landing-new-password.component.html',
  styleUrls: ['./landing-new-password.component.scss']
})
export class LandingNewPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  passwordsDoNotMatch: boolean = false;
  showSuccessMessage = false;
  authService = inject(AuthserviceService);
  focusStates = {
    password1: false,
    password2: false,
  };
  oobCode: string | null = null;
  errorMessage: string | null = null;
  
  /**
   * The constructor for the component.
   * It is used to initialize the component's form and to get the oobCode from the URL query parameters.
   * The oobCode is used to reset the password.
   * If the oobCode is not provided, the component will not be able to reset the password.
   * @param fb The form builder that is used to create the form.
   * @param router The router that is used to navigate to the login page.
   * @param route The route that is used to get the oobCode from the URL query parameters.
   */
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.passwordForm = this.fb.group({
      password1: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
      password2: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    });
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode'] || null; 
    });
  }

  /**
   * Initializes the component.
   * It is used to navigate to the correct page based on the 'action' query parameter.
   * If the 'action' query parameter is 'resetPassword', it navigates to the 'neues-passwort' page.
   * Otherwise, it navigates to the root page.
   */
  ngOnInit(): void {
    if (!this.oobCode) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Checks if the password1 and password2 fields are empty and sets an error on the fields if they are.
   * This is used to show an error message if the user clicks the submit button without filling in the password fields.
   */
  checkEmptyFields() {
    const { password1, password2 } = this.passwordForm.controls;
    if (!password1.value) {
      password1.setErrors({ required: true });
    }
    if (!password2.value) {
      password2.setErrors({ required: true });
    }
  }

  /**
   * Checks if the password1 and password2 fields have the same value.
   * If they don't, it sets the passwordsDoNotMatch flag to true.
   * This flag is used to show an error message if the passwords don't match.
   */
  checkPasswordsMatch() {
    const password1 = this.passwordForm.get('password1')?.value;
    const password2 = this.passwordForm.get('password2')?.value;
    this.passwordsDoNotMatch = password1 && password2 && password1 !== password2;
  }

  /**
   * Sets the focus state of the given field to true.
   * This is used to highlight the input field when the user focuses on it.
   * @param field The name of the field, either 'password1' or 'password2'.
   */
  onFocus(field: 'password1' | 'password2') {
    this.focusStates[field] = true;
  }
  
  /**
   * Sets the focus state of the given field to false.
   * This is used to unhighlight the input field when the user unfocuses it.
   * @param field The name of the field, either 'password1' or 'password2'.
   */
  onBlur(field: 'password1' | 'password2') {
    this.focusStates[field] = false;
  }

  /**
   * Handles the form submission and confirms the password reset.
   * If the form is invalid or the passwords don't match, it will show an error message.
   * If the oobCode is invalid, it will show an error message.
   * If everything is valid, it will call the confirmPasswordReset method of the AuthService
   * and show a success message after the promise is resolved.
   * After 2 seconds, it will navigate back to the root route.
   */
  async onSubmit() {
    if (!this.passwordForm.valid || this.passwordsDoNotMatch || !this.oobCode) {
      this.checkEmptyFields();
      this.checkPasswordsMatch();
      return;
    }
    try {
      const newPassword = this.passwordForm.get('password1')?.value;
      await this.authService.confirmPasswordReset(this.oobCode, newPassword).toPromise();
      this.showSuccessMessage = true;
      setTimeout(() => {this.showSuccessMessage = false; this.router.navigate(['/']);}, 2000);
    } catch (error) {
      this.errorMessage = 'Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.';
      this.showSuccessMessage = false;
    }
  }
}