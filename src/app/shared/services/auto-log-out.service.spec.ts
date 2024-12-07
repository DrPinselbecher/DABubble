import { TestBed } from '@angular/core/testing';

import { AutoLogoutService } from './auto-log-out.service';

describe('AutoLogOutService', () => {
  let service: AutoLogoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoLogoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
