import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly FIRST_VISIT_KEY = 'firstVisitLandingPage';

  /**
   * Returns true if the user has not visited the landing page before.
   * Saves the users visit in the session storage. This way, the user is
   * only counted as a first-time visitor once.
   */
  isFirstVisit(): boolean {
    const hasVisited = sessionStorage.getItem(this.FIRST_VISIT_KEY);
    if (!hasVisited) {
      sessionStorage.setItem(this.FIRST_VISIT_KEY, 'true'); 
      return true; 
    }
    return false; 
  }
}
