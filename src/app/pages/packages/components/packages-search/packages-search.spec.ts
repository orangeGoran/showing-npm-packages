import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesSearch } from './packages-search';

describe('PackagesSearch', () => {
  let component: PackagesSearch;
  let fixture: ComponentFixture<PackagesSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
