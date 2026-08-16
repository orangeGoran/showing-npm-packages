import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ApiTypes } from '../../../../types/api.types';
import { PackagesService } from './packages-service';

describe('PackagesService', () => {
  let service: PackagesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PackagesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests the packages list', () => {
    const response: ApiTypes['getPackages'] = [
      { id: 'rxjs', weeklyDownloads: 51_000, dependencyCount: 1 },
    ];

    let result: ApiTypes['getPackages'] | undefined;
    service.getPackages().subscribe((packages) => (result = packages));

    const req = httpTesting.expectOne(`${environment.apiUrl}/packages`);
    expect(req.request.method).toBe('GET');

    req.flush(response);
    expect(result).toEqual(response);
  });

  it('encodes the package id in the dependencies URL', () => {
    let result: ApiTypes['getPackageDependencies'] | undefined;
    service.getDependencies('@angular/core').subscribe((dependencies) => (result = dependencies));

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/packages/%40angular%2Fcore/dependencies`,
    );
    expect(req.request.method).toBe('GET');

    req.flush(['rxjs']);
    expect(result).toEqual(['rxjs']);
  });

  it('propagates HTTP errors to the caller', () => {
    let error: unknown;
    service.getPackages().subscribe({ error: (err: unknown) => (error = err) });

    httpTesting
      .expectOne(`${environment.apiUrl}/packages`)
      .flush('Something broke', { status: 500, statusText: 'Server Error' });

    expect(error).toBeTruthy();
  });
});
