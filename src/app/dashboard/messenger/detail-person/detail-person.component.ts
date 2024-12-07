import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { FirebaseMessengerService } from '../../../shared/services/firebase-services/firebase-messenger.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { UserListHandlingService } from '../../channels-userlist/user-list/user-list-handling.service';


@Component({
  selector: 'app-detail-person',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './detail-person.component.html',
  styleUrl: './detail-person.component.scss'
})
export class DetailPersonComponent {
  messengerService = inject(MessengerService);
  firebaseMessenger = inject(FirebaseMessengerService);
  dialogRef = inject(MatDialogRef<DetailPersonComponent>);
  dialog = inject(MatDialog);
  firestoreService = inject(FirestoreService);
  userListHandlingService = inject(UserListHandlingService);
  data: UserInterface = inject(MAT_DIALOG_DATA);


  /**
   * Checks the current user's status and returns a string representation.
   * 
   * @returns {string} - Returns 'Aktiv' if the user is online, 'Offline' if the user is offline,
   * and 'Beschäftigt' if the user is busy.
   */
  checkUserStatus(): string {
    if (this.data.userStatus == 'on') {
      return 'Aktiv';
    } else if (this.data.userStatus == 'off') {
      return 'Offline'
    } else {
      return 'Beschäftigt'
    }
  }

  
  /**
   * Opens the messenger UI for a direct message conversation with the given user.
   * It first closes other UI elements, then sets the messenger service to open a chart
   * and assigns the given user to the messenger service. Finally, it calls the searchChat
   * function to retrieve the chat ID associated with a conversation with the given user.
   * 
   * @param user - The user object to open the conversation with.
   */
  openUser(user: UserInterface) {
    this.messengerService.showAddPerson = false;
    this.dialog.closeAll();
    this.messengerService.showChart(this.data);
    this.firebaseMessenger.searchChat(this.data);
    this.focusUser(user);
  }


  /**
   * Resets the messenger UI and sets the given user as the currently focused chat.
   * It sets the user ID, resets the messenger content, shows the user in the messenger,
   * sets the user as focused, and finally calls the searchChat function to retrieve the
   * chat ID associated with a conversation with the given user.
   * @param user - The user object to set as the currently focused chat.
   */
  focusUser(user: UserInterface) {
    this.resetChannelFocus();
    this.firestoreService.userList.forEach(u => u.isFocus = false);
    this.firestoreService.setAndGetCurrentlyFocusedChat(user);
    this.firebaseMessenger.content = '';
    this.firebaseMessenger.answerContent = '';
    this.firebaseMessenger.searchChat(user);
    this.messengerService.showChart(user);
    this.setFocus(user);
  }

  
  /**
   * Sets the focus state of the given user to true and updates the
   * focusedUserId in the UserListHandlingService.
   * @param user - The user object to set as focused.
   */
  setFocus(user: UserInterface) {
    let foundUser = this.firestoreService.userList.find(u => u.userID === user.userID);
    if (foundUser) {
      foundUser.isFocus = true;
      this.userListHandlingService.focusedUserId = foundUser.userID;
    }
  }

  
  /**
   * Resets the focus state of all channels to false.
   * This is called when a user is selected to ensure that the previously focused channel
   * is no longer displayed as focused.
   */
  resetChannelFocus(): void {
    this.firestoreService.channelList.forEach(channel => channel.isFocus = false);
  }
}
