import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { SearchService } from '../../services/search-service/search.service';
import { CommonModule } from '@angular/common';
import { RedirectService } from '../../services/redirect-service/redirect.service';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent {
  searchService = inject(SearchService);
  showUsers:boolean = false
  showThreads:boolean = false
  showMessages:boolean = false
  showChannels:boolean = false
  showMessagesInChannels:boolean = false
  showMesagesInChannelThreads: boolean = false
  elementRef = inject(ElementRef);
  redirectService = inject(RedirectService);

  
  toggleView(view: 'users' | 'threads' | 'messages' | 'channels' | 'messagesInChannels' | 'channelsThreads') {
    this.showUsers = view === 'users' ? !this.showUsers : false;
    this.showThreads = view === 'threads' ? !this.showThreads : false;
    this.showMessages = view === 'messages' ? !this.showMessages : false;
    this.showChannels = view === 'channels' ? !this.showChannels : false;
    this.showMessagesInChannels = view === 'messagesInChannels' ? !this.showMessagesInChannels : false;
    this.showMesagesInChannelThreads = view === 'channelsThreads' ? !this.showMesagesInChannelThreads : false;
  }

  getTotalAnswers(): number {
    return this.searchService.filteredMessagesInChannels.reduce((total, channelWithMessages) => {
      return total + channelWithMessages.answers.length;
    }, 0);
  }

  getTotalMessages(): number {
    return this.searchService.filteredMessagesInChannels.reduce((total, channelWithMessages) => {
      return total + channelWithMessages.messages.length;
    }, 0);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.searchService.madeQuery = false; 
    }

  }

}
