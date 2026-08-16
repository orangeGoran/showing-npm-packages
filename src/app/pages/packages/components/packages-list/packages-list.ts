import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { PackagesStore } from '../../stores/packages.store';
import { PackagesCard } from '../packages-card/packages-card';

@Component({
  selector: 'app-packages-list',
  imports: [PackagesCard],
  templateUrl: './packages-list.html',
  styleUrl: './packages-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesList implements OnInit {
  readonly store = inject(PackagesStore);

  ngOnInit(): void {
    this.store.loadPackages();
  }
}
