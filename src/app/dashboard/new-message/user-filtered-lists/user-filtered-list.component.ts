import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserInterface } from '../../../landing-page/interfaces/userinterface';
import { Channel } from '../../../shared/interfaces/channel';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-filtered-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './user-filtered-list.component.html',
  styleUrl: './user-filtered-list.component.scss'
})
export class UserFilteredListComponent {
  @Input() filteredUsers: UserInterface[] = [];
  @Input() highlightedIndex: number = -1;
  @Output() userSelected = new EventEmitter<UserInterface>();


  constructor() { }


  addUser(user: UserInterface) {
    this.userSelected.emit(user);
  }
}
