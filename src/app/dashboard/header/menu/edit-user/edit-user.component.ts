import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { UploadImageService } from '../../../../shared/services/upload-image.service';
import { FirestoreService } from '../../../../shared/services/firebase-services/firestore.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit {
  imgUpload: UploadImageService = inject(UploadImageService);
  firestoreService: FirestoreService = inject(FirestoreService);
  authService: AuthserviceService = inject(AuthserviceService);

  inputName: string = '';
  inputEmail: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  newAvatar: string = ''
  originalAvatar: string;
  inputPassword: string = '';

  avatarChanged: boolean = false;
  sending: boolean = false;

  standardAvatar = ['https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar0.png?alt=media&token=69cc34c3-6640-4677-822e-ea9e2a9e2208',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar1.png?alt=media&token=f8a95abe-d370-463b-b692-4f8ac6d4a3fd',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar2.png?alt=media&token=24c3fd24-6c63-4fda-a008-2645c5ea762e',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar3.png?alt=media&token=1c5f619a-6bf7-4578-a253-8dafff4fa373',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar4.png?alt=media&token=4bfb26e1-022b-4afb-b832-8bbf8b560729',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar5.png?alt=media&token=ed61b493-f9b5-434f-9613-bb6dc0609493',
  ]


  @Input() isOpenEditEditor: boolean = false;
  @Output() isOpenEditEditorChange = new EventEmitter<boolean>();

  /**
   * This lifecycle hook is called after the component's view has been fully initialized.
   * It sets the initial values for the input fields and subscribes to the avatarChanged observable
   * of the UploadImageService to detect when the user has changed their avatar.
   * It also retrieves the current user's avatar from the AuthService and saves it to the originalAvatar
   * property so it can be used to reset the avatar to its original state.
   */
  ngOnInit() {
    this.setInitialValues();
    this.imgUpload.avatarChanged.subscribe((newAvatar) => {
      if (newAvatar) {
        this.avatarChanged = true;
        this.newAvatar = newAvatar;
      }
    });
    const currentUser = this.authService.currentUserSig();
    console.log(currentUser?.avatar);
    
    if (currentUser?.avatar) {
      this.originalAvatar = currentUser.avatar;
    }
  }

  /**
   * Sets the initial values of the input fields.
   * This is called when the component is initialized and when the user wants to cancel the changes.
   */
  setInitialValues() {
    this.inputName = '';
    this.inputEmail = '';
    this.inputPassword = '';
  }

  /**
   * Validates the current input email format.
   * If the email is invalid, sets an error message and resets input fields.
   * Returns true if the email is valid, otherwise false.
   */
  isEmailValid(): boolean {
    let emailPattern = /^[^<>@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.inputEmail)) {
      this.errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      this.setInitialValues()
      return false;
    } else {
      this.errorMessage = null;
      return true;
    }
  }

  /**
   * Checks if the input name is valid.
   * The name is valid if it contains at least one letter and a space in between.
   * If the name is invalid, sets an error message and resets input fields.
   * Returns true if the name is valid, otherwise false.
   */
  isNameValid(): boolean {
    let namePattern = /^[a-zA-Z]{1,}\s[a-zA-Z]{1,}$/;
    if (!namePattern.test(this.inputName)) {
      this.errorMessage = 'Bitte geben Sie Ihren Vornamen und Nachnamen ein.';
      this.setInitialValues();
      return false;
    } else {
      this.errorMessage = null;
      return true;
    }
  }

  /**
   * Validates the current input password.
   * The password is valid if it contains at least 8 characters, a lowercase letter, an uppercase letter,
   * a digit, and a special character.
   * If the password is invalid, sets an error message and resets input fields.
   * If the email is the same as the current user's email, sets an error message and resets input fields.
   * Returns true if the password is valid, otherwise false.
   */
  isPasswordValid(): boolean {
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(this.inputPassword)) {
      this.errorMessage = 'Das Passwort stimmt nicht mit Ihren Anmeldedaten überein';
      this.setInitialValues();
      return false;
    } else if (this.inputEmail == this.authService.currentUserSig()?.email) {
      this.errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
      this.setInitialValues();
      return false;
    } else {
      this.errorMessage = null;
      return true;
    }
  }

  /**
   * Cancels the current user editing process.
   * Restores the avatar to its original state and resets the image preview.
   * Closes the edit user editor and emits the change event to notify listeners.
   * Reloads the current user data to ensure the profile is updated with the original values.
   */
  cancelProcess() {
    let menuElement = document.querySelector('.profile-menu-contain');
    if (menuElement) {
      menuElement.classList.remove('min-height');
    }
    this.newAvatar = this.originalAvatar;
    this.imgUpload.filePreview = null;
    this.isOpenEditEditor = false;
    this.isOpenEditEditorChange.emit(this.isOpenEditEditor = false);
  }

  /**
   * Sends the updated user data to the server.
   * If the email address has been changed, sends the new email address.
   * If the username has been changed, sends the new username.
   * If the avatar has been changed, sends the new avatar.
   */
  sendData() {
    if (this.inputEmail) {
      this.sendEmail();
    }
    if (this.inputName && this.inputName !== this.authService.currentUserSig()?.username) {
      this.changeName();
    }
    if (this.avatarChanged && this.imgUpload.selectedFile) {
      this.changeAvatar();
    }
  }



  ngOnDestroy(): void {
    this.firestoreService.stopSnapshot();
  }


  /**
   * Changes the current user's name.
   * Validates the input name before proceeding. If the name is invalid,
   * the function returns early without making changes. Otherwise, it updates
   * the user's name and displays a success message. After a brief timeout,
   * it closes the edit user editor.
   */
  changeName() {
    if (!this.isNameValid()) {
      return;
    } else {
      this.updateName();
      this.successMessage = 'Name erfolgreich aktualisiert.';
      this.timeoutCLose()
    }
  }

  /**
   * Updates the current user's avatar and saves the new avatar.
   * Shows a success message after the avatar has been updated.
   * Waits for a short time before closing the edit user editor.
   */
  changeAvatar() {
    this.sending = true;
    this.updateAvatar();
    this.successMessage = 'Avatar erfolgreich aktualisiert.';
    this.timeoutCLose()
  }

  /**
   * Updates the current user's email address and sends a verification email to the new
   * address. If the input email is invalid or the same as the current user's email, or
   * if the password is invalid, does nothing. Otherwise, sets the sending flag to
   * true, updates the email, and sets a success message when the update is successful.
   * If the update fails, sets an error message and logs the error to the console.
   * After a 2 second delay, resets the sending flag and closes the edit user dialog.
   */
  sendEmail() {
    if (!this.isEmailValid() || !this.isPasswordValid() || this.inputEmail == this.authService.currentUserSig()?.email) {
      return;
    } else {
      this.sending = true;
      this.updateEmail()
        .then(() => {
          this.successMessage = 'E-Mail-Adresse erfolgreich aktualisiert.';
          this.timeoutCLose()
        })
        .catch((error) => {
          this.errorMessage = this.handleAuthError(error);
          console.error('Error updating email: from updateEmail user component', error);
        });
    }
  }

  /**
   * Closes the edit user dialog and resets the sending flag after a 2 second delay.
   * This is used to prevent the user from immediately reopening the dialog after
   * submitting changes.
   */
  timeoutCLose() {
    setTimeout(() => {
      this.cancelProcess();
      this.sending = false;
    }, 2000);
  }

  /**
   * Updates the current user's email address and sends a verification email to the new
   * address. The user must re-authenticate with the provided password before the update
   * is successful. If the validation of either the new email or the password fails, an
   * error is thrown. If any operation fails, an error is thrown.
   * @returns {Promise<void>}
   */
  async updateEmail(): Promise<void> {
    if (!this.isEmailValid() || !this.isPasswordValid()) {
      throw new Error('Validation failed for email or password.');
    }
    await this.authService.updateEmail(this.inputEmail, this.inputPassword);
  }


  /**
   * Handles errors that occur during authentication operations. If the error has a
   * code, it is logged to the console and a human-readable error message is
   * returned. If the error does not have a code, a generic error message is returned.
   * @param {any} error The error to be handled.
   * @return {string} The error message to be displayed to the user.
   */
  handleAuthError(error: any) {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Die eingegebene E-Mail-Adresse ist ungültig.'; break;
        case 'auth/email-already-in-use':
          errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.'; break;
        case 'auth/user-not-found':
          errorMessage = 'Es konnte kein Benutzer mit diesen Anmeldedaten gefunden werden.'; break;
        case 'auth/wrong-password':
          errorMessage = 'Das Passwort ist falsch. Bitte erneut eingeben.'; break;
        case 'auth/weak-password':
          errorMessage = 'Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.'; break;
        case 'auth/requires-recent-login':
          errorMessage = 'Für diese Aktion müssen Sie sich erneut anmelden.'; break;
        case 'auth/network-request-failed':
          errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.'; break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'; break;
        default:
          errorMessage = 'Ein Fehler ist aufgetreten: ' + error.message; break;
      }
    }
    return errorMessage;
  }

  /**
   * Updates the user's name in the Firestore and Firebase Authentication services.
   * Also initializes a snapshot listener to keep the user list updated in real time.
   * 
   * @param newUsername The new username to be set.
   * @throws If no user is logged in, or if the update fails.
   */
  async updateName() {
    if (this.inputName?.length > 0) {
      try {
        await this.authService.updateName(this.inputName);
        this.firestoreService.startUserSnapshot('users');
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }
  }

  /**
   * Updates the user's avatar in the Firestore and Firebase Authentication services.
   * Additionally, uploads the new avatar to Firebase Storage and updates the user's
   * avatar URL in Firestore. If successful, reloads the current user and closes the
   * edit user dialog.
   * 
   * @throws If no user is logged in, if the file upload fails, or if the Firestore
   * or Firebase Authentication updates fail.
   */
  async updateAvatar() {
    const currentUser = this.authService.currentUserSig();
    const oldAvatarUrl = currentUser?.avatar;
    if (this.imgUpload.selectedFile) {
      try {
        const downloadUrl = await this.imgUpload.uploadUserAvatar(this.imgUpload.selectedFile );
        this.newAvatar = downloadUrl
        await this.imgUpload.updateUserAvatar(downloadUrl);
        await this.imgUpload.updateAvatarInFirestore(downloadUrl);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  }



  /**
   * Called when the user selects a new avatar. Triggers the onFileSelected event
   * on the imgUpload service, which handles the file upload and updates the
   * component's state.
   * @param event The event which triggered this function call.
   */
  onAvatarSelected(event: Event) {
    this.imgUpload.onFileSelected(event);
  }
}