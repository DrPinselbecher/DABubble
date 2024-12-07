import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelComponent } from './dialog-channel.component';

describe('DialogChannelComponent', () => {
  let component: DialogChannelComponent;
  let fixture: ComponentFixture<DialogChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
