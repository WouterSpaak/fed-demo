import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        border: 1px dashed #ccc;
        padding: 10px;
      }
    `
  ],
  template: `
  <h1>Starship finder</h1>
  <h3>Search by term</h3>
  <input type="text" (keyup)="search.emit($event.target.value)"/>
  <h3>Search by model</h3>
  <ul>
    <li *ngFor="let model of models">
      <button (click)="selectModel.emit(model)">{{model}}</button>
    </li>
  </ul>
  <h3>Fetch by random model</h3>
  <button (click)="this.randomModel.emit(getRandomModel())">Go</button>
  <h3>Clientside filter</h3>
  <p>Number of passengers</p>
  <input type="range" min="0" max="1000000"
    (change)="changeNumberOfPassengers.emit($event.target.value)"/>
  {{numberOfPassengers}}
  `
})
export class SidebarComponent {
  @Input() models: string[];
  @Input() numberOfPassengers: number;
  @Output() search = new EventEmitter();
  @Output() selectModel = new EventEmitter();
  @Output() randomModel = new EventEmitter();
  @Output() changeNumberOfPassengers = new EventEmitter();

  getRandomModel(): string {
    const randomNr = Math.floor(Math.random() * (1 + this.models.length - 1));
    return this.models[randomNr];
  }
}
