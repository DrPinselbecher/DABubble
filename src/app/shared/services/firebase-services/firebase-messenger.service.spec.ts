import { TestBed } from '@angular/core/testing';

import { FirebaseMessengerService } from './firebase-messenger.service';

describe('MessengerService', () => {
  let service: FirebaseMessengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseMessengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
