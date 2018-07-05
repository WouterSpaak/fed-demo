import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, BehaviorSubject, merge, combineLatest, of } from 'rxjs';
import { map, mapTo, catchError, startWith, switchMap, publishReplay, refCount } from 'rxjs/operators';
import { ships } from './ships';

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
export class AppComponent {
  readonly fixedModels = ships;

  /**
   * Input streams
   */
  readonly selectedModel$ = new ReplaySubject<string>(1);
  readonly searchTerm$ = new ReplaySubject<string>(1);
  readonly randomModel$ = new ReplaySubject<string>(1);
  readonly numberOfPassengers$ = new BehaviorSubject(1000000);

  /**
   * Presentation streams
   */
  loading$: Observable<boolean>;
  filteredResults$: Observable<any>;

  constructor(private readonly httpClient: HttpClient) {
    /**
     * Intermediate streams
     */
    const query$ = merge(this.searchTerm$, this.randomModel$, this.selectedModel$).pipe(startWith(''));
    const results$ = query$.pipe(
      switchMap(query => this.fetchData(query)),
      publishReplay(1),
      refCount()
    );

    this.loading$ = merge(query$.pipe(mapTo(true)), results$.pipe(mapTo(false)));

    this.filteredResults$ = combineLatest(results$, this.numberOfPassengers$, (results, maxPassengers) => {
      return results.filter((val: { passengers: number }) => val.passengers < maxPassengers);
    });
  }

  // @TODO: Generate API interfaces.
  private fetchData(query: string): Observable<any[]> {
    query = query ? `?search=${query}` : '';
    return this.httpClient.get(`https://swapi.co/api/starships/${query}`).pipe(
      catchError(() => of({ results: [] })),
      map((v: any) => v.results)
    );
  }
}
