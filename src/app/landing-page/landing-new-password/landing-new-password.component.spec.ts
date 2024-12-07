import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingNewPasswordComponent } from './landing-new-password.component';

describe('LandingNewPasswordComponent', () => {
  let component: LandingNewPasswordComponent;
  let fixture: ComponentFixture<LandingNewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingNewPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingNewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
