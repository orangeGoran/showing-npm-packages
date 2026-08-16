import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { CompactNumberPipe } from '../../../../pipes/compact-number-pipe';
import { PackagesState, PackagesStore } from '../../stores/packages.store';

@Component({
  selector: 'app-packages-card',
  imports: [CompactNumberPipe],
  templateUrl: './packages-card.html',
  styleUrl: './packages-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesCard {
  @Input({ required: true })
  package!: PackagesState['packages'][number];

  store = inject(PackagesStore);

  /**
   * True while this card is a dependency of the currently active (hovered) card.
   */
  isActiveDependency = computed(() => {
    const activePackage = this.store.packagesById()[this.store.activePackageId()];
    return (activePackage?.dependencies ?? []).includes(this.package.id);
  });

  /**
   * Status of the dependencies fetch for this card, or undefined
   * if nothing has been fetched yet.
   */
  dependenciesStatus = computed(() => this.store.packagesById()[this.package.id]?.status);

  getDependencies() {
    this.store.loadDependenciesAndSetActiveCard(this.package.id);
  }

  unsetHoverCard() {
    this.store.unsetHoverPackage(this.package.id);
  }
}
