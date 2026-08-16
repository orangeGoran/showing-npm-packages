import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, filter, map, mergeMap, pipe, tap } from 'rxjs';
import { ApiTypes } from '../../../../types/api.types';
import { PackagesService } from '../services/packages-service';

type PackageWithExtra = ApiTypes['getPackages'][number] & {
  /**
   * The first part of the package ID before the slash (if any). If the package
   * ID does not contain a slash, this will be the entire ID.
   */
  id_first_part: string;
  /**
   * The second part of the package ID. If the package ID does not contain a slash,
   * this will be an empty string.
   */
  id_second_part: string;
};

type LocalApiType = Omit<ApiTypes, 'getPackages'> & {
  getPackages: PackageWithExtra[];
};

export type PackagesState = {
  packages: LocalApiType['getPackages'];
  loadedAtLeastOnce: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  searchQuery: string;
  packagesById: {
    [packageId: string]: {
      status: 'loading' | 'loaded' | 'error';
      dependencies: ApiTypes['getPackageDependencies'];
    };
  };
  activePackageId: string;
};

export const packagesInitialState: PackagesState = {
  packages: [],
  loadedAtLeastOnce: false,
  isLoading: true,
  hasError: false,
  errorMessage: '',
  searchQuery: '',
  packagesById: {},
  activePackageId: '',
};

export const PackagesStore = signalStore(
  withState(packagesInitialState),
  withComputed(({ packages, searchQuery }) => ({
    filteredPackages: computed(() => {
      const search = searchQuery().trim().toLocaleLowerCase();

      if (search === '') {
        return packages();
      }

      return packages().filter((pkg) => {
        return pkg.id.toLowerCase().includes(search);
      });
    }),
  })),
  withMethods((store, packagesService = inject(PackagesService)) => {
    const fetchPackages = () => {
      patchState(store, {
        isLoading: true,
        loadedAtLeastOnce: true,
        hasError: false,
        errorMessage: '',
      });

      return packagesService.getPackages().pipe(
        map(mapAndSplitPackageId),
        tap((packages) => {
          patchState(store, { packages, isLoading: false });
        }),
        catchError((error: unknown) => {
          patchState(store, {
            hasError: true,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
          return EMPTY;
        }),
      );
    };

    return {
      /**
       * Initial load of packages from api
       */
      loadPackages: rxMethod<void>(
        pipe(
          filter(() => !store.loadedAtLeastOnce()),

          // Using exhaust map, since there is no need to take
          // last packages (just use the first one)
          exhaustMap(() => fetchPackages()),
        ),
      ),

      /**
       * Refresh packages on demand
       */
      refreshPackages: rxMethod<void>(
        pipe(
          // Using exhaust map, since there is no need to take
          // last packages (just use the first one)
          exhaustMap(() => fetchPackages()),
          tap(() => {
            patchState(store, {
              activePackageId: '',
              packagesById: {},
              hasError: false,
              errorMessage: '',
            });
          }),
        ),
      ),

      /**
       * Load package dependencies and set the hovered package card as active.
       */
      loadDependenciesAndSetActiveCard: rxMethod<string>(
        pipe(
          // Set hovered package id
          tap((packageId) => {
            patchState(store, {
              activePackageId: packageId,
            });
          }),

          // Continue with loading only if package is NOT already loaded
          filter((packageId) => !store.packagesById()[packageId]),

          tap((packageId) => {
            // Set dependencies per package to loading
            patchState(store, {
              packagesById: {
                ...store.packagesById(),
                [packageId]: {
                  status: 'loading',
                  dependencies: [],
                },
              },
            });
          }),

          // Using merge map in case user hovers over multiple
          // packages in short time.
          mergeMap((packageId) => {
            return packagesService.getDependencies(packageId).pipe(
              tap((dependencies) => {
                patchState(store, {
                  packagesById: {
                    ...store.packagesById(),
                    [packageId]: {
                      status: 'loaded',
                      dependencies,
                    },
                  },
                });
              }),
              catchError(() => {
                patchState(store, {
                  packagesById: {
                    ...store.packagesById(),
                    [packageId]: {
                      status: 'error',
                      dependencies: [],
                    },
                  },
                });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      /**
       * Unset hovered package card
       * @param packageId represent old package id that needs to be unset
       */
      unsetHoverPackage(packageId: string) {
        if (packageId === store.activePackageId()) {
          patchState(store, {
            activePackageId: '',
          });
        }
      },

      /**
       * Update the search query in the store state.
       * @param query
       */
      setSearchQuery(query: string) {
        patchState(store, (state) => ({
          ...state,
          searchQuery: query,
        }));
      },
    };
  }),
);

/**
 * Maps and splits the package ID into two parts. If the package ID contains a slash,
 * it splits the ID into two parts. If not, it assigns the entire ID to the first part
 * and leaves the second part empty.
 *
 * @param data
 * @returns
 */
const mapAndSplitPackageId = (data: ApiTypes['getPackages']): LocalApiType['getPackages'] => {
  return data.map((pkg) => {
    // Check if the package ID contains a slash and has a second part
    if (pkg.id.split('/').length > 1 && pkg.id.split('/')[1] !== '') {
      const [id_first_part, id_second_part] = pkg.id.split('/');
      return {
        ...pkg,
        id_first_part,
        id_second_part,
      };
    }

    // Else, assign the entire ID to the first part and leave the second part empty
    return {
      ...pkg,
      id_first_part: pkg.id,
      id_second_part: '',
    };
  });
};
