import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleDescriptionComponent } from './title-description/title-description.component';
import { AddMembersComponent } from './add-members/add-members.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { AnimationChannelService } from '../channel-list/animation.service.service';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';
import { MatIconModule } from '@angular/material/icon';
import { ChannelDataService } from './channel-data.service';
import { MembersSourceService } from '../../../shared/services/members-source.service';

@Component({
  selector: 'app-dialog-channel',
  standalone: true,
  imports: [
    CommonModule,
    TitleDescriptionComponent,
    AddMembersComponent,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './dialog-channel.component.html',
  styleUrl: './dialog-channel.component.scss'
})
export class DialogChannelComponent {

  firestoreService: FirestoreService = inject(FirestoreService);
  authService: AuthserviceService = inject(AuthserviceService);
  channelDataService: ChannelDataService = inject(ChannelDataService);
  memberSourceService: MembersSourceService = inject(MembersSourceService);
  channelAnimationService: AnimationChannelService = inject(AnimationChannelService);
  dialogRef: MatDialogRef<DialogChannelComponent> = inject(MatDialogRef);

  showAddMembersDialog: boolean = false;
  selectInput: boolean = false;
  channelIsCreated: boolean = false;

  inputValueEmpty: boolean = true;


  constructor() {
    this.channelDataService.titleSource = '';
    this.channelDataService.descriptionSource = '';
  }

  onSelectInputChanged(newSelect: boolean) {
    this.selectInput = newSelect;
  }

  inputValueChange(isEmpty: boolean) {
    this.inputValueEmpty = isEmpty;
  }

  getDialogClass(): string {
    let channels = this.channelAnimationService.channelList.length;
    if (!this.showAddMembersDialog) {
      return 'title-description-height';
    }
    if (channels === 1) {
      return 'add-member-height-fore-one';
    } else if (channels === 2) {
      return 'add-member-height-fore-two';
    } else if (channels >= 3) {
      return 'add-member-height-fore-more';
    }
    return 'add-member-height-fore-empty';
  }

  showAddMembers() {
    this.showAddMembersDialog = true;
  }

  close() {
    this.dialogRef.close();
  }

  setChannelOnject() {
    return {
      title: this.channelDataService.titleSource,
      description: this.channelDataService.descriptionSource,
      createdBy: this.authService.currentUserSig()!.username,
      isFocus: false,
      userIDs: this.getUserIDs(),
      messages: []
    }
  }

  getUserIDs(): string[] {
    let members = this.memberSourceService.membersSource();

    if (members[0].username) {
      return members.map(user => user.userID);
    } else {
      return members;
    }
  }

  async addChannel() {
    try {
      this.channelIsCreated = true;
      this.dialogRef.close();
      await this.channelAnimationService.updateListOfChannels();
      await this.firestoreService.addDoc(this.setChannelOnject(), 'channels');
      this.channelAnimationService.toggleChannels();
      this.channelIsCreated = false;
      this.memberSourceService.membersSource.set([]);
    } catch (err) {
      console.error(err);
    }
  }

  isTitleInputEmpty() {
    return !this.channelDataService.titleSource.length;
  }

  channelTitleExist(): boolean {
    const inputTitle = this.channelDataService.titleSource.toLowerCase();
    for (let channel of this.firestoreService.channelList$.value) {
      if (channel.title.toLowerCase() === inputTitle) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
    if (this.channelIsCreated) return;
    this.memberSourceService.membersSource.set([]);
  }
}
