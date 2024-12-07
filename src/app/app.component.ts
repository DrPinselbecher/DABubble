import { Component, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from './shared/services/auto-log-out.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DaBubble';

  constructor(
    private autoLogout: AutoLogoutService,
    private auth: Auth
  ) { 

  }

  onDragStart(event: DragEvent) {
    event.preventDefault();
  }

}
