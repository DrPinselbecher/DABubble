import { TestBed } from '@angular/core/testing';

import { BrowserTypeService } from './browser-type-on-touch.service';

describe('BrowserTypeService', () => {
  let service: BrowserTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
