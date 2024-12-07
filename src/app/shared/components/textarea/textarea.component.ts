import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FirebaseMessengerService } from '../../services/firebase-services/firebase-messenger.service';
import { MessengerService } from '../../services/messenger-service/messenger.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadService } from '../../services/thread-service/thread.service';
import { EmojiBoardComponent } from '../emoji-board/emoji-board.component';
import { MatIcon } from '@angular/material/icon';
import { provideStorage, getStorage, Storage } from '@angular/fire/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { MatDialog } from '@angular/material/dialog';
import { FileViewDialogComponent } from '../file-view-dialog/file-view-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { FirestoreService } from '../../services/firebase-services/firestore.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { collection, doc, onSnapshot } from '@firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';
import { MentionUserInterface } from '../../interfaces/mention-user-interface';
import { Message } from '../../../models/message.class';
import { MentionModule } from 'angular-mentions';
import { Subscription } from 'rxjs';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmojiBoardComponent,
    MatIcon,
    MatMenuModule,
    MentionModule,
  ],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: []
})
export class TextareaComponent {
  viewportService = inject(ViewportService);
  authService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);
  firestore: Firestore = inject(Firestore);
  firebaseMessenger: FirebaseMessengerService = inject(FirebaseMessengerService)
  messengerService: MessengerService = inject(MessengerService)
  threadService: ThreadService = inject(ThreadService)

  @Input() sourceThread: boolean;

  usersListAll: UserInterface[] = [];
  usersToMention: MentionUserInterface[] = [];
  filteredUsersToMention: MentionUserInterface[] = [];
  selectedFiles: any[] = [];

  selectedFile: File;
  selectedFileToView: any;
  userListSubscription: any;
  unsubChannelList: any;
  unsubAnswerList: any;
  date = new Date();
  messenger = 'messenger';
  mentionPersonView = false;
  mentionPersonViewFromBtn = false;
  mentionPersonBtnSrc: string;
  showEmojiBoard = false;
  laodMentionUsers = true;

  mentionConfig = {
    labelKey: 'userName',
    items: [] as MentionUserInterface[],
    mentionChar: "@",
    mentionDialogOpened: false,
  }
  mentionActive: boolean = false;

  @ViewChild('textareaMessenger') textareaMessenger!: ElementRef;
  @ViewChild('textareaThread') textareaThread!: ElementRef;
  private subscription!: Subscription;

  constructor(private dialog: MatDialog, private storage: Storage) {

  }


  ngOnInit() {
    this.subscription = this.messengerService.textareaMessenger.subscribe(() => {
      if (this.textareaMessenger) {
        this.textareaMessenger.nativeElement.focus();
      }
    });
    this.subscription = this.messengerService.textareaThread.subscribe(() => {
      if (this.textareaThread) {
        this.textareaThread.nativeElement.focus();

      }
    });

    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.usersListAll = users;
    });
  }


  ngAfterViewInit(): void {


  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.unsubChannelList;
  }


  checkForMention(content: any): void {
    this.mentionPersonBtnSrc = '';
    this.mentionPersonViewFromBtn = false;
    const inputContent = content;
    const mentionIndex = inputContent.lastIndexOf('@');
    if (this.messengerService.openChannel) {
      if (/\B@\w*$/.test(inputContent)) { // In diese IF kontrollorieren wir ob das @ am Anfang eines Wortes steht
        if (this.laodMentionUsers) {
          this.subChannelList();
          this.laodMentionUsers = false;
        }

        if (mentionIndex !== -1) {
          this.mentionPersonView = true;
          const searchText = inputContent.substring(mentionIndex + 1);
          this.mentionConfig.items = this.usersToMention.filter(user =>
            user.userName.toLowerCase().startsWith(searchText.toLowerCase())
          );
        } else {
          this.mentionPersonView = false;
        }
      } else if (/\B@\w*\s$/.test(inputContent)) { // In diese IF kontrollorieren wir ob nach dem @ (und weiter Zeichen) ein Leerzeichen steht;
        this.mentionPersonView = false;
      } else {
        this.mentionPersonView = false;
      }
    }
  }


  subChannelList() {
    const messegeRef = doc(collection(this.firestore, `channels`), this.messengerService.channel.channelID);
    return onSnapshot(messegeRef, (list) => {
      if (list.exists()) {
        this.usersToMention = [];
        this.mentionConfig.items = [];
        const usersIDs = list.data()['userIDs'];
        for (let i = 0; i < usersIDs.length; i++) {
          const userID = usersIDs[i];
          const user = this.usersListAll.filter(user => user.userID === userID);
          this.usersToMention.push(this.getCleanJson(user));
          this.usersToMention = this.usersToMention.filter(user => user.userID !== this.authService.currentUserSig()?.userID);
        }
        this.messengerService.sortByName(this.usersToMention);
        this.usersToMention.forEach((user) => {
          this.mentionConfig.items.push(user);
        });

      } else {
        console.error("doc is empty or doesn't exist");
      }
    })
  }


  getCleanJson(user: UserInterface[]) {
    let userJson = {
      avatar: user[0]['avatar'] || 'https://firebasestorage.googleapis.com/v0/b/dabubble-89d14.appspot.com/o/avatars%2Favatar-clean.png?alt=media&token=e32824ef-3240-4fa9-bc6c-a6f7b04d7b0a',
      userID: user[0]['userID'],
      userName: user[0]['username'],
    }
    return userJson;
  }


  openOrCloseMentionPersonView(src: string) {
    this.mentionPersonBtnSrc = src;
    this.subChannelList();
    if (this.mentionPersonView) {
      this.mentionPersonView = false;
      this.mentionPersonViewFromBtn = false;
      this.mentionPersonBtnSrc = '';
    } else {
      this.mentionPersonView = true;
      this.mentionPersonViewFromBtn = true;
    }
  }


  mentionUser(userJson: any, src: string) {
    const mentionText = `@${userJson.userName}`;
    if (this.mentionPersonViewFromBtn) {
      if (this.mentionPersonBtnSrc === 'messenger') {
        this.firebaseMessenger.content = this.firebaseMessenger.content + mentionText;
      } else if (this.mentionPersonBtnSrc === 'thread') {
        this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent + mentionText;
      }
    } else {
      if (src === 'messenger') {
        const mentionIndex = this.firebaseMessenger.content.lastIndexOf('@');
        this.firebaseMessenger.content = this.firebaseMessenger.content.substring(0, mentionIndex) + mentionText;
      } else {
        const mentionIndex = this.firebaseMessenger.answerContent.lastIndexOf('@');
        this.firebaseMessenger.answerContent = this.firebaseMessenger.answerContent.substring(0, mentionIndex) + mentionText;
      }
    }
    this.mentionPersonView = false;

  }


  /**
   * Return the text to show in the text area, depending on the user's location.
   * If the user is in a channel, return "Nachricht an #<channel name>".
   * If the user is in a private chat, return "Schreibe eine Nachricht an <username>".
   */
  chatOrChannelTxt() {
    if (this.messengerService.openChart) {
      return `Schreibe eine Nachricht an ${this.messengerService.user.username}`
    } else {
      return `Nachricht an #${this.messengerService.channel.title}`
    }
  }


  /**
   * Open or close the emoji board.
  */
  openOrCloseEmojiBoard() {
    this.showEmojiBoard = !this.showEmojiBoard;
  }


  /**
   * Handles the selection of files from an input event.
   * Reads the selected files and adds them to the `selectedFiles` array
   * as objects containing the file name, type, data URL, and raw file.
   * 
   * @param event - The file input change event containing the selected files.
   */
  onFileSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({ name: file.name, type: file.type, data: e.target.result, rawFile: file });
      };
      reader.readAsDataURL(file);
    }
  }


  /**
   * Opens a dialog with a preview of the given file.
   * 
   * @param file - The file to preview.
   */
  viewFile(file: any) {
    const dialogRef = this.dialog.open(FileViewDialogComponent, {
      width: '80%',
      height: '80%',
      data: { file: file }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.selectedFileToView = null;
    });
  }


  /**
   * Asynchronously uploads all selected files to Firebase Storage, updates the message content 
   * with file URLs, and clears the list of selected files.
   * 
   * @param messenger - A string indicating the type of messenger ('messenger' or 'thread') 
   *                    to determine the initial content to be updated.
   */
  async uploadFiles(messenger: any) {
    let originalContent = this.getInitialContent(messenger);
    const folderName = `uploads/${this.messengerService.user.userID}/`;
    for (const file of this.selectedFiles) {
      try {
        const url = await this.uploadFileToStorage(folderName, file);
        originalContent = this.appendFileToContent(originalContent, url, file);
      } catch (error) {
        console.error('Upload error for file: ', file.name, error);
      }
    }
    this.updateContent(messenger, originalContent);
    this.selectedFiles = [];
    this.ngOnInit();
  }


  /**
   * Retrieves the initial content based on the type of messenger.
   * 
   * @param messenger - A string indicating the type of messenger ('messenger' or 'thread').
   * @returns The initial content corresponding to the provided messenger type.
   */
  private getInitialContent(messenger: any): string {
    return messenger === 'messenger' ? this.firebaseMessenger.content : this.firebaseMessenger.answerContent;
  }


  /**
   * Uploads a file to Firebase Storage and returns the download URL.
   * The file is uploaded to the folder determined by the provided folderName
   * parameter. The file name is appended to the folder name to form the full
   * path in Storage.
   */
  private async uploadFileToStorage(folderName: string, file: any): Promise<string> {
    const filePath = `${folderName}${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const rawFile = file.rawFile;
    const snapshot = await uploadBytes(fileRef, rawFile);
    return await getDownloadURL(snapshot.ref);
  }


  /**
   * Appends an image or file link to the given content based on the file type.
   */
  private appendFileToContent(originalContent: string, url: string, file: any): string {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const imgTag = this.getImageTag(url, file.name, fileExtension);
    return `${originalContent}\n\n${imgTag}`;
  }


  /**
   * Generates an HTML image tag or link for a file based on its extension.
   */
  private getImageTag(url: string, fileName: string, fileExtension: string): string {
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return `<a href="${url}" target="_blank"><img src="${url}" alt="${fileName}" width="48px" height="48px"/> </a>`;
    } else {
      return `<a href="${url}" target="_blank"><img width="48px" height="48px" src="assets/icons/pdf.webp" alt="${fileName}"></a>`;
    }
  }


  /**
   * Updates the content of the messenger or thread based on the provided messenger type.
   * If the messenger type is 'messenger', the content is updated in the messenger and
   * a message is created. If the messenger type is 'thread', the answer content is updated
   * and an answer is created for the message with the ID determined by the threadService.
   */
  private updateContent(messenger: any, originalContent: string) {
    if (messenger === 'messenger') {
      this.firebaseMessenger.content = originalContent;
      let text = this.firebaseMessenger.content;
      if (this.messengerService.selectUserNewMessage.length > 0 || this.messengerService.selectChannelsNewMessage.length > 0) {
        if (this.messengerService.selectUserNewMessage.length > 0) {
          for (let i = 0; i < this.messengerService.selectUserNewMessage.length; i++) {
            let user = this.messengerService.selectUserNewMessage[i];
            this.firebaseMessenger.searchChat(user, true, (chartID: string) => {
              let chartOrChannel = 'chart';
              this.firebaseMessenger.content = text;
              this.firebaseMessenger.createMessage('noID', 'noCollection', false, chartID, chartOrChannel);
            });
            if (i === this.messengerService.selectUserNewMessage.length - 1) {
              setTimeout(() => {
                this.messengerService.selectUserNewMessage = [];
              }, 10);
            }
          }
        }
        if (this.messengerService.selectChannelsNewMessage.length > 0) {
          for (let i = 0; i < this.messengerService.selectChannelsNewMessage.length; i++) {
            let channel = this.messengerService.selectChannelsNewMessage[i];
            this.firebaseMessenger.searchChannel(channel, (chartID: string) => {
              let chartOrChannel = 'channel';
              this.firebaseMessenger.content = text;
              this.firebaseMessenger.createMessage('noID', 'noCollection', false, chartID, chartOrChannel = 'channel');
            });
            if (i === this.messengerService.selectChannelsNewMessage.length - 1) {
              setTimeout(() => {
                this.messengerService.selectChannelsNewMessage = [];
              }, 10);
            }
          }
        }
      } else {
        this.firebaseMessenger.createMessage('noID', 'noCollection', false);
        setTimeout(() => {
          this.messengerService.scrollToBottom(this.messengerService.scrollContainer);
        }, 10);
      }
    } else {
      this.firebaseMessenger.answerContent = originalContent;
      this.firebaseMessenger.createMessage(this.threadService.messageToReplyTo.messageID, 'answer', false);
      setTimeout(() => {
        this.messengerService.scrollToBottom(this.threadService.scrollContainer);
      }, 10);
    }
  }


  /**
   * Removes a file from the selected files array and UI.
   */
  deletePreviewFile(file: any) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

}
