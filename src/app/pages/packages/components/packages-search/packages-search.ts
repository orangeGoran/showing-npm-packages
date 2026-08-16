import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-packages-search',
  imports: [],
  templateUrl: './packages-search.html',
  styleUrl: './packages-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesSearch {}
