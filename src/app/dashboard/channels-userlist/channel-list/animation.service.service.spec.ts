import { TestBed } from '@angular/core/testing';

import { AnimationChannelService } from './animation.service.service';

describe('AnimationServiceService', () => {
  let service: AnimationChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
