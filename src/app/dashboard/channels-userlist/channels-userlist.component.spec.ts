import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelsUserlistComponent } from './channels-userlist.component';

describe('ChannelsUserlistComponent', () => {
  let component: ChannelsUserlistComponent;
  let fixture: ComponentFixture<ChannelsUserlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelsUserlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelsUserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
