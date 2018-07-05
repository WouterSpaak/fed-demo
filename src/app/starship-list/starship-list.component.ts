import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-starship-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./starship-list.component.css'],
  template: `
    <h2>Results</h2>
    <p *ngIf="loading">Loading data...</p>
    <table *ngIf="!loading">
      <thead>
        <tr>
          <th>Name</th>
          <th>Model</th>
          <th>Passengers</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let starship of starships">
          <td>{{starship.name}}</td>
          <td>{{starship.model}}</td>
          <td>{{starship.passengers}}</td>
        </tr>
        <tr *ngIf="starships?.length === 0">
          <td colspan="3">No results found</td>
        </tr>
      </tbody>
    </table>
  `
})
export class StarshipListComponent {
  @Input() starships: any[];
  @Input() loading: boolean;
}
