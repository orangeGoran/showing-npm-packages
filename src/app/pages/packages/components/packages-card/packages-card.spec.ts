import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PackagesService } from '../../services/packages-service';
import { PackagesState, PackagesStore } from '../../stores/packages.store';
import { PackagesCard } from './packages-card';

const BASE_PACKAGE: PackagesState['packages'][number] = {
  id: 'test',
  weeklyDownloads: 0,
  dependencyCount: 0,
  id_first_part: 'test',
  id_second_part: '',
};

describe('PackagesCard', () => {
  let fixture: ComponentFixture<PackagesCard>;

  const createCard = async (pkg: PackagesState['packages'][number]) => {
    fixture = TestBed.createComponent(PackagesCard);
    fixture.componentRef.setInput('package', pkg);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesCard],
      providers: [
        PackagesStore,
        {
          provide: PackagesService,
          useValue: {
            getPackages: vi.fn().mockReturnValue(of([])),
            getDependencies: vi.fn().mockReturnValue(of([])),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    await createCard(BASE_PACKAGE);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a plain package name without a highlighted scope', async () => {
    await createCard({ ...BASE_PACKAGE, id: 'rxjs', id_first_part: 'rxjs', id_second_part: '' });

    const header: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(header.textContent?.trim()).toBe('rxjs');
    expect(header.querySelector('span')).toBeNull();
  });

  it('renders the scope of a scoped package in a highlighted span', async () => {
    await createCard({
      ...BASE_PACKAGE,
      id: '@angular/core',
      id_first_part: '@angular',
      id_second_part: 'core',
    });

    const header: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(header.textContent?.replace(/\s/g, '')).toBe('@angular/core');
    expect(header.querySelector('span')?.textContent).toBe('@angular/');
  });

  it('formats downloads and dependencies with the compact number pipe', async () => {
    await createCard({
      ...BASE_PACKAGE,
      id: 'semver',
      id_first_part: 'semver',
      id_second_part: '',
      weeklyDownloads: 212245384,
      dependencyCount: 1500,
    });

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('212245K');
    expect(text).toContain('1K');
  });
});
