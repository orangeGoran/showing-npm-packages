import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Packages } from './packages';
import { PackagesService } from './services/packages-service';

describe('Packages', () => {
  let component: Packages;
  let fixture: ComponentFixture<Packages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Packages],
      providers: [
        {
          provide: PackagesService,
          useValue: {
            getPackages: vi.fn().mockReturnValue(of([])),
            getDependencies: vi.fn().mockReturnValue(of([])),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Packages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
