import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../../landing-page/services/authservice.service';
import { CommonModule } from '@angular/common';
import { DetailPersonComponent } from '../detail-person/detail-person.component';
import { MessengerService } from '../../../shared/services/messenger-service/messenger.service';
import { MatChipsModule } from '@angular/material/chips';
import { MembersSourceService } from '../../../shared/services/members-source.service';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { MatRadioModule } from '@angular/material/radio';
import { FilteredListComponent } from './filtered-list/filtered-list.component';
import { FirestoreService } from '../../../shared/services/firebase-services/firestore.service';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    MatChipsModule,
    MatRadioModule,
    FilteredListComponent
  ],
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.scss'
})
export class AddPersonComponent {
  messengerService = inject(MessengerService);
  authService = inject(AuthserviceService);
  dialog = inject(MatDialog);
  firestoreService = inject(FirestoreService);
  memberSourceService = inject(MembersSourceService);

  @Input() users: UserInterface[] = [];
  @Input() addPersonView: boolean = false;
  @Output() closeOverlay = new EventEmitter<void>();

  @ViewChild('userInput') userInputElement!: ElementRef<HTMLInputElement>;

  filteredUsers: UserInterface[] = [];
  highlightedIndex = -1;




  checkText() {
    return this.addPersonView ? 'Leute hinzufügen' : 'Mitglieder';
  }


  openAddPerson() {
    this.memberSourceService.membersSource.set([]);
    this.addPersonView = true;
    setTimeout(() => this.userInputElement.nativeElement.focus(), 100);
  }


  closeDialog() {
    this.closeOverlay.emit();
  }


  openDialogDetailPerson(user: any) {
    this.messengerService.showMessageBtn = true;
    user.isFocus = true;
    this.dialog.open(DetailPersonComponent, {
      data: user,
    });
  }


  onWheel(event: WheelEvent) {
    let element = event.currentTarget as HTMLElement;

    event.preventDefault();
    element.scrollLeft += event.deltaY;
  }


  remove(member: UserInterface): void {
    this.memberSourceService.membersSource.update(members => {
      let index = members.indexOf(member);
      if (index >= 0) {
        members.splice(index, 1);
      }
      return [...members];
    });
  }


  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
    if (this.filteredUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'ArrowUp') {
        this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredUsers.length) % this.filteredUsers.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
        this.add(this.filteredUsers[this.highlightedIndex]);
      }
    }
  }


  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;

    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }


  add(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }


  scrollToRight(): void {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;

    if (element) {

      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });

        if (this.memberSourceService.membersSource().length < 1) {
          this.userInputElement.nativeElement.focus();
        } else {
          element.addEventListener('scroll', () => {
            if (element.scrollLeft + element.clientWidth >= element.scrollWidth && this.userInputElement) {
              this.userInputElement.nativeElement.focus();
            }
          }, { once: false });
        }
      }, 100);
    }
  }


  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();
    let existingMembersOnInput = this.memberSourceService.membersSource().map(member => member.userID);
    let currentUser = this.authService.currentUserSig()!.userID;
    let userValue = this.firestoreService.userList$.value;

    if (value) {
      this.filteredUsers = userValue.filter(user => {
        let fullName = user.username.toLowerCase();
        return fullName.includes(value) && !this.existingMembersOnChannel().includes(user.userID) && !existingMembersOnInput.includes(user.userID) && user.userID !== currentUser;
      });
      this.highlightedIndex = -1;
    } else {
      this.filteredUsers = [];
      this.highlightedIndex = -1;
    }
  }


  existingMembersOnChannel() {
    return this.users.map(member => member.userID);
  }

  onUserAdded(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }

  async addMembersToChannel() {
    let channel = this.messengerService.channel;
    let newUser = this.getUserIDs();
    let allMember = newUser.concat(this.existingMembersOnChannel());

    try {
      await this.firestoreService.updateDoc('channels', channel.channelID!, { userIDs: allMember });
      this.closeDialog();
    } catch (err) {
      console.error(err);
    }
  }

  getUserIDs(): string[] {
    let members = this.memberSourceService.membersSource();
    return members.map(user => user.userID);
  }

  ngOnDestroy() {
    this.memberSourceService.membersSource.set([]);
  }
}
