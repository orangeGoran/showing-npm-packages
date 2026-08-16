import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CompactNumberPipe } from '../../../../pipes/compact-number-pipe';
import { PackagesState } from '../../stores/packages.store';

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
}
