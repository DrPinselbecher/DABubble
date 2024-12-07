import { EventEmitter, inject, Injectable } from '@angular/core';
import { updateProfile } from '@angular/fire/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { Firestore, doc, updateDoc, collection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class UploadImageService {
  storage = getStorage();
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;
  authService = inject(AuthserviceService);
  avatarChanged = new EventEmitter<string | null>();
  firestore :Firestore = inject(Firestore)


  /**
   * Called when the user selects a file. If the file is valid, it is
   * stored in the selectedFile property, and the filePreview property is
   * updated with the base64 representation of the file. The avatarChanged
   * event is also emitted with the new file preview.
   * @param event The event which triggered this function call.
   */
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
        this.avatarChanged.emit(this.filePreview); // Emit the new file preview
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Compresses an image by resizing it to a lower resolution and converting
   * it to a lower quality JPEG. The resulting image is returned as a new
   * File object.
   *
   * @param file The image file to compress.
   * @returns A new File object containing the compressed image.
   */
  async compressImage(file: File): Promise<File> {
    const img = await this.loadImage(file);
    const { width, height } = this.calculateDimensions(img);
    const blob = await this.drawImageToCanvas(img, width, height, file.type);
    return new File([blob], file.name, { type: file.type });
  }
  
  /**
   * Reads a file as an image and resolves with the loaded image.
   * Rejects with an error if the image fails to load.
   * @param file The file to load as an image.
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(new Error('Image load failed'));
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Calculates the dimensions of a given image to fit within a maximum
   * width and height, while maintaining the aspect ratio.
   *
   * @param img The image to calculate the dimensions for.
   * @returns An object containing the calculated width and height.
   */
  private calculateDimensions(img: HTMLImageElement): { width: number; height: number } {
    const maxWidth = 300;
    const maxHeight = 300;
    let { width, height } = img;
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }
    return { width, height };
  }
  
  /**
   * Draws an image onto a canvas and compresses it to a blob.
   *
   * @param img The image to draw onto the canvas.
   * @param width The width of the canvas.
   * @param height The height of the canvas.
   * @param type The type of the image to compress the blob to.
   * @returns A promise that resolves with the compressed blob.
   */
  private drawImageToCanvas(img: HTMLImageElement, width: number, height: number, type: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Compression failed'));
        }
      }, type, 0.5);
    });
  }

  /**
   * Uploads a user's avatar to Firebase Storage and returns the download URL
   * @param file The file to upload
   * @returns A promise that resolves with the download URL of the uploaded file
   * @throws If the file fails to upload, or if the download URL fails to be retrieved
   */
  async uploadUserAvatar(file: File): Promise<string> {
    try {
      const compressedFile = await this.compressImage(file);
      const storageRef = ref(this.storage, `avatars/${compressedFile.name}`);
      await uploadBytes(storageRef, compressedFile);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Updates the avatar of the user with the given avatar URL in the Firebase Authentication service.
   * @param avatarUrl The URL of the avatar to be updated.
   * @returns A promise that resolves when the update is successful, or rejects if the update fails or if no user is logged in.
   */
  async updateUserAvatar(avatarUrl: string) {
    const currentUser = this.authService.firebaseAuth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { photoURL: avatarUrl });
      } catch (error) {
        console.error('Error updating avatar in Firebase Auth:', error);
        throw error;
      }
    } else {
      return Promise.reject('No user logged in');
    }
  }

  /**
   * Saves the avatar to Firebase Storage and sets it in the user document in Firestore
   * @param file The avatar file to save and set, or null if no avatar is to be set.
   * @param tempUserData The temporary user data to be registered.
   * @returns A promise that resolves when the registration is successful, or rejects if the registration fails or if no user is logged in.
   */
  async saveAndSetUserAvatar(file: File | null, tempUserData: any) {
    if (file) {
      const avatarUrl = await this.uploadUserAvatar(file);
      tempUserData.avatar = avatarUrl;
    }
    await this.authService.register(tempUserData.email, tempUserData.username, tempUserData.password, tempUserData.avatar).toPromise();
  }

  /**
   * Updates the avatar of the user with the given avatar URL in the Firestore user document.
   * @param avatarUrl The URL of the avatar to be updated.
   * @returns A promise that resolves when the update is successful, or rejects if the update fails or if no user is logged in.
   */
  async updateAvatarInFirestore(avatarUrl: string) {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      try {
        const userDocRef = doc(this.firestore, `users/${currentUser.userID}`);  
        await updateDoc(userDocRef, { avatar: avatarUrl }); 
        this.authService.currentUserSig.set({ ...currentUser, avatar: avatarUrl || this.authService.defaultAvatarURL });
      } catch (error) {
        console.error('Error updating avatar in Firestore:', error);
        throw error;
      }
    }
}
}
