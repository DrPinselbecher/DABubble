import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ImprintComponent } from './shared/components/imprint/imprint.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivacyPolicyComponent } from './shared/components/privacy-policy/privacy-policy.component';
import { LandingSignupDialogComponent } from './landing-page/landing-signup-dialog/landing-signup-dialog.component';
import { LandingAvatarDialogComponent } from './landing-page/landing-avatar-dialog/landing-avatar-dialog.component';
import { LandingResetSendEmailComponent } from './landing-page/landing-reset-send-email/landing-reset-send-email.component';
import { LandingNewPasswordComponent } from './landing-page/landing-new-password/landing-new-password.component';
import { MessengerComponent } from './dashboard/messenger/messenger.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'signup', component: LandingSignupDialogComponent },
  { path: 'avatar-picker', component: LandingAvatarDialogComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'dashboard/privacy-policy', component: PrivacyPolicyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'dashboard/imprint', component: ImprintComponent },
  { path: 'passwort-zurücksetzen', component: LandingResetSendEmailComponent },
  { path: 'neues-passwort', component: LandingNewPasswordComponent },
  { path: 'messenger', component: MessengerComponent },
];
