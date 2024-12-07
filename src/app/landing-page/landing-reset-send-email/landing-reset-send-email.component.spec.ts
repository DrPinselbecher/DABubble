import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingResetSendEmailComponent } from './landing-reset-send-email.component';

describe('LandingResetSendEmailComponent', () => {
  let component: LandingResetSendEmailComponent;
  let fixture: ComponentFixture<LandingResetSendEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingResetSendEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingResetSendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
