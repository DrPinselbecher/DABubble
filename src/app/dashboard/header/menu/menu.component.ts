import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../shared/services/upload-image.service';
import { Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from '@firebase/firestore';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { ThreadService } from '../../../shared/services/thread-service/thread.service';
import { ViewportService } from '../../../shared/services/viewport.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    EditUserComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Input() userStatus: string = 'on';
  @Output() userStatusChange = new EventEmitter<string>();

  @Input() isProfileMenuOpen: boolean = false;
  @Output() isProfileMenuOpenChange = new EventEmitter<boolean>();

  @Input() isUnderMenuOpen: boolean = false;
  @Output() isUnderMenuOpenChange = new EventEmitter<boolean>();

  @Input() isOpenEditEditor: boolean = false;
  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();

  @Input() avatarUrl: string

  @ViewChild(EditUserComponent) editUserComponent!: EditUserComponent;

  authService: AuthserviceService = inject(AuthserviceService);
  imgUpload: UploadImageService = inject(UploadImageService);
  firestore: Firestore = inject(Firestore);
  messengerService: MessengerService = inject(MessengerService);
  threadService: ThreadService = inject(ThreadService);
  viewportService: ViewportService = inject(ViewportService);

  constructor() { }

  /**
   * Closes both the thread and messenger components by setting their visibility to false.
   */
  closeThreadAndMessenger(): void {
    this.messengerService.showMessenger = false;
    this.threadService.showThread = false;
  }

  /**
   * Toggles the visibility of the profile menu.
   * 
   * - Opens the menu if it is currently closed and emits the change.
   * - If the menu is open, applies the appropriate animation based on the viewport width
   *   and then closes the menu after a delay, emitting the updated state.
   * 
   * @param e - The event that triggered the toggle action.
   */
  toggleProfileMenu(e: Event): void {
    e.stopPropagation();
    if (!this.isProfileMenuOpen) {
      this.isProfileMenuOpen = true;
      this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
    } else {
      let menuElement = document.querySelector('.profile-menu-contain');
      if (menuElement) {
        this.closeMenu(menuElement);
        if (this.viewportService.width <= 460) {
          setTimeout(() => {
            this.isProfileMenuOpen = false;
            this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
          }, 300);
        } else {
          setTimeout(() => {
            this.isProfileMenuOpen = false;
            this.isProfileMenuOpenChange.emit(this.isProfileMenuOpen);
          }, 140);
        }
      }
    }
  }

  /**
   * Closes the profile menu by applying the appropriate animation class
   * based on the viewport size.
   * 
   * - For mobile devices (`<= 460px`), adds `close-responsive` class.
   * - For larger viewports, adds `close` class.
   * 
   * @param menuElement - The DOM element representing the profile menu.
   */
  closeMenu(menuElement: any): void {
    if (this.viewportService.width <= 460) {
      menuElement.classList.remove('open-responsive');
      menuElement.classList.add('close-responsive');
    } else {
      menuElement.classList.remove('open');
      menuElement.classList.add('close');
    }
    menuElement.classList.remove('min-height');
  }

  /**
   * Toggles the visibility of the under menu.
   * Emits the updated visibility state to the parent component.
   * 
   * @param e - The event that triggered the toggle action.
   */
  openUnderMenuStatus(e: Event): void {
    e.stopPropagation();
    this.isUnderMenuOpen = !this.isUnderMenuOpen;
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
  }

  /**
   * Checks if the user is currently online.
   * A user is online if their status is neither 'off' nor 'busy'.
   * 
   * @returns True if the user is online, otherwise false.
   */
  userIsOnline(): boolean {
    return this.userStatus !== 'off' && this.userStatus !== 'busy';
  }

  /**
   * Checks if the user is currently offline.
   * A user is offline if their status is set to 'off'.
   * 
   * @returns True if the user is offline, otherwise false.
   */
  userIsOffline(): boolean {
    return this.userStatus === 'off';
  }

  /**
   * Checks if the user is currently busy.
   * A user is busy if their status is set to 'busy'.
   * 
   * @returns True if the user is busy, otherwise false.
   */
  userIsBusy(): boolean {
    return this.userStatus === 'busy';
  }

  /**
   * Sets the user's status to the specified value and closes the under menu.
   * Emits the updated status and under menu state to the parent component.
   * 
   * @param e - The event that triggered the status change.
   * @param status - The new status for the user ('on', 'off', or 'busy').
   */
  setUserStatus(e: Event, status: 'on' | 'off' | 'busy'): void {
    e.stopPropagation();
    this.userStatus = status;
    this.isUnderMenuOpen = false;
    this.userStatusChange.emit(this.userStatus);
    this.isUnderMenuOpenChange.emit(this.isUnderMenuOpen);
    this.updateUserStatus();
  }

  /**
   * Toggles the visibility of the edit user editor.
   * 
   * - If the editor is currently closed, it opens it and applies the `min-height` class.
   * - If the editor is open, it removes the `min-height` class and closes the editor.
   * 
   * @param e - The event that triggered the toggle action.
   */
  toggleEditUserEditor(e: Event): void {
    e.stopPropagation();
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement && !this.isOpenEditEditor) {
      menuElement.classList.add('min-height');
      this.isOpenEditEditor = !this.isOpenEditEditor;
      this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
    } else {
      if (menuElement) {
        menuElement.classList.remove('min-height');
        this.isOpenEditEditor = !this.isOpenEditEditor;
        this.isOpenEditEditorChange.emit(this.isOpenEditEditor);
      }
    }
  }

  /**
   * Prevents the propagation of the specified event.
   * 
   * @param e - The event to stop from propagating.
   */
  noClickable(e: Event): void {
    e.stopPropagation();
  }

  /**
   * Updates the user's status in Firestore with the current value of `userStatus`.
   * Logs an error if the update fails or if no user is logged in.
   */
  updateUserStatus(): void {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      const userDocRef = doc(this.firestore, `users/${currentUser.userID}`);
      updateDoc(userDocRef, { userStatus: this.userStatus }).catch((error) => {
        console.error('Error updating user status in Firestore:', error);
      });
    } else {
      console.error('No user found to update status.');
    }
  }

  /**
   * Cancels the current editing process by invoking the `cancelProcess` 
   * method on the `EditUserComponent` if it exists.
   */
  onCancelProgress(): void {
    if (this.editUserComponent) {
      this.editUserComponent.cancelProcess();
    }
  }
}