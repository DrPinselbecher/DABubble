import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../../models/message.class';
import { ThreadService } from '../thread-service/thread.service';
import { FirebaseMessengerService } from '../firebase-services/firebase-messenger.service';
import { User } from '@angular/fire/auth';
import { FirestoreService } from '../firebase-services/firestore.service';
import { Subject } from 'rxjs';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {
  threadService = inject(ThreadService);
  firestoreService: FirestoreService = inject(FirestoreService);

  message = new Message;
  editMessageContent: string;
  showMessenger = false;
  userId: string;
  chartId = '';
  messageId = '';
  showReactions = false;
  user: UserInterface = {
    userID: '',
    password: '',
    email: '',
    username: '',
    avatar: '',
    userStatus: '',
    isFocus: false,
  }
  channel: Channel = {
    channelID: '',
    title: '',
    description: '',
    createdBy: '',
    isFocus: false,
    userIDs: [],
    messages: [],
  };
  openChannel = false;
  openChart = false;
  openNewMessage: boolean = false;
  messageDates: string[] = [];
  scrollContainer: any;
  openMessenger = false;
  showAddPerson = false;

  selectUserNewMessage: UserInterface[] = [];
  selectChannelsNewMessage: Channel[] = [];

  textareaMessenger = new Subject<void>();
  textareaThread = new Subject<void>();
  showMessageBtn: boolean;
  messageName: string;

  showDate1Count = false;


  getFirstWord(name: string): string {
    const words = name.split(" "); // Teilt den String in ein Array von Wörtern
    return words[0]; // Gibt das erste Wort zurück
  }


  getSecondWordFirstLetter(name: string): string {
    const words = name.split(" "); // Teilt den String in ein Array von Wörtern
    return words[1]?.charAt(0) || ""; // Gibt den ersten Buchstaben des zweiten Wortes zurück
  }


  sortByName(array: any[]) {
    array.sort((a, b) => {
      const nameA = a?.userName || '';
      const nameB = b?.userName || '';
      return nameA.localeCompare(nameB);
    });
  }


  scrollToBottom(container: any) {
    if (container) {      
      container.nativeElement.scrollTop = container.nativeElement.scrollHeight;
    }
  }


  showChannel(channel: Channel) {
    this.closeEverthing();
    this.channel = channel;
    this.openChannel = true;
    this.openChart = false;
    this.openNewMessage = false;
    setTimeout(() => {
      this.textareaMessenger.next();
    }, 100);
  }


  getEmptyChannel(): Channel {
    return {
      channelID: '',
      title: '',
      description: '',
      createdBy: '',
      isFocus: false,
      userIDs: [],
      messages: [],
    }
  }


  getEmptyUser(): UserInterface {
    return {
      userID: '',
      password: '',
      email: '',
      username: '',
      avatar: '',
      userStatus: '',
      isFocus: false,
    }
  }


  showChart(user: UserInterface) {
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = true;
    this.openNewMessage = false;
    this.user = user;
    setTimeout(() => {
      this.textareaMessenger.next();
    }, 300);
    this.messageName = user.username;
  }


  showNewMessage() {
    this.openMessenger = false;
    this.closeEverthing();
    this.openChannel = false;
    this.openChart = false;
    this.openNewMessage = true;
    this.channel.isFocus = false;
    this.user.isFocus = false;
    this.channel = this.getEmptyChannel();
    this.user = this.getEmptyUser();
  }

  closeEverthing() {
    this.openMessenger = false;
    this.threadService.showThreadSideNav = false;
    this.threadService.showThread = false;
    this.chartId = '';
  }
}
