import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { environment } from '../../../../environments/environment';
import { ApiTypes } from '../../../../types/api.types';

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
};

const initialState: PackagesState = {
  packages: [],
  isLoading: true,
  hasError: false,
  errorMessage: '',
};

export const PackagesStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    loadPackages() {
      patchState(store, (state) => ({
        ...state,
        isLoading: true,
        hasError: false,
        errorMessage: '',
      }));

      fetch(environment.apiUrl + '/packages')
        .then((response) => response.json())
        .then((data) => {
          const mappedData = mapAndSplitPackageId(data);

          patchState(store, (state) => ({
            ...state,
            packages: mappedData,
            isLoading: false,
          }));
        })
        .catch((error) => {
          patchState(store, (state) => ({
            ...state,
            hasError: true,
            errorMessage: error.message,
            isLoading: false,
          }));
        });
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
