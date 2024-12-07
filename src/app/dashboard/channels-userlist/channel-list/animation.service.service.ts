import { Injectable } from '@angular/core';
import { Channel } from '../../../shared/interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class AnimationChannelService {


  channelList: Channel[] = [];

  focusedChannelId: string | null = '';

  isChannelOpen: boolean = false;
  isCloseChannelSection: boolean = false;
  isChannelButtonDisable: boolean = false;


  constructor() { }

  toggleChannels() {
    if (this.isChannelButtonDisable) return;

    this.isChannelButtonDisable = true;
    this.isChannelOpen = !this.isChannelOpen;

    if (!this.isChannelOpen) {
      this.isCloseChannelSection = true;
    }

    setTimeout(() => {
      this.isCloseChannelSection = this.isChannelOpen;
      this.isChannelButtonDisable = false;
    }, this.arrayTimerChannels());

    this.updateTabArrow('#channelIcon');
  }

  arrayTimerChannels(): number {
    return (this.channelList.length * 100) + 50;
  }

  updateTabArrow(id: string) {
    let icon = document.querySelector(id);
    if (icon && id == '#channelIcon') this.toggleChannelIcon(icon);
  }

  toggleChannelIcon(icon: Element) {
    icon.classList.toggle('rotate-down', this.isChannelOpen);
    icon.classList.toggle('rotate-right', !this.isChannelOpen);
  }

  async updateListOfChannels() {
    if (this.isChannelOpen) this.toggleChannels();
    await new Promise(resolve => setTimeout(resolve, this.arrayTimerChannels() + 200));
  }
}
