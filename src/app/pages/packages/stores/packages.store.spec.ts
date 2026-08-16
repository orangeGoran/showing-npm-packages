import { TestBed } from '@angular/core/testing';
import { getState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';
import { ApiTypes } from '../../../../types/api.types';
import { PackagesService } from '../services/packages-service';
import { packagesInitialState, PackagesStore } from './packages.store';

const PACKAGES: ApiTypes['getPackages'] = [
  { id: '@angular/core', weeklyDownloads: 4_200_000, dependencyCount: 2 },
  { id: 'rxjs', weeklyDownloads: 51_000, dependencyCount: 1 },
];

describe('PackagesStore', () => {
  let packagesService: {
    getPackages: ReturnType<typeof vi.fn>;
    getDependencies: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    packagesService = {
      getPackages: vi.fn().mockReturnValue(of(PACKAGES)),
      getDependencies: vi.fn().mockReturnValue(of([PACKAGES[1].id])),
    };

    TestBed.configureTestingModule({
      providers: [PackagesStore, { provide: PackagesService, useValue: packagesService }],
    });
  });

  it('starts from the initial state', () => {
    const store = TestBed.inject(PackagesStore);

    expect(getState(store)).toEqual({ ...packagesInitialState });
  });

  it('loads packages and splits scoped ids', () => {
    const store = TestBed.inject(PackagesStore);
    expect(store.packages()).toEqual([]);

    store.loadPackages();

    expect(packagesService.getPackages).toHaveBeenCalledTimes(1);
    expect(store.packages()).toEqual([
      { ...PACKAGES[0], id_first_part: '@angular', id_second_part: 'core' },
      { ...PACKAGES[1], id_first_part: 'rxjs', id_second_part: '' },
    ]);
    expect(store.isLoading()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  it('ignores a second loadPackages, but refreshPackages always refetches', () => {
    const store = TestBed.inject(PackagesStore);

    store.loadPackages();
    store.loadPackages();
    expect(packagesService.getPackages).toHaveBeenCalledTimes(1);

    store.refreshPackages();
    expect(packagesService.getPackages).toHaveBeenCalledTimes(2);
  });

  it('records the error message and stops loading when the request fails', () => {
    packagesService.getPackages.mockReturnValue(throwError(() => new Error('boom')));
    const store = TestBed.inject(PackagesStore);

    store.loadPackages();

    expect(store.hasError()).toBe(true);
    expect(store.errorMessage()).toBe('boom');
    expect(store.isLoading()).toBe(false);
    expect(store.packages()).toEqual([]);
  });

  it("should load package's dependencies and set active card", () => {
    const store = TestBed.inject(PackagesStore);

    const PKG = PACKAGES[0];

    store.loadDependenciesAndSetActiveCard(PKG.id);

    expect(packagesService.getDependencies).toHaveBeenCalledExactlyOnceWith(PKG.id);
    expect(store.activePackageId()).toBe(PKG.id);
    expect(store.packagesById()[PKG.id]).toEqual({
      status: 'loaded',
      dependencies: [PACKAGES[1].id],
    });
  });

  it("should not load package's dependencies if it's already loaded", () => {
    const store = TestBed.inject(PackagesStore);

    const PKG = PACKAGES[0];

    store.loadDependenciesAndSetActiveCard(PKG.id);
    store.loadDependenciesAndSetActiveCard(PKG.id);
    store.loadDependenciesAndSetActiveCard(PKG.id);
    store.loadDependenciesAndSetActiveCard(PKG.id);

    expect(packagesService.getDependencies).toHaveBeenCalledTimes(1);
    expect(store.activePackageId()).toBe(PKG.id);
    expect(store.packagesById()[PKG.id]).toEqual({
      status: 'loaded',
      dependencies: [PACKAGES[1].id],
    });
  });

  it('should unset the hovered package card', () => {
    const store = TestBed.inject(PackagesStore);

    store.loadDependenciesAndSetActiveCard(PACKAGES[0].id);

    expect(store.activePackageId()).toBe(PACKAGES[0].id);

    store.unsetHoverPackage(PACKAGES[0].id);

    expect(store.activePackageId()).toBe('');
  });

  it('should ignore a stale unset coming from a card that is no longer active', () => {
    const store = TestBed.inject(PackagesStore);

    // Pointer moves across card A and onto card B.
    store.loadDependenciesAndSetActiveCard(PACKAGES[0].id);
    store.loadDependenciesAndSetActiveCard(PACKAGES[1].id);

    expect(store.activePackageId()).toBe(PACKAGES[1].id);

    // Card A's mouseleave arrives late, after card B is already active.
    store.unsetHoverPackage(PACKAGES[0].id);

    expect(store.activePackageId()).toBe(PACKAGES[1].id);
  });

  it('should filter packages by search query', () => {
    const store = TestBed.inject(PackagesStore);

    expect(store.filteredPackages()).toEqual([]);

    store.loadPackages();

    expect(store.packages()).toEqual([
      { ...PACKAGES[0], id_first_part: '@angular', id_second_part: 'core' },
      { ...PACKAGES[1], id_first_part: 'rxjs', id_second_part: '' },
    ]);

    store.setSearchQuery('angular');

    expect(store.filteredPackages()).toEqual([
      { ...PACKAGES[0], id_first_part: '@angular', id_second_part: 'core' },
    ]);

    store.setSearchQuery('banana');

    expect(store.filteredPackages()).toEqual([]);

    store.setSearchQuery('  AnguLar  ');

    expect(store.filteredPackages()).toEqual([
      { ...PACKAGES[0], id_first_part: '@angular', id_second_part: 'core' },
    ]);

    store.setSearchQuery('');

    expect(store.filteredPackages()).toEqual([
      { ...PACKAGES[0], id_first_part: '@angular', id_second_part: 'core' },
      { ...PACKAGES[1], id_first_part: 'rxjs', id_second_part: '' },
    ]);
  });
});
