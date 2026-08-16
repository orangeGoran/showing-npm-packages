import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesCard } from './packages-card';

describe('PackagesCard', () => {
  let component: PackagesCard;
  let fixture: ComponentFixture<PackagesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
