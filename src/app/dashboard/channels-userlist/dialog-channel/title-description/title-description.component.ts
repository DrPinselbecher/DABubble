import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ChannelDataService } from '../channel-data.service';

@Component({
  selector: 'app-title-description',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './title-description.component.html',
  styleUrl: './title-description.component.scss'
})
export class TitleDescriptionComponent {

  channelDataService: ChannelDataService = inject(ChannelDataService);

  description: string;


  constructor() { }




}
