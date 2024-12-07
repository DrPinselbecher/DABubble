import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAvatarDialogComponent } from './landing-avatar-dialog.component';

describe('LandingAvatarDialogComponent', () => {
  let component: LandingAvatarDialogComponent;
  let fixture: ComponentFixture<LandingAvatarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingAvatarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingAvatarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
