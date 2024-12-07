import { CommonModule } from '@angular/common';
import { Component, inject, OnInit,
  
} from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';


import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthserviceService } from '../services/authservice.service';

@Component({
  selector: 'app-landing-login-dialog',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatInputModule, MatIcon, FormsModule,
     MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatButton, RouterLink],
  templateUrl: './landing-login-dialog.component.html',
  styleUrl: './landing-login-dialog.component.scss',
})
export class LandingLoginDialogComponent implements OnInit {
  loginForm: FormGroup;
  authService = inject(AuthserviceService)
  errorMessage!: string | null;
  isFocused = {
    email: false,
    password: false,
  };


  /**
   * Constructor for the component.
   * It is used to initialize the component's form and to get the router.
   * The form is created with the email and password fields and the required and pattern validators.
   * @param fb The form builder that is used to create the form.
   * @param router The router that is used to navigate to the chat page after a successful login.
   */
  constructor(private fb: FormBuilder, private router:Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    });
  }

  ngOnInit(): void {
    this.authService.currentUserSig.set(null);
  }

  /**
   * Sets the focus state of the given input field to true.
   * This is used to highlight the input field when the user focuses on it.
   * @param inputType The type of the input field, either 'email' or 'password'.
   */
  onInputFocus(inputType: 'email' | 'password') {
    this.isFocused[inputType] = true;
  }

  /**
   * Sets the focus state of the given input field to false.
   * This is used to unhighlight the input field when the user unfocuses it.
   * @param inputType The type of the input field, either 'email' or 'password'.
   */
  onInputBlur(inputType: 'email' | 'password') {
    this.isFocused[inputType] = false;
  }

  /**
   * Called when the form is submitted.
   * If the form is valid, it calls the login method of the AuthService with the email and password.
   * If the promise is resolved, it navigates to the dashboard page.
   * If the promise is rejected, it shows an error message.
   */
  onSubmit(): void {
    const rawForm = this.loginForm.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => { 
        this.router.navigateByUrl('/dashboard');},
      error: (err) => { this.errorMessage = err.message; }
    });
  }

  /**
   * Called when the user clicks the Google login button.
   * It calls the signInWithGoogle method of the AuthService and navigates to the dashboard page if the promise is resolved.
   * If the promise is rejected, it shows an error message.
   */
  loginWithGoogle() {
    this.authService.signInWithGoogle().subscribe({
      next: () => { this.router.navigateByUrl('/dashboard');},
      error: (err) => { this.errorMessage = err.message;}
    });
  }

  /**
   * Calls the guestLogin method of the AuthService, which logs in the user with a guest account.
   * The guest account has the email 'gast@gast.de' and the password 'abcdABCD1234!"§$'.
   */
  guestLogin(){
    this.authService.anonymousLogin();
  }
}


