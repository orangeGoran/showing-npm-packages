import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PackagesList } from './components/packages-list/packages-list';
import { PackagesSearch } from './components/packages-search/packages-search';
import { PackagesStore } from './stores/packages.store';

@Component({
  selector: 'app-packages',
  imports: [PackagesSearch, PackagesList],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
  providers: [PackagesStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Packages {}
