import { Injectable } from '@angular/core';
import { Channel } from '../../../shared/interfaces/channel';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';

@Injectable({
  providedIn: 'root'
})
export class UserListHandlingService {

  userList: UserInterface[] = [];
  channelList: Channel[] = [];

  focusedUserId: string | null = '';

  isDirectMessagesOpen: boolean = false;
  isCloseDirectMessagesSection: boolean = false;
  isDirectMessagesButtonDisable: boolean = false;
  isManualToggle: boolean = false;


  constructor() { }

  toggleDirectMessages() {
    if (this.isDirectMessagesButtonDisable) return;

    this.isManualToggle = true;
    this.isDirectMessagesButtonDisable = true;
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;

    if (!this.isDirectMessagesOpen) {
      this.isCloseDirectMessagesSection = true;
    }

    setTimeout(() => {
      this.isCloseDirectMessagesSection = this.isDirectMessagesOpen;
      this.isDirectMessagesButtonDisable = false;
      this.isManualToggle = false;
    }, this.arrayTimerDM());

    this.updateTabArrow('#dmIcon');
  }

  arrayTimerDM(): number {
    return (this.userList.length * 150) + 50;
  }

  updateTabArrow(id: string) {
    let icon = document.querySelector(id);
    if (icon && id == '#dmIcon') this.toggleDMIcon(icon);
  }

  toggleDMIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isDirectMessagesOpen);
    icon.classList.toggle('rotate-right', !this.isDirectMessagesOpen);
  }
}
