import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LogoComponent } from '../landing-shared/logo/logo.component';
import { LinksComponent } from "../landing-shared/links/links.component";
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthserviceService } from '../services/authservice.service';
import { getStorage } from '@angular/fire/storage';
import { UploadImageService } from '../../shared/services/upload-image.service';

@Component({
  selector: 'app-landing-avatar-dialog',
  standalone: true,
  imports: [CommonModule, LogoComponent, LinksComponent, MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './landing-avatar-dialog.component.html',
  styleUrls: ['./landing-avatar-dialog.component.scss']
})
export class LandingAvatarDialogComponent {
  avatars = [
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar0.png?alt=media&token=ed029a8d-e6f2-45f5-a7e7-79a1bd55308b',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar1.png?alt=media&token=ce1b4aae-b3f0-4144-acf6-356a4330ce4b',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar2.png?alt=media&token=2d4fd4d3-477d-4816-9d8f-496187e4e399',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar3.png?alt=media&token=28911e5a-d6a6-4bad-a5e5-a8da26b70ddf',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar4.png?alt=media&token=526b5624-23bf-48cd-9e38-027efa39f5ff',
    'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar5.png?alt=media&token=4ab0b96b-ecf7-4b9c-9f09-ca447759468e'
  ];
  defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/dabubble-7abb7.firebasestorage.app/o/avatars%2Favatar-clean.png?alt=media&token=198df0f0-967b-4652-9ec8-c0ea54c69009';
  selectedAvatar = this.defaultAvatar;
  showSuccessMessage = false;
  authService = inject(AuthserviceService);
  storage = getStorage();
  imgUpload = inject(UploadImageService)
  tempUserData = this.authService.getTempUserData();
  isSubmitting = false;
  constructor(private router: Router) { }

  /**
   * Checks if an avatar has been selected, either by selecting a default avatar
   * or by uploading a custom avatar.
   * @returns {boolean} True if an avatar has been selected, false otherwise.
   */
  isAvatarSelected(): boolean {
    return this.selectedAvatar !== this.defaultAvatar || !!this.imgUpload.filePreview;
  }

  /**
   * Registers the user if the avatar has been selected or sends a request to save the avatar and register the user if no avatar has been selected.
   * @returns {Promise<void>}
   */
  async onContinue() {
    const tempUserData = this.authService.getTempUserData();
    if (tempUserData) {
      if (this.isAvatarSelected()) {
        try {
          this.isSubmitting = true
          await this.trySending()
          this.handleSuccess();
          this.isSubmitting = false;
        } catch (error) {
          console.error('Error during registration:', error);
        }
      } else {
        await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
      }
    }
  }

  /**
   * Registers the user if a custom avatar has been selected or if a default avatar
   * has been selected. If a custom avatar has been selected, it will be saved
   * and then used for registration. If a default avatar has been selected, it will
   * directly be used for registration.
   * @returns {Promise<void>}
   */
  async trySending() {
    const tempUserData = this.authService.getTempUserData();
    if (tempUserData) {
      if (this.imgUpload.selectedFile) {

        await this.imgUpload.saveAndSetUserAvatar(this.imgUpload.selectedFile, tempUserData);
      } else {
        tempUserData.avatar = this.selectedAvatar;
        await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
      }
    }
  }

  /**
   * Handles the success of the registration process.
   * It clears the temporary user data from the AuthService,
   * sets the success message to true and navigates back to the root route
   * after a 2 second delay.
   */
  handleSuccess() {
    this.authService.clearTempUserData();
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
      window.location.assign('/');
    }, 2000);
  }

  /**
   * Sets the selected avatar to the given avatar URL and clears the
   * custom avatar that has been uploaded.
   * @param avatar The URL of the avatar to be selected.
   */
  onSelectAvatar(avatar: string) {
    this.selectedAvatar = `${avatar}`;
    this.imgUpload.filePreview = null;
    this.imgUpload.selectedFile = null;
  }

  /**
   * Updates the avatar of the user to the given avatar URL.
   * @param avatarUrl The URL of the avatar to be updated.
   */
  updateUserAvatar(avatarUrl: string) {
    this.imgUpload.updateUserAvatar(avatarUrl)
  }

}