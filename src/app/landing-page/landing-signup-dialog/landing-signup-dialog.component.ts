import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';


import { LinksComponent } from '../landing-shared/links/links.component';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { LogoComponent } from "../landing-shared/logo/logo.component";

import { AuthserviceService } from '../services/authservice.service';
@Component({
  selector: 'app-landing-signup-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LinksComponent, RouterLink, MatButton, MatIcon, MatIconModule, LogoComponent],
  templateUrl: './landing-signup-dialog.component.html',
  styleUrl: './landing-signup-dialog.component.scss'
})
export class LandingSignupDialogComponent {
  selectedAvatar: string = '';
  isFocused = { username: false, email: false, password: false, checkbox: false, };
  fb = inject(FormBuilder)
  authService = inject(AuthserviceService)
  errorMessage: string | null = null;


  
  accountForm = this.fb.nonNullable.group({
    username: [
      '',[ Validators.required, Validators.pattern(/^(?=.{1,23}$)([a-zA-ZÀ-ÖØ-öø-ÿ]{1,23}\s[a-zA-ZÀ-ÖØ-öø-ÿ]{1,23})$/)]],
    email: [
      '',[ Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
    password: [
      '',[ Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    privacyPolicy: [false, Validators.requiredTrue],
  });


  constructor(private router: Router,) { }

  /**
   * Handles the submission of the sign up form.
   * If the form is valid, it checks if the email is in use.
   * If the email is in use, it sets an error message.
   * If the email is not in use, it sets the user data in local storage and navigates to the avatar picker.
   * If there is an error checking if the email is in use, it sets an error message.
   * If the form is not valid or rawForm is null, it logs a warning to the console.
   */
  async onSubmit(): Promise<void> {
    const rawForm = this.accountForm.getRawValue();
    if (this.accountForm.valid && rawForm && rawForm.email) {
      try {
        const emailInUse = await this.authService.isEmailInUse(rawForm.email);
        if (emailInUse) {
          this.errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
        } else {
          this.setTempUserData(rawForm);
          this.router.navigateByUrl('/avatar-picker');
        }
      } catch (error) {
        this.errorMessage = 'Error checking email. Please try again later.';
        console.error(error);
      }
    } else {
      console.warn('Form is not valid or rawForm is null.');
    }
  }

  /**
   * Sets the temporary user data in local storage if the form data is valid.
   * If the form data is invalid, it logs an error to the console.
   * @param rawForm The raw form data from the sign up form.
   */
  setTempUserData(rawForm: any) {
    if (rawForm && rawForm.email && rawForm.username && rawForm.password) {
      this.authService.setTempUserData({
        userID: '',
        email: rawForm.email,
        username: rawForm.username,
        password: rawForm.password,
        avatar: '',
        userStatus: 'on',
        isFocus: true,
      });
    } else {
      console.error('setTempUserData: invalid form data');
    }
  }

  /**
   * Sets the focus state of the given input field to true.
   * This is used to highlight the input field when the user focuses on it.
   * @param inputType The type of the input field, either 'username', 'email', 'password', or 'checkbox'.
   */
  onInputFocus(inputType: 'username' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = true;
  }

  /**
   * Sets the focus state of the given input field to false.
   * This is used to unhighlight the input field when the user unfocuses it.
   * @param inputType The type of the input field, either 'username', 'email', 'password', or 'checkbox'.
   */
  onInputBlur(inputType: 'username' | 'email' | 'password' | 'checkbox') {
    this.isFocused[inputType] = false;
  }

}