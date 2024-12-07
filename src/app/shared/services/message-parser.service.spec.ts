import { TestBed } from '@angular/core/testing';

import { MessageParserService } from './message-parser.service';

describe('MessageParserService', () => {
  let service: MessageParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
