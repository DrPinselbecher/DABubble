import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Output, ViewChild, NgZone } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { Channel } from '../../../shared/interfaces/channel';
import { AnimationChannelService } from '../../channels-userlist/channel-list/animation.service.service';
import { ViewportService } from '../../../shared/services/viewport.service';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    TextFieldModule
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  @ViewChild('channelTitleInput') channelTitleInput: ElementRef;
  @ViewChild('channelDescriptionTextarea') channelDescriptionTextarea: ElementRef;
  @ViewChild(CdkTextareaAutosize) textareaAutosize!: CdkTextareaAutosize;

  @Output() closeOverlay = new EventEmitter<void>();

  ngZone: NgZone = inject(NgZone);

  messengerService: MessengerService = inject(MessengerService);
  authService: AuthserviceService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  viewportService: ViewportService = inject(ViewportService);

  editTitle: boolean = false;
  editDescription: boolean = false;

  descriptionTxt: string = '';
  titleTxt: string = '';


  constructor() {
    this.descriptionTxt = this.messengerService.channel.description;
    this.titleTxt = this.messengerService.channel.title;
  }

  isGlobalChannel() {
    return this.titleTxt === 'Allgemein';
  }

  closeDialog() {
    this.closeOverlay.emit();
  }

  editChannelTitle() {
    this.editTitle = !this.editTitle;

    if (!this.editTitle) {
      this.updateContent('title');
    }
    setTimeout(() => {
      this.channelTitleInput?.nativeElement.focus();
    }, 250);
  }

  editChannelDescription() {
    let textarea = this.channelDescriptionTextarea?.nativeElement;

    this.editDescription = !this.editDescription;

    if (this.editDescription) {
      if (textarea) {
        textarea.scrollTo({ top: textarea.scrollHeight, behavior: 'smooth' });
        setTimeout(() => {
          textarea.focus();
        }, 300);
      }
    } else {
      this.updateContent('description');
      this.channelDescriptionTextarea?.nativeElement.blur();
      this.channelDescriptionTextarea.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async leaveTheChannel() {
    let currentUserId = this.authService.currentUserSig()?.userID;
    let editChannelID = this.messengerService.channel.channelID!;
    this.messengerService.openMessenger = false;

    if (currentUserId) {
      this.messengerService.channel.userIDs = this.messengerService.channel.userIDs.filter(id => id !== currentUserId);
      if (this.messengerService.channel.userIDs.length === 0) {
        await this.channelAnimationService.updateListOfChannels();
        await this.firestoreService.deleteDoc('channels', editChannelID);
        // this.closeDialogAndHopToGlobalChannel();
        this.channelAnimationService.toggleChannels(); // statt zum allgemeinen channel geleitet zu werden
      } else {
        await this.channelAnimationService.updateListOfChannels();
        await this.firestoreService.updateDoc('channels', editChannelID, { userIDs: this.messengerService.channel.userIDs });
        // this.closeDialogAndHopToGlobalChannel();
        this.channelAnimationService.toggleChannels();  // statt zum allgemeinen channel geleitet zu werden
      }
    }
  }

  closeDialogAndHopToGlobalChannel() {
    this.closeDialog();
    let globalChannel = this.firestoreService.channelList$.value.find(channel => channel.title === 'Allgemein');
    globalChannel!.isFocus = true;
    this.messengerService.channel = globalChannel as Channel;
    this.channelAnimationService.toggleChannels();
  }

  async updateContent(content: string) {
    let editChannelID = this.messengerService.channel.channelID;

    if (content == 'title') {
      if (this.channelTitleInput?.nativeElement && this.channelTitleInput.nativeElement.value.length !== 0) {
        this.titleTxt = this.channelTitleInput.nativeElement.value;
        await this.firestoreService.updateDoc('channels', editChannelID!, { title: this.channelTitleInput.nativeElement.value });
        this.setNewChannelTitle(editChannelID!);
      } else {
        return
      }
    } else if (content == 'description') {
      await this.firestoreService.updateDoc('channels', editChannelID!, { description: this.descriptionTxt });
      this.setNewChannelDescription(editChannelID!);
    }
  }

  async setNewChannelTitle(editChannelID: string) {
    let obj = await this.firestoreService.getObjectById('channels', editChannelID);
    this.messengerService.channel.title = obj!["title"];
  }

  async setNewChannelDescription(editChannelID: string) {
    let obj = await this.firestoreService.getObjectById('channels', editChannelID);
    this.messengerService.channel.description = obj!["description"];
  }
}
