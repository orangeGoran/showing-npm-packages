import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { PackagesCard } from './components/packages-card/packages-card';
import { PackagesSearch } from './components/packages-search/packages-search';
import { PackagesStore } from './stores/packages.store';

@Component({
  selector: 'app-packages',
  imports: [PackagesSearch, PackagesCard],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
  providers: [PackagesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Packages implements OnInit {
  readonly store = inject(PackagesStore);

  ngOnInit(): void {
    this.store.loadPackages();
  }
}
