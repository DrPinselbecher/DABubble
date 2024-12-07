import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserListComponent } from './user-list/user-list.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { MessengerService } from '../../shared/services/messenger-service/messenger.service';
import { ViewportService } from '../../shared/services/viewport.service';
import { SearchService } from '../../shared/services/search-service/search.service';

@Component({
  selector: 'app-channels-userlist',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    UserListComponent,
    ChannelListComponent
  ],
  templateUrl: './channels-userlist.component.html',
  styleUrls: ['./channels-userlist.component.scss']
})
export class ChannelsUserlistComponent {
  @ViewChild('searchInput') searchInput!: ElementRef;

  messengerService: MessengerService = inject(MessengerService);
  viewportService: ViewportService = inject(ViewportService);
  searchService: SearchService = inject(SearchService);

  constructor() { }

  /**
 * Focuses the search input element to allow the user to type a search query.
 */
  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
  }

  /**
 * Handles the search functionality by passing the user's input to the SearchService.
 */
  onSearch(): void {
    this.searchService.search(this.searchInput.nativeElement.value);
  }
}
