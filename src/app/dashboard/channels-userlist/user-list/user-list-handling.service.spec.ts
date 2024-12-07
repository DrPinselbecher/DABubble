import { TestBed } from '@angular/core/testing';

import { UserListHandlingService } from './user-list-handling.service';

describe('ListHandlingService', () => {
  let service: UserListHandlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserListHandlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
