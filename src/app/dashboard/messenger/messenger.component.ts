import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailPersonComponent } from './detail-person/detail-person.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { ThreadService } from '../../shared/services/thread-service/thread.service';
import { FirebaseMessengerService } from '../../shared/services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { MessageComponent } from '../../shared/components/message/message.component';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import localeDe from '@angular/common/locales/de';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { Firestore } from '@angular/fire/firestore';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { FirestoreService } from '../../shared/services/firebase-services/firestore.service';
import { AddPersonComponent } from './add-person/add-person.component';
import { ViewportService } from '../../shared/services/viewport.service';
registerLocaleData(localeDe);

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MessageComponent,
    TextareaComponent,
    EditChannelComponent,
    OverlayModule,
    AddPersonComponent
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent implements AfterViewInit {
  viewportService = inject(ViewportService);
  firestore = inject(Firestore);
  firestoreService = inject(FirestoreService);
  dialog = inject(MatDialog);
  datePipe = inject(DatePipe);
  authService = inject(AuthserviceService);
  firebaseMessenger = inject(FirebaseMessengerService);
  threadService = inject(ThreadService);
  messengerService = inject(MessengerService);

  @ViewChild('content') scrollContainer: ElementRef;
  @ViewChild('name') nameHeadline: ElementRef;

  messagesDates: string[] = [];
  usersListAll: UserInterface[] = [];
  usersInChannel: any[] = [];

  resizeObserver!: ResizeObserver;
  userListSubscription: any;
  reversedMessge: any;
  dateContent: string;
  dateTodayString: string;
  hoveredMessage: number;
  hoveredMenu = false;
  sourceThread = false;
  isEditChannelOpen = false;
  editChannelIsOpen = false;
  showAddPerson = false;
  showAddPersonDialogDirect = false;
  isTextWrapped = false;
  checkTextSenderName = false;
  dateCount = 0;
  windowWith = 0;


  /**
   * Sets the scrollContainer in the messenger service to the ElementRef of the ViewChild with the name 'content'.
   * This is necessary because the ViewChild is not yet available in the constructor or ngOnInit.
   */
  ngAfterViewInit() {
    if (this.nameHeadline !== undefined) {
      this.resizeObserver = new ResizeObserver(() => this.checkTextStatus());
      this.resizeObserver.observe(this.nameHeadline.nativeElement);
    }
    this.messengerService.scrollContainer = this.scrollContainer;
  }


  /**
   * Unsubscribes from the channel user list and the list of all users when the component is destroyed.
   */
  ngOnDestoy() {
    this.userListSubscription;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }


  /**
   * Closes the edit channel dialog.
   */
  closeEditChannel() {
    this.editChannelIsOpen = false;
  }


  /**
   * Checks if the text in the headline of a message is wrapped. If it is and the name has not yet been shortened, it shortens the name.
   * If the text is not wrapped and the name has been shortened, it sets the name back to the full name.
   * @private
   */
  checkTextStatus() {
    if (this.nameHeadline !== undefined) {
      const element = this.nameHeadline.nativeElement;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight || '0');
      const elementHeight = element.offsetHeight;
      this.isTextWrapped = elementHeight > lineHeight;
      if (this.isTextWrapped && !this.checkTextSenderName) {
        this.getTheShortTxtOfName()
      } else if (this.windowWith < this.viewportService.width) {
        this.messengerService.messageName = this.messengerService.user.username;
        this.checkTextSenderName = false;
      }
    }
  }


  /**
   * Sets the shortened name of the user if the text in the headline of a message is wrapped.
   * The shortened name is the first word of the user's name, followed by the first letter of the second word.
   * Saves the current width of the window and sets a flag to indicate that the name has been shortened.
   * @private
   */
  getTheShortTxtOfName() {
    this.windowWith = this.viewportService.width;
    this.checkTextSenderName = true;
    this.messengerService.messageName = `${this.messengerService.getFirstWord(this.messengerService.user.username)}. ${this.messengerService.getSecondWordFirstLetter(this.messengerService.user.username)}`;
  }


  /**
   * Returns the header text based on the current context.
   * 
   * If the user is in a private chat, it returns the username of the chat partner.
   * If the user is in a channel, it returns the channel title prefixed with '#'.
   * 
   * @param {string} src - The source string (not used in the function).
   * @returns {string} - The username or channel title for the header.
   */
  chatOrChannelHeader(src: string): string {
    if (this.messengerService.openChart) {
      return `${this.messengerService.user.username}`
    } else {
      return `# ${this.messengerService.channel.title}`
    }
  }


  /**
   * We controll if the interaction menu should be hide or not
   */
  showOrHideMenu() {
    if (this.hoveredMenu == false) {
      this.hoveredMenu = true;
    } else {
      this.hoveredMenu = false;
    }
  }


  /**
   * Open the detail View of the channel or person
   */
  openDialog() {
    this.messengerService.showMessageBtn = false;
    this.dialog.open(DetailPersonComponent, {
      data: {
        avatar: this.messengerService.user.avatar || 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
        userID: this.messengerService.user.userID,
        username: this.messengerService.user.username,
        email: this.messengerService.user.email,
        userStatus: this.messengerService.user.userStatus
      },
    });
  }


  /**
   * Toggles the visibility of the "Add Person" dialog.
   * Sets showAddPersonDialogDirect to true and toggles 
   * the showAddPerson state.
   */
  openDialogAddPersonDirect() {
    this.showAddPersonDialogDirect = true;
    this.showAddPerson = !this.showAddPerson;
  }
}
