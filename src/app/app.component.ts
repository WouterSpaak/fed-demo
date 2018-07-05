import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, BehaviorSubject, merge, combineLatest, of } from 'rxjs';
import {
  map,
  mapTo,
  merge as mergePipe,
  catchError,
  startWith,
  switchMap,
  publishReplay,
  refCount
} from 'rxjs/operators';
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <app-sidebar class="sidebar"
    [models]="fixedModels"
    [numberOfPassengers]="numberOfPassengers$ | async"
    (search)="searchTerm$.next($event)"
    (selectModel)="selectedModel$.next($event)"
    (randomModel)="randomModel$.next($event)"
    (changeNumberOfPassengers)="numberOfPassengers$.next($event)"
  >
  </app-sidebar>
  <div class="main">
    <app-starship-list
        [starships]="filteredResults$ | async"
        [loading]="loading$ | async">
    </app-starship-list>
  </div>
  `
})
export class AppComponent implements OnInit {
  fixedModels = [
    'Executor-class star dreadnought',
    'Sentinel-class landing craft',
    'DS-1 Orbital Battle Station',
    'YT-1300 light freighter',
    'BTL Y-wing',
    'T-65 X-wing',
    'Twin Ion Engine Advanced x1',
    'Firespray-31-class patrol and attack',
    'Lambda-class T-4a shuttle',
    'EF76 Nebulon-B escort frigate'
  ];

  // source streams
  // --------------
  selectedModel$ = new ReplaySubject<string>(1);
  searchTerm$ = new ReplaySubject<string>(1);
  randomModel$ = new ReplaySubject<string>(1);
  numberOfPassengers$ = new BehaviorSubject(1000000);

  // presentation streams
  // --------------------
  loading$: Observable<boolean>;
  filteredResults$: Observable<any>;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    // intermediate streams
    // --------------------
    const query$ = merge(this.searchTerm$, this.randomModel$, this.selectedModel$).pipe(startWith(''));

    const results$ = query$.pipe(
      switchMap(query => this.fetchData(query)),
      publishReplay(1),
      refCount()
    );

    // presentation streams
    // --------------------
    this.loading$ = query$.pipe(
      mapTo(true),
      mergePipe(results$.pipe(mapTo(false)))
    );

    this.filteredResults$ = combineLatest(results$, this.numberOfPassengers$, this.filterByPassengers);
  }

  private filterByPassengers(results: any[], passengers: number): any[] {
    return results.filter(v => Number(v.passengers) < passengers);
  }

  private fetchData(query: string): Observable<any[]> {
    query = query ? `?search=${query}` : '';
    return this.httpClient.get(`https://swapi.co/api/starships/${query}`).pipe(
      catchError(v => of({ results: [] })),
      map((v: any) => v.results)
    );
  }
}
