import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Message } from '../../../models/message.class';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from '../firebase-services/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  firestore: Firestore = inject(Firestore);
  firestoreService: FirestoreService = inject(FirestoreService);

  messageToReplyTo = new Message;
  showThreadSideNav: boolean = false;
  showThread = false;
  messageId: string;
  senderAvatar: string;
  scrollContainer: any;
  channelID: any;

  userListSubscription: any;
  usersInChannel: any[] = [];
  usersListAll: UserInterface[] = [];
  senderUser: UserInterface[] = [];
  headerSenderName: string;
  messageToReplaySenderName: string;
  openThreadContent = false;

  subChannelUserListUnsubscribe: (() => void) | null = null;


  constructor() { }

  getDataOfUser() {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
    });

    if (this.messageToReplyTo.senderName !== 'Neuer Gast') {
      this.senderUser = this.usersListAll.filter(user => user.userID === this.messageToReplyTo.senderID);
    } else {
      this.senderUser = [
        {
          userID: this.messageToReplyTo.senderID,
          password: '',
          email: '',
          username: this.messageToReplyTo.senderName,
          avatar: this.messageToReplyTo.senderAvatar,
          userStatus: '',
          isFocus: false,
        }
      ];
    }
    this.messageToReplaySenderName = this.senderUser[0].username;
    this.headerSenderName = this.senderUser[0].username;
  }

  subChannelUserList(callback: any) {
    const messegeRef = doc(collection(this.firestore, `channels`), this.channelID);
    this.subChannelUserListUnsubscribe = onSnapshot(messegeRef, (list) => {
      if (list.exists() && callback) {
        callback(list);
      }
    });
  }

  getTheUsersOfChannel() {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      let usersListAll = users;
      this.subChannelUserList((list: any) => {
        this.usersInChannel = [];
        const usersIDs = list.data()['userIDs'];
        for (let i = 0; i < usersIDs.length; i++) {
          const userID = usersIDs[i];
          const user = usersListAll.filter(user => user.userID === userID);
          this.usersInChannel.push(this.getCleanJson(user));
          this.sortByName(this.usersInChannel);
        }
      });
    });
  }

  sortByName(array: any[]) {
    array.sort((a, b) => {
      const nameA = a?.username || '';
      const nameB = b?.username || '';
      return nameA.localeCompare(nameB);
    });
  }

  getCleanJson(user: UserInterface[]): UserInterface {
    if (!user[0]) {
      let userJson = {
        userID: '',
        password: '',
        email: '',
        username: 'Unbekannt',
        avatar: '',
        userStatus: '',
        isFocus: false,
      };
      return userJson;
    }

    let userJson = {
      userID: user[0].userID,
      password: user[0].password,
      email: user[0].email,
      username: user[0].username,
      avatar: user[0].avatar,
      userStatus: user[0].userStatus,
      isFocus: user[0].isFocus,
    };
    return userJson;
  }

  unsubscribeAll() {
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
    if (this.subChannelUserListUnsubscribe) {
      this.subChannelUserListUnsubscribe();
    }
  }
}
