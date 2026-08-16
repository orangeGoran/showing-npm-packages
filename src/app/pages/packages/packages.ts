import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PackagesSearch } from './components/packages-search/packages-search';

@Component({
  selector: 'app-packages',
  imports: [PackagesSearch],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Packages {}
