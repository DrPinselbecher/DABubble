import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-start-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-animation.component.html',
  styleUrl: './start-animation.component.scss'
})
export class StartAnimationComponent {
  isVisible = true; 

  /**
   * After the view has been initialized, set a timeout of 4000ms to remove the section element
   * from the DOM, effectively hiding the animation and revealing the landing page content
   */
  ngAfterViewInit() {
    const section = document.querySelector('section');
    setTimeout(() => {
      this.isVisible = false; 
    }, 4000); 
  }
}


