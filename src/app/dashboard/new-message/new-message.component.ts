import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserInterface } from '../../landing-page/interfaces/userinterface';
import { Channel } from '../../shared/interfaces/channel';
import { AuthserviceService } from '../../landing-page/services/authservice.service';
import { FirestoreService } from '../../shared/services/firebase-services/firestore.service';
import { Subscription } from 'rxjs';
import { UserFilteredListComponent } from './user-filtered-lists/user-filtered-list.component';
import { ChannelFilteredListComponent } from './channel-filtered-list/channel-filtered-list.component';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [
    CommonModule,
    TextareaComponent,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    UserFilteredListComponent,
    ChannelFilteredListComponent
  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  @ViewChild('userInput', { static: true }) userInputElement: ElementRef<HTMLInputElement>;

  messengerService: MessengerService = inject(MessengerService);
  authService: AuthserviceService = inject(AuthserviceService);
  firestoreService: FirestoreService = inject(FirestoreService);

  userList: UserInterface[] = [];
  userListSubscription!: Subscription;

  channelList: Channel[] = [];
  channelListSubscription!: Subscription;

  filteredUsers: UserInterface[] = [];
  filteredChannels: Channel[] = [];

  highlightedIndex: number = -1;

  sourceThread: boolean = false;
  filterUsers: boolean = false;
  filterChannels: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
      this.userList = users;
    });

    this.channelListSubscription = this.firestoreService.channelList$.subscribe(channels => {
      this.channelList = channels;
    });

    this.userInputElement.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
    if (this.channelListSubscription) {
      this.channelListSubscription.unsubscribe();
    }
  }

  onUserAdded(user: UserInterface): void {
    this.messengerService.selectUserNewMessage.push(user);
    this.clearFilters();
    this.userInputElement.nativeElement.value = '';
    this.userInputElement.nativeElement.focus();
  }

  onChannelAdded(channel: Channel): void {
    this.messengerService.selectChannelsNewMessage.push(channel);
    this.clearFilters();
    this.userInputElement.nativeElement.value = '';
    this.userInputElement.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.filterUsers) {
      this.handleUserListNavigation(event);
    } else if (this.filterChannels) {
      this.handleChannelListNavigation(event);
    }
  }

  handleUserListNavigation(event: KeyboardEvent): void {
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
        this.onUserAdded(this.filteredUsers[this.highlightedIndex]);
        this.highlightedIndex = -1;
      }
    }
  }

  handleChannelListNavigation(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }

    if (this.filteredChannels.length > 0) {
      if (event.key === 'ArrowDown') {
        this.highlightedIndex = (this.highlightedIndex + 1) % this.filteredChannels.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'ArrowUp') {
        this.highlightedIndex = (this.highlightedIndex - 1 + this.filteredChannels.length) % this.filteredChannels.length;
        this.scrollToSelectedUser();
      } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
        this.onChannelAdded(this.filteredChannels[this.highlightedIndex]);
        this.highlightedIndex = -1;
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

  handleSearching(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim().toLowerCase();

    if (value === '') {
      this.clearFilters();
    } else if (value.startsWith('@')) {
      this.filterByUsername(value.slice(1));
    } else if (value.startsWith('#')) {
      this.filterByChannel(value.slice(1));
    } else {
      this.filterByEmail(value);
    }
  }

  clearFilters(): void {
    this.filterUsers = false;
    this.filterChannels = false;
    this.filteredUsers = [];
    this.filteredChannels = [];
  }

  filterByUsername(value: string): void {
    this.filterUsers = true;
    this.filterChannels = false;
    this.filteredUsers = this.userList.filter(user =>
      user.username.toLowerCase().includes(value) &&
      !this.messengerService.selectUserNewMessage.includes(user)
    );
  }

  filterByChannel(value: string): void {
    this.filterUsers = false;
    this.filterChannels = true;
    this.filteredChannels = this.channelList.filter(channel =>
      channel.title.toLowerCase().includes(value) &&
      !this.messengerService.selectChannelsNewMessage.includes(channel)
    );
  }

  filterByEmail(value: string): void {
    this.filterUsers = true;
    this.filterChannels = false;
    this.filteredUsers = this.userList.filter(user =>
      user.email.toLowerCase().includes(value) &&
      !this.messengerService.selectUserNewMessage.includes(user)
    );
  }

  searchUserByEmail(value: string) {
    this.filterUsers = true;
    this.filterChannels = false;

    this.filteredUsers = this.userList.filter(user =>
      user.email.toLowerCase().includes(value) &&
      !this.messengerService.selectUserNewMessage.includes(user)
    );
  }

  removeSelectedUser(user: UserInterface): void {    
    this.messengerService.selectUserNewMessage = this.messengerService.selectUserNewMessage.filter(selectedUser => selectedUser.userID !== user.userID);
  }

  removeSelectedChannel(channel: Channel): void {
    this.messengerService.selectChannelsNewMessage = this.messengerService.selectChannelsNewMessage.filter(selectedChannel => selectedChannel.channelID !== channel.channelID);
  }
}
