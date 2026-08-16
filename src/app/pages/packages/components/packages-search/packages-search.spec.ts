import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PackagesService } from '../../services/packages-service';
import { PackagesStore } from '../../stores/packages.store';
import { PackagesSearch } from './packages-search';

describe('PackagesSearch', () => {
  let fixture: ComponentFixture<PackagesSearch>;
  let store: InstanceType<typeof PackagesStore>;
  let packagesService: {
    getPackages: ReturnType<typeof vi.fn>;
    getDependencies: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    packagesService = {
      getPackages: vi.fn().mockReturnValue(of([])),
      getDependencies: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [PackagesSearch],
      providers: [PackagesStore, { provide: PackagesService, useValue: packagesService }],
    }).compileComponents();

    store = TestBed.inject(PackagesStore);

    fixture = TestBed.createComponent(PackagesSearch);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('writes the search query to the store only after the debounce time', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.value = 'fastify';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Nothing lands in the store before the debounce time passes.
    expect(store.searchQuery()).toBe('');

    vi.advanceTimersByTime(400);
    fixture.detectChanges();

    expect(store.searchQuery()).toBe('fastify');
  });

  it('refreshes the packages when the refresh button is clicked', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(packagesService.getPackages).toHaveBeenCalledTimes(1);
  });
});
