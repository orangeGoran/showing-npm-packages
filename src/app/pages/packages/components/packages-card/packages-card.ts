import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-packages-card',
  imports: [],
  templateUrl: './packages-card.html',
  styleUrl: './packages-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesCard {}
