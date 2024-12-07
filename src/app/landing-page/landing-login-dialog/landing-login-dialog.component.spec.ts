import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingLoginDialogComponent } from './landing-login-dialog.component';

describe('LandingLoginDialogComponent', () => {
  let component: LandingLoginDialogComponent;
  let fixture: ComponentFixture<LandingLoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingLoginDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingLoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
