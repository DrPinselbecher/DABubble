import { TestBed } from '@angular/core/testing';

import { MembersSourceService } from './members-source.service';

describe('MembersSourceService', () => {
  let service: MembersSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MembersSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
