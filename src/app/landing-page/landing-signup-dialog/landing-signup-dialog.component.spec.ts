import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingSignupDialogComponent } from './landing-signup-dialog.component';

describe('LandingSignupDialogComponent', () => {
  let component: LandingSignupDialogComponent;
  let fixture: ComponentFixture<LandingSignupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSignupDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingSignupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
