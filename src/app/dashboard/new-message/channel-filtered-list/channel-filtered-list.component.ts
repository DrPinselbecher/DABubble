import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Channel } from '../../../shared/interfaces/channel';

@Component({
  selector: 'app-channel-filtered-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './channel-filtered-list.component.html',
  styleUrl: './channel-filtered-list.component.scss'
})
export class ChannelFilteredListComponent {
  @Input() filteredChannels: Channel[] = [];
  @Input() highlightedIndex: number = -1;
  @Output() channelSelected = new EventEmitter<Channel>();


  constructor() { }


  addChannel(channel: Channel) {
    this.channelSelected.emit(channel);
  }
}
