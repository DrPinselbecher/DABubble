import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { Channel } from '../../../shared/interfaces/channel';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelComponent } from '../dialog-channel/dialog-channel.component';
import { AnimationChannelService } from './animation.service.service';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';
import { UserListHandlingService } from '../user-list/user-list-handling.service';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss'
})
export class ChannelListComponent {

  firebaseMessengerService = inject(FirebaseMessengerService);
  firestoreService: FirestoreService = inject(FirestoreService);
  firebaseMessenger = inject(FirebaseMessengerService);
  messengerService = inject(MessengerService);
  threadService = inject(ThreadService);
  userListHandlingService: UserListHandlingService = inject(UserListHandlingService);

  channelList: Channel[] = [];
  channelListSubscription!: Subscription;

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;

  dialog = inject(MatDialog);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);


  constructor() {
    this.channelAnimationService.isChannelOpen = false;
  }


  ngOnInit(): void {
    this.firestoreService.startSnapshot('channels');

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channel => {
      this.channelList = channel;
      this.channelAnimationService.channelList = channel;
    });

    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
  }

  ngOnDestroy(): void {
    this.channelAnimationService.focusedChannelId = '';
    this.firestoreService.stopSnapshot();
  }

  ngAfterViewInit() {
    setTimeout(() => this.channelAnimationService.toggleChannels(), 1000);
  }

  getAnimationDelayChannel(index: number): number {
    if (this.channelAnimationService.isChannelOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.channelList.length;
      return (totalButtons - index - 1) * 0.10;
    }
  }

  getDuplicateChannelsNumber(channel: Channel): number | null {
    let title = channel.title;
    let count = 0;

    for (let currentChannel of this.channelList) {
      if (currentChannel.title === title) {
        count++;
      }
      if (currentChannel === channel) {
        return count > 1 ? count : null;
      }
    }
    return null;
  }

  getAnimationDelayAddChannel() {
    let totalButtons = this.channelList.length;

    if (this.channelAnimationService.isChannelOpen) {
      return totalButtons * 0.10;
    } else {
      return (totalButtons - totalButtons - 1) * 0.10;
    }
  }

  getChannelsMaxHeight(): number {
    return this.channelList.length * 50 + 50;
  }

  getChannelsTransitionDuration(): string {
    let duration = this.channelList.length * 0.12;
    return `max-height ${duration}s ease-in-out`;
  }

  focusChannel(channel: Channel) {
    this.threadService.channelID = channel.channelID;
    this.channelAnimationService.focusedChannelId = channel.channelID!;
    this.resetUserFocus();
    this.channelList.forEach(c => c.isFocus = false);
    this.firestoreService.setAndGetCurrentlyFocusedChat(channel);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.messengerService.showChannel(channel);
    channel.isFocus = true;
    this.threadService.getTheUsersOfChannel();
    this.messengerService.messageDates = [];
    this.firebaseMessengerService.messages = [];
    this.firebaseMessenger.subSomethingList('noID', 'noCollection', () => {
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
      }, 10);
    });
    this.messengerService.openMessenger = true;
  }

  resetUserFocus(): void {
    this.userList.forEach(user => user.isFocus = false);
    this.userListHandlingService.focusedUserId = '';
  }

  openDialog() {
    this.dialog.open(DialogChannelComponent);
  }
}
