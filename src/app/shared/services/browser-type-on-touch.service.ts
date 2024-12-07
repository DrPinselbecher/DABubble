import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserTypeOnTouchService {

  constructor() { }

  isSafari(): boolean {
    let userAgent = navigator.userAgent.toLowerCase();
    let isIOS = /iphone|ipad|ipod/.test(userAgent);
    let isSafariBrowser = userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('crios');

    return isIOS ? !userAgent.includes('crios') && isSafariBrowser : isSafariBrowser;
  }

  isChrome(): boolean {
    let userAgent = navigator.userAgent.toLowerCase();
    let isIOS = /iphone|ipad|ipod/.test(userAgent);
    let isChromeBrowser = userAgent.includes('chrome') || userAgent.includes('crios');

    return isIOS ? userAgent.includes('crios') : isChromeBrowser;
  }

  isTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;
  }
}
