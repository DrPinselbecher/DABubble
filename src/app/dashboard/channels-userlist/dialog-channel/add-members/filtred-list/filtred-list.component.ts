import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserInterface } from '../../../../../landing-page/interfaces/userinterface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MembersSourceService } from '../../../../../shared/services/members-source.service';

@Component({
  selector: 'app-filtred-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './filtred-list.component.html',
  styleUrls: ['./filtred-list.component.scss']
})
export class FiltredListComponent {
  @Input() filteredUsers: UserInterface[] = [];
  @Input() highlightedIndex: number = -1;
  @Output() userSelected = new EventEmitter<UserInterface>();

  memberSourceService: MembersSourceService = inject(MembersSourceService);

  addUser(user: UserInterface) {
    this.userSelected.emit(user);
  }
}
