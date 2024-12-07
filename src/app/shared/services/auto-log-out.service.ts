import { Injectable, NgZone } from '@angular/core';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { Router } from '@angular/router';
import { doc, updateDoc, Firestore } from '@angular/fire/firestore';


const MINUTES_UNITL_AUTO_LOGOUT = 5;
const CHECK_INTERVAL = 1000;
const TAB_HIDDEN_TIMEOUT = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutService {
  lastAction: number;
  tabHiddenTimeout: any;
  constructor(
    private auth: AuthserviceService,
    private router: Router,
    private ngZone: NgZone,
    private firestore: Firestore
  ) {
    this.reset();
    this.initListener();
    this.initInterval();
    this.initVisibilityListener();
  }

  /**
   * Initializes event listeners for user activity to reset the last action timestamp.
   * Listens for click, keypress, mouse movement, and touchstart events on the document body.
   * Runs outside of Angular's zone to avoid triggering change detection unnecessarily.
   */
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
      document.body.addEventListener('keypress', () => this.reset());
      document.body.addEventListener('mousemove', () => this.reset());
      document.body.addEventListener('touchstart', () => this.reset());
    });
  }

  /**
   * Initializes an interval to check whether the user should be logged out due to
   * inactivity every CHECK_INTERVAL milliseconds. Runs outside of Angular's zone
   * to avoid triggering change detection unnecessarily.
   */
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => this.check(), CHECK_INTERVAL);
    });
  }

  /**
   * Resets the last action timestamp to the current time. This is called
   * whenever the user interacts with the application, such as by clicking
   * or typing. This resets the countdown to auto-logout.
   */
  reset() {
    this.lastAction = Date.now();
  }

  /**
   * Checks whether the user should be logged out due to inactivity every CHECK_INTERVAL milliseconds.
   * If the user has not interacted with the application for MINUTES_UNITL_AUTO_LOGOUT minutes, logs out the user
   * and navigates to the login page.
   */
  check() {
    if (!this.auth.currentUserSig()) {
      return;
    }
    const now = Date.now();
    const timeleft = this.lastAction + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;
    this.ngZone.run(() => {
      if (isTimeout) {
        this.auth.logout();
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Initializes a listener for the `visibilitychange` event to detect when the
   * user switches to a different tab or minimizes the browser. If the tab is hidden,
   * it starts a 5-minute timer to log out the user.
   */
  initVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.startTabHiddenTimer(); 
      } else {
        this.clearTabHiddenTimer(); 
      }
    });
  }

  /**
   * Starts a timer to log out the user after 5 minutes of tab being hidden.
  */
  startTabHiddenTimer() {
    this.clearTabHiddenTimer(); 
    this.tabHiddenTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.auth.logout();
        this.router.navigate(['/']);
      });
    }, TAB_HIDDEN_TIMEOUT);
  }

  /**
   * Clears the timer that logs out the user after the tab is hidden for a certain
   * amount of time.
   */
  clearTabHiddenTimer() {
    if (this.tabHiddenTimeout) {
      clearTimeout(this.tabHiddenTimeout);
      this.tabHiddenTimeout = null;
    }
  }

  /**
   * Handles the visibilitychange event when the user switches to a different tab.
   * If the user switches to a different tab, this logs out the user after a delay.
   * If the user is reloading the tab, this does not log out the user.
   */
  handleTabHidden() {
    const isReloading = sessionStorage.getItem('isReloading');
    if (isReloading) {
      sessionStorage.removeItem('isReloading');
      return;
    }
    this.ngZone.run(() => {
      this.auth.logout();
      this.router.navigate(['/']);
    });
  }
}
          
          

    



