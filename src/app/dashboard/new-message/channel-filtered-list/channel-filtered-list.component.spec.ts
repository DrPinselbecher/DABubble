import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelFilteredListComponent } from './channel-filtered-list.component';

describe('ChannelFiltredListComponent', () => {
  let component: ChannelFilteredListComponent;
  let fixture: ComponentFixture<ChannelFilteredListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelFilteredListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChannelFilteredListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
