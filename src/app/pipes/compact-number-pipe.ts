import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compactNumber',
})
export class CompactNumberPipe implements PipeTransform {
  transform(value: number): string {
    // "Exceeds 1000" is strictly greater: exactly 1000 stays "1000".
    if (value <= 1000) {
      return value + '';
    }

    return Math.floor(value / 1000) + 'K';
  }
}
