import { TestBed } from '@angular/core/testing';

import { TextareaServiceService } from './textarea-service.service';

describe('TextareaServiceService', () => {
  let service: TextareaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextareaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
