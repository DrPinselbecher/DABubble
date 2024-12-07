import { inject, Injectable } from '@angular/core';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { MessengerService } from '../messenger-service/messenger.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirestoreService } from '../firebase-services/firestore.service';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';

@Injectable({
  providedIn: 'root'
})
export class TextareaServiceService {
  authService = inject(AuthserviceService);
  firestore = inject(Firestore);
  messengerService = inject(MessengerService);
  firestoreService = inject(FirestoreService);

  usersListAll: UserInterface[] = [];
  usersToMention: MentionUserInterface[] = [];
  userListSubscription: any;


  sortByName(array: any[]) {
    array.sort((a, b) => {
      const nameA = a?.userName || '';
      const nameB = b?.userName || '';
      return nameA.localeCompare(nameB);
    });
  }


  getCleanJson(user: UserInterface[]) {
    let userJson = {
      avatar: user[0]['avatar'],
      userID: user[0]['userID'],
      userName: user[0]['username'],
    }
    return userJson;
  }
}
