import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelDataService {

  titleSource: string = '';
  descriptionSource: string = '';

  constructor() { }
}
