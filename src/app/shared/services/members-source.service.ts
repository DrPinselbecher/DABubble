import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MembersSourceService {

  membersSource = signal<any[]>([]);

}
