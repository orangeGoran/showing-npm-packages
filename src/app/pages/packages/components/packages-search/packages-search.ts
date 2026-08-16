import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PackagesStore } from '../../stores/packages.store';

@Component({
  selector: 'app-packages-search',
  imports: [],
  templateUrl: './packages-search.html',
  styleUrl: './packages-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesSearch {
  readonly store = inject(PackagesStore);

  localSearch = signal(this.store.searchQuery());

  // Debounced signal
  debouncedSearch = toSignal(
    toObservable(this.localSearch).pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ),
    { initialValue: this.store.searchQuery() },
  );

  constructor() {
    effect(() => {
      const newSearchValue = this.debouncedSearch();

      if (newSearchValue !== this.store.searchQuery()) {
        this.store.setSearchQuery(newSearchValue);
      }
    });
  }

  onSearchInput(event: Event) {
    this.localSearch.set((event.target as HTMLInputElement).value);
  }

  refreshData() {
    this.store.loadPackages();
  }
}
