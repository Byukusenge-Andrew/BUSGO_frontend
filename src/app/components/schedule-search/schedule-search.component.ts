
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBar
import { ScheduleService, Schedule } from '../../services/schedule.services';
import { BusService } from '../../services/bus.service';
import { BusLocation, BusLocationService } from '../../services/bus-location.service';
import {AuthService} from '../../services/auth.service';

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
    MatDividerModule,
    MatSnackBarModule // Add MatSnackBarModule here
  ],
  template: `
    <div class="search-container">
      <div class="container">
        <div class="search-card">
          <h2>Search Bus Schedules</h2>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
            <!-- Form fields remain the same -->
            <div class="form-row">
              <div class="form-group">
                <label for="from">From</label>
                <input type="text" id="from" formControlName="from" placeholder="Departure City"
                       [matAutocomplete]="fromAuto">
                <mat-autocomplete #fromAuto="matAutocomplete" [displayWith]="displayLocationFn">
                  <mat-option *ngFor="let location of filteredFromLocations | async" [value]="location">
                    {{getLocationName(location)}}
                  </mat-option>
                </mat-autocomplete>
                <div *ngIf="searchForm.get('from')?.invalid && searchForm.get('from')?.touched" class="error-message">
                  Departure location is required
                </div>
              </div>
              <div class="form-group">
                <label for="to">To</label>
                <input type="text" id="to" formControlName="to" placeholder="Destination City"
                       [matAutocomplete]="toAuto">
                <mat-autocomplete #toAuto="matAutocomplete" [displayWith]="displayLocationFn">
                  <mat-option *ngFor="let location of filteredToLocations | async" [value]="location">
                    {{getLocationName(location)}}
                  </mat-option>
                </mat-autocomplete>
                <div *ngIf="searchForm.get('to')?.invalid && searchForm.get('to')?.touched" class="error-message">
                  Destination location is required
                </div>
              </div>
              <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" formControlName="date" [min]="minDate.toISOString().split('T')[0]">
                <div *ngIf="searchForm.get('date')?.invalid && searchForm.get('date')?.touched" class="error-message">
                  Date is required
                </div>
              </div>
              <div class="form-group">
                <label for="sortBy">Sort By</label>
                <select id="sortBy" formControlName="sortBy">
                  <option value="departureTime">Departure Time</option>
                  <option value="price">Price</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
            <div class="button-row">
              <button type="submit" class="btn btn-primary" [disabled]="searchForm.invalid || loading">
                <span *ngIf="!loading">Search</span>
                <span *ngIf="loading">Searching...</span>
              </button>
              <button type="button" class="btn btn-secondary" (click)="loadAllSchedules()" [disabled]="loading">
                <span *ngIf="!loading">View All Schedules</span>
                <span *ngIf="loading">Loading...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Results section remains the same -->
    <div class="results-container" *ngIf="searched">
      <div class="container">
        <div class="results-header">
          <h2>Search Results</h2>
          <p *ngIf="searchResults.length > 0">Found {{searchResults.length}} schedules</p>
        </div>

        <!-- No results message -->
        <div class="no-results" *ngIf="noResultsFound">
          <div class="no-results-card">
            <i class="fas fa-exclamation-circle"></i>
            <h3>No Schedules Found</h3>
            <p>We couldn't find any bus schedules matching your search criteria or no schedules are available.</p>
            <div class="suggestions">
              <h4>Suggestions:</h4>
              <ul>
                <li>Try different dates or locations</li>
                <li>Check if the route is available</li>
                <li>Verify location names are correct</li>
              </ul>
            </div>
            <button class="btn btn-secondary" (click)="resetSearch()">New Search</button>
          </div>
        </div>

        <div class="results-grid" *ngIf="searchResults.length > 0">
          <div class="result-card" *ngFor="let schedule of searchResults">
            <div class="result-header">
              <div class="route-name">{{schedule.routeName}}</div>
              <div class="bus-type">{{schedule.busType}}</div>
            </div>
            <div class="result-body">
              <div class="time-info">
                <div class="departure">
                  <div class="time">{{formatTime(schedule.departureTime)}}</div>
                  <div class="location">{{schedule.sourceLocation.locationName}}</div>
                  <div class="date">{{formatDate(schedule.departureTime)}}</div>
                </div>
                <div class="duration">
                  <div class="duration-time">{{calculateDuration(schedule.departureTime, schedule.arrivalTime)}}</div>
                  <div class="duration-line"></div>
                </div>
                <div class="arrival">
                  <div class="time">{{formatTime(schedule.arrivalTime)}}</div>
                  <div class="location">{{schedule.destinationLocation.locationName}}</div>
                  <div class="date">{{formatDate(schedule.arrivalTime)}}</div>
                </div>
              </div>
              <div class="bus-info">
                <div class="bus-number">Bus #{{schedule.busNumber}}</div>
                <div class="seats-available">{{schedule.availableSeats}} seats available</div>
              </div>
              <div class="price-info">
                <div class="price">{{schedule.price | currency:'RWF':'symbol':'1.0-0'}}</div>
              </div>
            </div>
            <div class="result-footer">
              <button class="btn btn-outline" (click)="viewScheduleDetails(schedule.id)">View Details</button>
              <button class="btn btn-primary" (click)="bookNow(schedule.id)" [disabled]="schedule.availableSeats <= 0">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Existing styles */
    .button-row {
      display: flex;
      gap: 10px; /* Add space between buttons */
      margin-top: 15px; /* Add some margin above the buttons */
    }
    .no-results-card {
      text-align: center;
      padding: 40px 20px;
      background-color: #f9f9f9;
      border: 1px dashed #ddd;
      border-radius: 8px;
      margin-top: 30px;
    }
    .no-results-card i {
      font-size: 48px;
      color: #ffc107; /* Warning color */
      margin-bottom: 15px;
    }
    .no-results-card h3 {
      margin-bottom: 10px;
      color: #555;
    }
    .no-results-card p {
      color: #777;
      margin-bottom: 20px;
    }
    .suggestions {
      text-align: left;
      max-width: 300px;
      margin: 0 auto 20px auto;
      padding: 15px;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    .suggestions h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
    }
    .suggestions ul {
      list-style: none;
      padding-left: 0;
      margin-bottom: 0;
    }
    .suggestions li {
      margin-bottom: 5px;
      color: #666;
    }
    .suggestions li::before {
      content: '•';
      color: #1a73e8; /* Primary color */
      display: inline-block;
      width: 1em;
      margin-left: -1em;
    }
    /* Add other styles from previous response if needed */
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
  noResultsFound = false;
  minDate = new Date();

  locations: BusLocation[] = [];
  filteredFromLocations: Observable<BusLocation[]> = of([]);
  filteredToLocations: Observable<BusLocation[]> = of([]);


  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private busService: BusService, // Keep if used elsewhere, otherwise remove
    private router: Router,
    private authservice: AuthService,
    private locationService: BusLocationService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: [new Date(), Validators.required],
      sortBy: ['departureTime']
    });
  }

  ngOnInit() {
    this.locationService.getAllLocations().subscribe(locations => {
      this.locations = locations;
      // Re-initialize filtering observables after locations are loaded
      this.filteredFromLocations = this.setupLocationFiltering('from');
      this.filteredToLocations = this.setupLocationFiltering('to');
    });

    // Initial setup before locations are loaded
    this.filteredFromLocations = this.setupLocationFiltering('from');
    this.filteredToLocations = this.setupLocationFiltering('to');
  }

  private setupLocationFiltering(controlName: string): Observable<BusLocation[]> {
    const control = this.searchForm.get(controlName);
    if (!control) {
      return of(this.locations); // Return all if control not found yet
    }
    return control.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLocations(value))
    );
  }

  private _filterLocations(value: any): BusLocation[] {
    if (!value) return this.locations;

    const filterValue = typeof value === 'string' ? value.toLowerCase() :
      value.locationName ? value.locationName.toLowerCase() : '';

    return this.locations.filter(location =>
      (location.locationName?.toLowerCase() || '').includes(filterValue) ||
      (location.city?.toLowerCase() || '').includes(filterValue)
    );
  }

  displayLocationFn(location: BusLocation): string {
    return location ? this.getLocationName(location) : '';
  }

  getLocationName(location: BusLocation): string {
    return location ? `${location.locationName}, ${location.city}` : '';
  }

  onSearch() {
    this.noResultsFound = false;
    if (this.searchForm.invalid) {
      this.snackBar.open('Please fill in all required search fields.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.searched = true;

    const sourceLocation = this.searchForm.get('from')?.value;
    const destLocation = this.searchForm.get('to')?.value;
    const departureDate = this.searchForm.get('date')?.value;

    // Ensure locations are selected objects with IDs
    if (typeof sourceLocation !== 'object' || !sourceLocation?.id ||
      typeof destLocation !== 'object' || !destLocation?.id) {
      this.snackBar.open('Please select valid locations from the list.', 'Close', { duration: 3000 });
      this.loading = false;
      this.searched = false; // Reset searched state if input is invalid
      return;
    }

    this.scheduleService.searchSchedules(sourceLocation.id, destLocation.id, departureDate).subscribe({
      next: (schedules: Schedule[]) => {
        this.searchResults = this.sortResults(schedules, this.searchForm.get('sortBy')?.value);
        this.loading = false;
        this.noResultsFound = this.searchResults.length === 0;
      },
      error: (error: any) => {
        console.error('Error searching schedules:', error);
        this.snackBar.open(`Error searching schedules: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
        this.loading = false;
        this.noResultsFound = true; // Assume no results on error
      }
    });
  }

  loadAllSchedules() {
    this.loading = true;
    this.searched = true;
    this.noResultsFound = false;
    this.searchForm.reset({ sortBy: 'departureTime' }); // Reset form but keep sort order

    this.scheduleService.getAllSchedules().subscribe({
      next: (schedules: Schedule[]) => {
        this.searchResults = this.sortResults(schedules, this.searchForm.get('sortBy')?.value);
        this.loading = false;
        this.noResultsFound = this.searchResults.length === 0;
        if (!this.noResultsFound) {
          this.snackBar.open(`Loaded ${schedules.length} schedules.`, 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Error loading all schedules:', error);
        this.snackBar.open(`Error loading schedules: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
        this.loading = false;
        this.noResultsFound = true;
      }
    });
  }

  resetSearch() {
    this.searchForm.reset({ sortBy: 'departureTime' });
    this.searchResults = [];
    this.searched = false;
    this.noResultsFound = false;
    // Re-setup filtering as reset might clear observables
    this.filteredFromLocations = this.setupLocationFiltering('from');
    this.filteredToLocations = this.setupLocationFiltering('to');
  }


  private sortResults(results: Schedule[], sortBy: string): Schedule[] {
    // Sorting logic remains the same
    if (!results || results.length === 0) return [];

    switch (sortBy) {
      case 'price':
        return [...results].sort((a, b) => a.price - b.price);
      case 'duration':
        return [...results].sort((a, b) =>
          this.calculateDurationMinutes(a.departureTime, a.arrivalTime) -
          this.calculateDurationMinutes(b.departureTime, b.arrivalTime)
        );
      case 'departureTime':
      default:
        return [...results].sort((a, b) =>
          new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
        );
    }
  }

  // Formatting and calculation methods remain the same
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    // Consider using Angular's DatePipe for more robust formatting and localization
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatTime(dateTime: Date): string {
    if (!dateTime) return '';
    const d = new Date(dateTime);
    // Consider using Angular's DatePipe
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  calculateDuration(departureTime: Date, arrivalTime: Date): string {
    if (!departureTime || !arrivalTime) return '';

    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;

    if (diffMs < 0) return 'Invalid dates'; // Handle cases where arrival is before departure

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  calculateDurationMinutes(departureTime: Date, arrivalTime: Date): number {
    if (!departureTime || !arrivalTime) return 0;

    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;

    if (diffMs < 0) return 0; // Or handle as error

    return Math.floor(diffMs / (1000 * 60));
  }


  viewScheduleDetails(scheduleId: number) {
    this.router.navigate(['/schedules', scheduleId]);
  }


  bookNow(scheduleId: number): void {
    const currentUser = this.authservice.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Please log in to book a schedule.', 'Close', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate(['/schedule-booking', scheduleId]);
  }

  // formatDateParam remains the same
  private formatDateParam(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

