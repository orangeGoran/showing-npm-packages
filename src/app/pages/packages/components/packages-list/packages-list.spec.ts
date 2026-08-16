import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiTypes } from '../../../../../types/api.types';
import { PackagesService } from '../../services/packages-service';
import { PackagesStore } from '../../stores/packages.store';
import { PackagesList } from './packages-list';

const PACKAGES: ApiTypes['getPackages'] = [
  { id: '@angular/core', weeklyDownloads: 4_200_000, dependencyCount: 2 },
  { id: 'rxjs', weeklyDownloads: 51_000, dependencyCount: 1 },
];

describe('PackagesList', () => {
  let fixture: ComponentFixture<PackagesList>;
  let store: InstanceType<typeof PackagesStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesList],
      providers: [
        PackagesStore,
        {
          provide: PackagesService,
          useValue: {
            getPackages: vi.fn().mockReturnValue(of(PACKAGES)),
            getDependencies: vi.fn().mockReturnValue(of([])),
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(PackagesStore);

    fixture = TestBed.createComponent(PackagesList);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one card per package', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-packages-card');
    expect(cards.length).toBe(PACKAGES.length);
  });

  it('shows the empty state when no package matches the search', async () => {
    store.setSearchQuery('does-not-exist');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('app-packages-card').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No packages found.');
  });
});
