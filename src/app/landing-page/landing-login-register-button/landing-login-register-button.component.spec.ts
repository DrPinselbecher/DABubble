import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingLoginRegisterButtonComponent } from './landing-login-register-button.component';

describe('LandingLoginRegisterButtonComponent', () => {
  let component: LandingLoginRegisterButtonComponent;
  let fixture: ComponentFixture<LandingLoginRegisterButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingLoginRegisterButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingLoginRegisterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
