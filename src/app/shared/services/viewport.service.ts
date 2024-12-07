import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  width: number = window.innerWidth;

  constructor() {
    this.initResizeListener();
  }

  initResizeListener() {
    fromEvent(window, 'resize')
      .pipe(
      // debounceTime(200) // nach responsive wieder ent kommentieren!
    )
      .subscribe(() => {
        this.width = window.innerWidth;
      });
  }
}
