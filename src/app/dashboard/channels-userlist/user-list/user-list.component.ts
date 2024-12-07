import { Component, inject } from '@angular/core';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { UserListHandlingService } from './user-list-handling.service';
import { AnimationChannelService } from '../channel-list/animation.service.service';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  threadService: ThreadService = inject(ThreadService);
  firestoreService: FirestoreService = inject(FirestoreService);
  authService: AuthserviceService = inject(AuthserviceService);
  firebaseMessenger: FirebaseMessengerService = inject(FirebaseMessengerService);
  messengerService: MessengerService = inject(MessengerService);
  listHandlingService: UserListHandlingService = inject(UserListHandlingService);
  channelHandlingService: AnimationChannelService = inject(AnimationChannelService);

  userListSubscription!: Subscription;
  channelListSubscription!: Subscription;


  constructor() { }

  ngOnInit(): void {
    this.firestoreService.startSnapshot('users');
    this.firestoreService.startSnapshot('channels');

    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.listHandlingService.userList = users;

      if (!this.listHandlingService.isManualToggle) {
        this.disableAnimation();
      }
    });

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.listHandlingService.channelList = channels;
    });
  }

  ngOnDestroy(): void {
    this.listHandlingService.focusedUserId = '';
    this.firestoreService.stopSnapshot();
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
  }

  disableAnimation() {
    let element = document.querySelector('.btns-contain.max-height-contain');
    if (element) {
      element.classList.remove('blob-in', 'blob-out');
    }
  }

  getAnimationDelayDM(index: number): number {
    if (this.listHandlingService.isDirectMessagesOpen) {
      return index * 0.10;
    } else {
      let totalButtons = this.listHandlingService.userList.length;
      return (totalButtons - index - 1) * 0.1;
    }
  }

  getDMMaxHeight(): number {
    return (this.listHandlingService.userList.length * 100) + 50;
  }

  getDMTransitionDuration(): string {
    let duration = this.listHandlingService.userList.length * 0.2;
    return `max-height ${duration}s ease-in-out`;
  }

  focusUser(user: UserInterface) {
    this.resetChannelFocus();
    this.listHandlingService.userList.forEach(u => u.isFocus = false);
    this.firestoreService.setAndGetCurrentlyFocusedChat(user);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.firebaseMessenger.searchChat(user);
    this.messengerService.showChart(user);
    user.isFocus = true;
    this.listHandlingService.focusedUserId = user.userID;
  }

  resetChannelFocus(): void {
    this.listHandlingService.channelList.forEach(channel => channel.isFocus = false);
    this.channelHandlingService.focusedChannelId = '';
  }
}
