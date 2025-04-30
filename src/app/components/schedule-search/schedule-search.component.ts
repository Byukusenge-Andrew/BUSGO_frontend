import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ScheduleService, Schedule } from '../../services/schedule.services';
import { BusService } from '../../services/bus.service';

@Component({
  selector: 'app-schedule-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="search-container">
      <div class="search-form-card">
        <h2>Find Your Bus</h2>
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>From</mat-label>
              <input type="text" matInput formControlName="from" [matAutocomplete]="fromAuto" (blur)="onFromInput($event)">
              <mat-autocomplete #fromAuto="matAutocomplete" [displayWith]="displayFn">
                <mat-option *ngFor="let city of filteredFromCities | async" [value]="city">
                  {{city}}
                </mat-option>
              </mat-autocomplete>
              <mat-error *ngIf="searchForm.get('from')?.hasError('required')">
                Origin city is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To</mat-label>
              <input type="text" matInput formControlName="to" [matAutocomplete]="toAuto" (blur)="onToInput($event)">
              <mat-autocomplete #toAuto="matAutocomplete" [displayWith]="displayFn">
                <mat-option *ngFor="let city of filteredToCities | async" [value]="city">
                  {{city}}
                </mat-option>
              </mat-autocomplete>
              <mat-error *ngIf="searchForm.get('to')?.hasError('required')">
                Destination city is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [min]="minDate" [matDatepicker]="picker" formControlName="date">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="searchForm.get('date')?.hasError('required')">
                Date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Passengers</mat-label>
              <input type="number" matInput formControlName="passengers" min="1" max="10">
              <mat-error *ngIf="searchForm.get('passengers')?.hasError('required')">
                Number of passengers is required
              </mat-error>
              <mat-error *ngIf="searchForm.get('passengers')?.hasError('min')">
                At least 1 passenger is required
              </mat-error>
              <mat-error *ngIf="searchForm.get('passengers')?.hasError('max')">
                Maximum 10 passengers allowed
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Sort By</mat-label>
              <mat-select formControlName="sortBy">
                <mat-option value="price">Price (Low to High)</mat-option>
                <mat-option value="time">Departure Time</mat-option>
                <mat-option value="duration">Duration (Shortest)</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="!searchForm.valid || loading">
              <mat-icon>search</mat-icon> Search Schedules
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Searching for schedules...</p>
      </div>

      <div *ngIf="searched && !loading" class="search-results">
        <h3 *ngIf="searchResults.length === 0">No schedules found for your search criteria</h3>
        
        <div *ngIf="searchResults.length > 0" class="results-header">
          <h3>{{ searchResults.length }} Schedules Found</h3>
          <p>{{ searchForm.get('from')?.value }} to {{ searchForm.get('to')?.value }} on {{ formatDate(searchForm.get('date')?.value) }}</p>
        </div>

        <mat-card *ngFor="let schedule of searchResults" class="schedule-card">
          <mat-card-content>
            <div class="schedule-header">
              <div class="schedule-info">
                <h3>{{ schedule.routeName }}</h3>
                <p class="bus-type">{{ schedule.busType }}</p>
              </div>
              <div class="price-tag">
                <span class="price">{{ schedule.price | currency:'RWF':'symbol':'1.0-0' }}</span>
                <span class="per-person">per person</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="schedule-details">
              <div class="time-details">
                <div class="departure">
                  <p class="time">{{ formatTime(schedule.departureTime) }}</p>
                  <p class="location">{{ schedule.sourceLocation.locationName }}</p>
                  <p class="city">{{ schedule.sourceLocation.city }}</p>
                </div>

                <div class="journey-line">
                  <span class="duration">{{ calculateDuration(schedule.departureTime, schedule.arrivalTime) }}</span>
                </div>

                <div class="arrival">
                  <p class="time">{{ formatTime(schedule.arrivalTime) }}</p>
                  <p class="location">{{ schedule.destinationLocation.locationName }}</p>
                  <p class="city">{{ schedule.destinationLocation.city }}</p>
                </div>
              </div>

              <div class="bus-details">
                <p><mat-icon>event_seat</mat-icon> {{ schedule.availableSeats }} seats available</p>
                <p><mat-icon>directions_bus</mat-icon> Bus #{{ schedule.busNumber }}</p>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="schedule-actions">
              <button mat-button color="primary" (click)="viewScheduleDetails(schedule.id)">
                <mat-icon>info</mat-icon> Details
              </button>
              <button mat-raised-button color="primary" (click)="bookNow(schedule.id)">
                <mat-icon>confirmation_number</mat-icon> Book Now
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .search-form-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }

    mat-form-field {
      flex: 1;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 40px 0;
    }

    .search-results {
      margin-top: 30px;
    }

    .results-header {
      margin-bottom: 20px;
    }

    .schedule-card {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .bus-type {
      color: #666;
      font-size: 14px;
    }

    .price-tag {
      text-align: right;
    }

    .price {
      font-size: 24px;
      font-weight: bold;
      color: #1a73e8;
    }

    .per-person {
      display: block;
      font-size: 12px;
      color: #666;
    }

    .schedule-details {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }

    .time-details {
      display: flex;
      align-items: center;
      flex: 2;
    }

    .departure, .arrival {
      flex: 1;
    }

    .time {
      font-size: 18px;
      font-weight: bold;
    }

    .location {
      font-weight: 500;
    }

    .city {
      color: #666;
      font-size: 14px;
    }

    .journey-line {
      position: relative;
      height: 2px;
      background-color: #ddd;
      flex: 1;
      margin: 0 15px;
    }

    .duration {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      white-space: nowrap;
    }

    .bus-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .bus-details p {
      display: flex;
      align-items: center;
      margin: 5px 0;
    }

    .bus-details mat-icon {
      margin-right: 8px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .schedule-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .schedule-details {
        flex-direction: column;
      }

      .time-details {
        margin-bottom: 15px;
      }
    }
  `]
})
export class ScheduleSearchComponent implements OnInit {
  searchForm: FormGroup;
  loading = false;
  searchResults: Schedule[] = [];
  searched = false;
  minDate = new Date();

  cities = [
    'Kigali',
    'Musanze',
    'Huye',
    'Rubavu',
    'Nyamata',
    'Rusizi',
    'Nyagatare',
    'Gisenyi',
    'Butare',
    'Kibuye'
  ];

  filteredFromCities: Observable<string[]> = of([]);
  filteredToCities: Observable<string[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private busService: BusService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: [new Date(), Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      sortBy: ['price']
    });
  }

  ngOnInit() {
    // Initialize autocomplete filters
    this.filteredFromCities = this.searchForm.get('from')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    this.filteredToCities = this.searchForm.get('to')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  displayFn(city: string): string {
    return city ? city : '';
  }

  onFromInput(event: any) {
    const value = event.target.value;
    if (!this.cities.includes(value)) {
      this.searchForm.get('from')!.setValue('');
    }
  }

  onToInput(event: any) {
    const value = event.target.value;
    if (!this.cities.includes(value)) {
      this.searchForm.get('to')!.setValue('');
    }
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.loading = true;
      this.searched = true;

      const sourceCity = this.searchForm.get('from')?.value;
      const destCity = this.searchForm.get('to')?.value;
      const departureDate = this.searchForm.get('date')?.value;

      this.scheduleService.searchSchedulesByCity(sourceCity, destCity, departureDate).subscribe({
        next: (schedules: Schedule[]) => {
          this.searchResults = this.sortResults(schedules, this.searchForm.get('sortBy')?.value);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error searching schedules:', error);
          this.loading = false;
        }
      });
    }
  }

  private sortResults(results: Schedule[], sortBy: string): Schedule[] {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'time':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'duration':
          const aDuration = this.calculateDurationMinutes(a.departureTime, a.arrivalTime);
          const bDuration = this.calculateDurationMinutes(b.departureTime, b.arrivalTime);
          return aDuration - bDuration;
        default:
          return 0;
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(dateTime: Date): string {
    if (!dateTime) return '';
    const d = new Date(dateTime);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  calculateDuration(departureTime: Date, arrivalTime: Date): string {
    if (!departureTime || !arrivalTime) return '';
    
    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  calculateDurationMinutes(departureTime: Date, arrivalTime: Date): number {
    if (!departureTime || !arrivalTime) return 0;
    
    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;
    
    return Math.floor(diffMs / (1000 * 60));
  }

  viewScheduleDetails(scheduleId: number) {
    this.router.navigate(['/schedule', scheduleId]);
  }

  bookNow(scheduleId: number) {
    this.router.navigate(['/schedule-booking', scheduleId], {
      queryParams: {
        passengers: this.searchForm.get('passengers')?.value,
        date: this.formatDateParam(this.searchForm.get('date')?.value)
      }
    });
  }

  private formatDateParam(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
