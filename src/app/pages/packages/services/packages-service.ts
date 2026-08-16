import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiTypes } from '../../../../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class PackagesService {
  private readonly http = inject(HttpClient);

  /**
   * GET /packages
   */
  getPackages(): Observable<ApiTypes['getPackages']> {
    return this.http.get<ApiTypes['getPackages']>(environment.apiUrl + '/packages');
  }
}
