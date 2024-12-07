import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LogoComponent } from "../../../landing-page/landing-shared/logo/logo.component";


@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    LogoComponent
],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}
