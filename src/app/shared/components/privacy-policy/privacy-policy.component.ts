import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LogoComponent } from "../../../landing-page/landing-shared/logo/logo.component";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    MatCardModule,
    RouterLink,
    MatIconModule,
    LogoComponent
],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
