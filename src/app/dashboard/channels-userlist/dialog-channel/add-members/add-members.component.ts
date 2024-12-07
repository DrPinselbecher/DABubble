import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { FirestoreService } from '../../../../shared/services/firebase-services/firestore.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Channel } from '../../../../shared/interfaces/channel';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../../../landing-page/interfaces/userinterface';
import { MatCardModule } from '@angular/material/card';
import { AuthserviceService } from '../../../../landing-page/services/authservice.service';
import { FiltredListComponent } from './filtred-list/filtred-list.component';
import { MembersSourceService } from '../../../../shared/services/members-source.service';
import { AnimationChannelService } from '../../channel-list/animation.service.service';
import { ViewportService } from '../../../../shared/services/viewport.service';

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatIconModule,
    MatRadioModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCardModule,
    FiltredListComponent
  ],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss'
})
export class AddMembersComponent {
  @ViewChild('userInput') userInputElement!: ElementRef<HTMLInputElement>;

  @Output() inputSelectedChange = new EventEmitter<boolean>();
  @Output() inputValueChange = new EventEmitter<boolean>();


  firestoreService: FirestoreService = inject(FirestoreService);
  memberSourceService: MembersSourceService = inject(MembersSourceService);
  authService: AuthserviceService = inject(AuthserviceService);
  viewportService: ViewportService = inject(ViewportService);

  channelListSubscription!: Subscription;
  channelList: Channel[] = [];

  userListSubscription!: Subscription;
  userList: UserInterface[] = [];
  inputUserList: UserInterface[] = [];

  filteredUsers: UserInterface[] = [];

  scrolledToEnd: boolean = false;
  selectInput: boolean = false;
  endAnimation: boolean = true;

  highlightedIndex: number = -1;

  pickChannelValue: string;


  constructor() {
    this.inputUserList.push(this.authService.currentUserSig()!);
  }

  get pickChannel(): string {
    return this.pickChannelValue;
  }

  set pickChannel(value: string) {
    this.pickChannelValue = value;
    this.isFocus(value);
  }

  ngOnInit(): void {
    let currentUserId = this.authService.currentUserSig()!.userID;

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.channelList = channels.filter(channel => channel.userIDs.includes(currentUserId));
    });

    this.userListSubscription = this.firestoreService.userList$.subscribe(user => {
      this.userList = user;
    });
  }

  onUserAdded(user: UserInterface): void {
    this.add(user);
  }

  onWheel(event: WheelEvent) {
    let element = event.currentTarget as HTMLElement;

    event.preventDefault();
    element.scrollLeft += event.deltaY;
  }

  scrollToRight(): void {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;

    if (element) {

      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });

        if (this.inputUserList.length < 3 && this.viewportService.width > 460) {
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

  scrollToSelectedUser(): void {
    let matCardContent = document.querySelector('mat-card-content') as HTMLElement;
    let selectedButton = matCardContent.querySelectorAll('button')[this.highlightedIndex] as HTMLElement;

    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  scrollToRightAfterAnimation() {
    let element = document.querySelector('.add-specific-member-contain') as HTMLElement;
    this.memberSourceService.membersSource.set([...this.inputUserList]);
    if (element) {
      setTimeout(() => {
        element.scrollTo({
          left: element.scrollWidth,
          behavior: 'smooth'
        });
        element.addEventListener('scroll', () => {
          if (element.scrollLeft + element.clientWidth >= element.scrollWidth && this.userInputElement) {
            this.userInputElement.nativeElement.focus();
          }
        }, { once: false });
      }, 500);
    }
  }

  resetLowerGroup() {
    if (this.selectInput) {
      this.endAnimation = false;
      this.selectInput = false;
      this.filteredUsers = [];
      this.inputSelectedChange.emit(this.selectInput);
      setTimeout(() => this.endAnimation = true, 200);
    } else {
      return;
    }
  }

  resetUpperGroup() {
    this.selectInput = true;
    this.inputSelectedChange.emit(this.selectInput);
    this.pickChannel = '';
    if (this.inputUserList.length < 2) {
      setTimeout(() => {
        this.userInputElement.nativeElement.focus();
      }, 400);
    }
  }

  isFocus(selectedTitle: string) {
    this.channelList.forEach(channel => {
      if (channel.title === selectedTitle) {
        if (this.selectInput) {
          setTimeout(() => {
            this.memberSourceService.membersSource.update(() => [...channel.userIDs]);
          }, 200);
        } else {
          this.memberSourceService.membersSource.set([]);
          this.memberSourceService.membersSource.update(members => [...members, ...channel.userIDs]);
        }
      }
    });
  }

  onScroll(event: Event): void {
    let element = event.target as HTMLElement;
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      this.scrolledToEnd = true;
    } else {
      this.scrolledToEnd = false;
    }
  }

  getChannelListClass(): string {
    let channels = this.channelList.length;

    if (channels > 4) {
      return 'scrollable';
    } else if (channels == 1) {
      return 'set-min-height-channel-list';
    } else {
      return '';
    }
  }

  needsToAddScroll() {
    return this.channelList.length > 4;
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

  searchUserByName(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();
    let existingMembers = this.memberSourceService.membersSource().map(member => member.userID);
    let currentUser = this.authService.currentUserSig()!.userID;

    if (value) {
      this.filteredUsers = this.userList.filter(user => {
        let fullName = user.username.toLowerCase();
        return fullName.includes(value) && !existingMembers.includes(user.userID) && user.userID !== currentUser;
      });
      this.highlightedIndex = -1;
    } else {
      this.filteredUsers = [];
      this.highlightedIndex = -1;
    }
  }

  add(user: UserInterface): void {
    if (user) {
      this.memberSourceService.membersSource.update(members => [...members, user]);
      this.inputUserList = this.memberSourceService.membersSource();
      this.userInputElement.nativeElement.value = '';
      this.highlightedIndex = -1;
      this.filteredUsers = [];
    }
    this.scrollToRight();
  }

  remove(member: UserInterface): void {
    this.memberSourceService.membersSource.update(members => {
      let index = members.indexOf(member);
      if (index >= 0) {
        members.splice(index, 1);
        this.inputUserList = this.memberSourceService.membersSource();
      }
      return [...members];
    });
  }
}
