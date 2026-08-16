import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, pipe, switchMap, tap } from 'rxjs';
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
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  searchQuery: string;
};

const initialState: PackagesState = {
  packages: [],
  isLoading: true,
  hasError: false,
  errorMessage: '',
  searchQuery: '',
};

export const PackagesStore = signalStore(
  withState(initialState),
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
  withMethods((store, packagesService = inject(PackagesService)) => ({
    /**
     * Load packages from the API and update the store state accordingly.
     */
    loadPackages: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { isLoading: true, hasError: false, errorMessage: '' });
        }),

        switchMap(() =>
          packagesService.getPackages().pipe(
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
          ),
        ),
      ),
    ),

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
  })),
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
