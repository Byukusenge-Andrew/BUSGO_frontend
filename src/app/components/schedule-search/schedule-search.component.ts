import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScheduleService, Schedule } from '../../services/schedule.services';
import { BusService } from '../../services/bus.service';
import { BusLocation, BusLocationService } from '../../services/bus-location.service';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.services';

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
    MatSnackBarModule,
  ],
  template: `
    <div class="search-page-container">
      <h1>Find Your Bus Schedule</h1>
      <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>From</mat-label>
          <input
            matInput
            id="fromInput"
            formControlName="from"
            [matAutocomplete]="fromAuto"
            (input)="onInputChange($event, 'from')"
            placeholder="Enter starting location"
          />
          <mat-autocomplete #fromAuto="matAutocomplete" [displayWith]="displayLocationFn.bind(this)" (optionSelected)="onLocationSelected($event, 'from')">
            <mat-option *ngFor="let location of filteredFromLocations | async" [value]="location">
              {{ getLocationName(location) }}
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="searchForm.get('from')?.hasError('required')">
            Starting location is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>To</mat-label>
          <input
            matInput
            id="toInput"
            formControlName="to"
            [matAutocomplete]="toAuto"
            (input)="onInputChange($event, 'to')"
            placeholder="Enter destination"
          />
          <mat-autocomplete #toAuto="matAutocomplete" [displayWith]="displayLocationFn.bind(this)" (optionSelected)="onLocationSelected($event, 'to')">
            <mat-option *ngFor="let location of filteredToLocations | async" [value]="location">
              {{ getLocationName(location) }}
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="searchForm.get('to')?.hasError('required')">
            Destination is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="searchForm.get('date')?.hasError('required')">
            Date is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Sort By</mat-label>
          <mat-select formControlName="sortBy">
            <mat-option value="departureTime">Departure Time</mat-option>
            <mat-option value="price">Price</mat-option>
            <mat-option value="duration">Duration</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="button-group">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading || searchForm.invalid">
            Search
          </button>
          <button mat-raised-button color="accent" (click)="loadAllSchedules()" [disabled]="loading">
            View All Schedules
          </button>
        </div>
      </form>

      <div class="results-container" *ngIf="searched">
        <div class="container">
          <div class="results-header">
            <h2>Search Results</h2>
            <p *ngIf="searchResults.length > 0">Found {{ searchResults.length }} schedules</p>
          </div>

          <div class="no-results" *ngIf="noResultsFound">
            <div class="no-results-card">
              <i class="fas fa-exclamation-circle"></i>
              <h3>No Active Bookings Found</h3>
              <p>No active booking found. Please approach the offices in the bus terminals for assistance.</p>
              <div class="suggestions">
                <h4>Suggestions:</h4>
                <ul>
                  <li>Try different dates or locations</li>
                  <li>Check if the route is available</li>
                  <li>Visit the nearest bus terminal for more options</li>
                </ul>
              </div>
              <button class="btn btn-secondary" (click)="resetSearch()">New Search</button>
            </div>
          </div>

          <div class="results-grid" *ngIf="searchResults.length > 0">
            <div class="result-card" *ngFor="let schedule of searchResults">
              <div class="result-header">
                <div class="route-name">{{ schedule.routeName }}</div>
                <div class="bus-type">{{ schedule.busType }}</div>
              </div>
              <div class="result-body">
                <div class="time-info">
                  <div class="departure">
                    <div class="time">{{ formatTime(schedule.departureTime) }}</div>
                    <div class="location">{{ schedule.sourceLocation.locationName }}</div>
                    <div class="date">{{ formatDate(schedule.departureTime) }}</div>
                  </div>
                  <div class="duration">
                    <div class="duration-time">{{ calculateDuration(schedule.departureTime, schedule.arrivalTime) }}</div>
                    <div class="duration-line"></div>
                  </div>
                  <div class="arrival">
                    <div class="time">{{ formatTime(schedule.arrivalTime) }}</div>
                    <div class="location">{{ schedule.destinationLocation.locationName }}</div>
                    <div class="date">{{ formatDate(schedule.arrivalTime) }}</div>
                  </div>
                </div>
                <div class="bus-info">
                  <div class="company-name">Operated by: {{ schedule.companyName }}</div>
                  <div class="bus-number">Bus #{{ schedule.busNumber }}</div>
                  <div class="seats-info">
                    <ng-container *ngIf="schedule.availableSeats > 0; else soldOut">
                      <span class="seats-available">{{ schedule.availableSeats }} seats available</span>
                    </ng-container>
                    <ng-template #soldOut>
                      <span class="seats-full">SOLD OUT</span>
                    </ng-template>
                  </div>
                </div>
                <div class="price-info">
                  <div class="price">{{ schedule.price | currency:'RWF':'symbol':'1.0-0' }}</div>
                </div>
              </div>
              <div class="result-footer">
                <button class="btn btn-outline" (click)="viewScheduleDetails(schedule.id)">View Details</button>
                <button
                  class="btn btn-primary"
                  (click)="bookNow(schedule.id)"
                  [disabled]="schedule.availableSeats === 0"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
    }

    h1 {
      text-align: center;
      margin-bottom: 24px;
      font-size: 2em;
      color: #333;
    }

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-field {
      flex: 1 1 200px;
      min-width: 200px;
    }

    .button-group {
      display: flex;
      gap: 8px;
      align-items: center;
      flex: 1 1 100%;
      justify-content: center;

      button{
        border-radius: 4px;
        border: var(--primary-red) 2;
      }
    }

    .results-container {
      padding: 16px;
    }

    .results-header {
      margin-bottom: 16px;
      text-align: center;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .result-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .result-card:hover {
      transform: translateY(-4px);
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .route-name {
      font-size: 1.2em;
      font-weight: 500;
      color: #007bff;
    }

    .bus-type {
      font-size: 0.9em;
      color: #555;
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .result-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .departure, .arrival {
      text-align: center;
      flex: 1;
    }

    .time {
      font-size: 1.1em;
      font-weight: 500;
      color: #333;
    }

    .location {
      font-size: 0.9em;
      color: #333;
    }

    .date {
      font-size: 0.8em;
      color: #666;
    }

    .duration {
      text-align: center;
      flex: 1;
    }

    .duration-time {
      font-size: 0.9em;
      color: #007bff;
    }

    .duration-line {
      width: 50px;
      height: 2px;
      background: #007bff;
      margin: 4px auto;
    }

    .bus-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .company-name, .bus-number, .seats-info {
      margin: 5px 0;
      font-size: 0.9em;
    }

    .company-name {
      font-weight: 500;
      color: #333;
    }

    .bus-number {
      color: #555;
    }

    .seats-info {
      margin: 5px 0;
    }

    .seats-available {
      color: #28a745;
    }

    .seats-full {
      color: #dc3545;
      font-weight: bold;
    }

    .price-info {
      text-align: right;
    }

    .price {
      font-size: 1.2em;
      font-weight: 500;
      color: #28a745;
    }

    .result-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.9em;
      cursor: pointer;
    }

    .btn-primary {
      background: #007bff;
      color: #fff;
      border: none;
    }

    .btn-primary[disabled] {
      background-color: #cccccc;
      color: #666666;
      cursor: not-allowed;
    }

    .btn-outline {
      border: 1px solid #007bff;
      color: #007bff;
      background: none;
    }

    .btn-secondary {
      background: #6c757d;
      color: #fff;
      border: none;
    }

    .no-results-card {
      text-align: center;
      padding: 24px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
      max-width: 500px;
      margin: 16px auto;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .no-results-card i {
      font-size: 2em;
      color: #dc3545;
      margin-bottom: 8px;
    }

    .suggestions {
      margin-top: 16px;
      text-align: left;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
    }

    .suggestions h4 {
      margin-bottom: 8px;
      color: #333;
    }

    .suggestions ul {
      padding-left: 16px;
      color: #555;
    }

    :host ::ng-deep .mat-autocomplete-panel {
      max-height: 200px;
      overflow-y: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    :host ::ng-deep .mat-option {
      line-height: 1.5;
      padding: 8px 16px;
      font-size: 0.9em;
    }

    :host ::ng-deep .mat-form-field {
      width: 100%;
    }

    :host ::ng-deep .mat-form-field-outline {
      border-radius: 4px;
    }

    /* Error snackbar styling */
    .error-snackbar {
      background-color: #f44336; /* Red color for error */
      color: white;
      font-weight: 500;
      margin: 0 0 1rem 1rem; /* Add some margin from the bottom and right */
      border-radius: 4px;
      box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
    }

    .error-snackbar button {
      color: white;
    }

    .mat-mdc-snack-bar-container.error-snackbar .mdc-snackbar__surface {
      background-color: #f44336 !important;
      padding: 0 !important;
      min-width: 0 !important;
    }

    /* Position the snackbar container */
    .mat-mdc-snack-bar-container.error-snackbar {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      max-width: 35vw;
    }
  `],
})
export class ScheduleSearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  loading = false;
  searchResults: Schedule[] = [];
  searched = false;
  noResultsFound = false;
  minDate = new Date();
  locations: BusLocation[] = [];
  filteredFromLocations: Observable<BusLocation[]> = of([]);
  filteredToLocations: Observable<BusLocation[]> = of([]);
  private destroy$ = new Subject<void>();
  private instanceId = Math.random().toString(36).substring(2, 9);

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private busService: BusService,
    private router: Router,
    private authService: AuthService,
    private companyService: CompanyService,
    private locationService: BusLocationService,
    private snackBar: MatSnackBar
  ) {
    console.log(`ScheduleSearchComponent instantiated (ID: ${this.instanceId})`);
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: [new Date(), Validators.required],
      sortBy: ['departureTime'],
    });
  }

  ngOnInit() {
    this.locationService.getAllLocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (locations) => {
        console.log(`[${this.instanceId}] Locations loaded:`, locations);
        this.locations = locations;
        this.filteredFromLocations = this.setupLocationFiltering('from');
        this.filteredToLocations = this.setupLocationFiltering('to');
      },
      error: (error) => {
        console.error(`[${this.instanceId}] Error fetching locations:`, error);

        let errorMessage = 'Failed to load locations. ';

        if (error.status === 403 || error.status === 401) {
          errorMessage += 'Authentication required. Please log in again.';
          // Optionally redirect to login
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: {
                returnUrl: this.router.url,
                sessionExpired: 'true'
              }
            });
          }, 3000);
        } else {
          errorMessage += 'Please refresh the page to try again.';
        }

        this.snackBar.open(errorMessage, 'Dismiss', {
          duration: 10000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
          politeness: 'assertive'
        });
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupLocationFiltering(controlName: string): Observable<BusLocation[]> {
    const control = this.searchForm.get(controlName);
    if (!control) {
      return of(this.locations);
    }
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((value) => {
        console.log(`[${this.instanceId}] Filtering ${controlName}:`, value);
        const filterValue = typeof value === 'string' ? value : value?.locationName || '';
        return this._filterLocations(filterValue);
      }),
      takeUntil(this.destroy$)
    );
  }

  private _filterLocations(value: string): BusLocation[] {
    if (!value || !this.locations) return this.locations || [];
    const filterValue = value.toLowerCase();
    return this.locations.filter(
      (location) =>
        location.locationName?.toLowerCase().includes(filterValue) ||
        location.city?.toLowerCase().includes(filterValue)
    );
  }

  displayLocationFn(location: BusLocation): string {
    const result = location && location.locationName ? this.getLocationName(location) : '';
    console.log(`[${this.instanceId}] Display location:`, result);
    return result;
  }

  getLocationName(location: BusLocation): string {
    return location ? `${location.locationName}, ${location.city || 'Unknown'}` : '';
  }

  onInputChange(event: Event, controlName: string) {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(`[${this.instanceId}] Input change (${controlName}):`, inputValue);
    if (typeof this.searchForm.get(controlName)?.value !== 'object') {
      this.searchForm.get(controlName)?.setValue(inputValue || '', { emitEvent: true });
    }
  }

  onLocationSelected(event: MatAutocompleteSelectedEvent, controlName: string) {
    const selectedLocation = event.option.value as BusLocation;
    console.log(`[${this.instanceId}] Selected (${controlName}):`, selectedLocation);
    this.searchForm.get(controlName)?.setValue(selectedLocation, { emitEvent: false });
    const inputElement = document.getElementById(`${controlName}Input`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = this.getLocationName(selectedLocation);
      inputElement.blur();
    }
  }

  onSearch() {
    console.log(`[${this.instanceId}] Search triggered`);
    if (this.loading) {
      console.log(`[${this.instanceId}] Search blocked: already loading`);
      return;
    }
    this.noResultsFound = false;
    if (this.searchForm.invalid) {
      this.snackBar.open('Please fill in all required search fields.', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar'],
        politeness: 'assertive'
      });
      this.searchForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.searchResults = [];
    this.searched = true;

    const sourceLocation = this.searchForm.get('from')?.value;
    const destLocation = this.searchForm.get('to')?.value;
    const departureDate = this.searchForm.get('date')?.value;

    if (!sourceLocation || !sourceLocation.id || !destLocation || !destLocation.id) {
      this.snackBar.open('Please select valid locations from the dropdown list.', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar'],
        politeness: 'assertive'
      });
      this.loading = false;
      this.searched = false;
      return;
    }

    if (!(departureDate instanceof Date) || isNaN(departureDate.getTime())) {
      this.snackBar.open('Please select a valid date.', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar'],
        politeness: 'assertive'
      });
      this.loading = false;
      this.searched = false;
      return;
    }

    const formattedDate = this.formatDateParam(departureDate);

    console.log(`[${this.instanceId}] Search Parameters:`, {
      sourceLocationId: sourceLocation.id,
      destLocationId: destLocation.id,
      departureDate: formattedDate,
    });

    this.scheduleService.searchSchedules(sourceLocation.id, destLocation.id, formattedDate).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(`[${this.instanceId}] Search results:`, schedules);
        this.searchResults = this.sortResults(schedules, this.searchForm.get('sortBy')?.value);
        console.log(`[${this.instanceId}] Rendered searchResults length:`, this.searchResults.length);
        this.checkResultsGridCount();
        this.loading = false;
        this.noResultsFound = this.searchResults.length === 0;
        if (this.noResultsFound) {
          this.snackBar.open('No schedules found for the selected criteria.', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: ['error-snackbar'],
            politeness: 'assertive'
          });
        } else {
          this.snackBar.open(`Found ${schedules.length} schedules.`, 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: ['error-snackbar'],
            politeness: 'assertive'
          });
        }
      },
      error: (error: any) => {
        console.error(`[${this.instanceId}] Search error:`, error);
        this.snackBar.open(
          `Error searching schedules: ${error.message || 'An unexpected error occurred.'}`,
          'Close',
          {
            duration: 5000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: ['error-snackbar'],
            politeness: 'assertive'
          }
        );
        this.loading = false;
        this.noResultsFound = true;
      },
    });
  }

  loadAllSchedules() {
    console.log(`[${this.instanceId}] Loading all schedules`);
    this.loading = true;
    this.searchResults = [];
    this.noResultsFound = false;

    // Use getActiveSchedules instead of getAllSchedules to only show valid schedules
    this.scheduleService.getActiveSchedules().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(`[${this.instanceId}] Loaded ${schedules.length} schedules`);
        if (schedules.length === 0) {
          this.noResultsFound = true;
        } else {
          // Apply sorting
          const sortBy = this.searchForm.get('sortBy')?.value || 'departureTime';
          this.searchResults = this.sortResults(schedules, sortBy);
          this.searched = true;
        }
        this.loading = false;
        this.checkResultsGridCount();
      },
      error: (error: any) => {
        console.error(`[${this.instanceId}] Error loading schedules:`, error);
        this.loading = false;
        this.noResultsFound = true;
        this.searched = true;
        this.checkResultsGridCount();
      }
    });
  }

  private checkResultsGridCount() {
    setTimeout(() => {
      const grids = document.querySelectorAll('.results-grid');
      console.log(`[${this.instanceId}] Number of results-grid elements:`, grids.length);
      if (grids.length > 1) {
        console.warn(`[${this.instanceId}] Warning: Multiple results-grid elements detected! This might indicate the component is instantiated multiple times.`);
        // Potential causes for search result duplication:
        // 1. Multiple instances of ScheduleSearchComponent in the DOM
        // 2. Component not being properly destroyed when navigating away
        // 3. Router configuration issues causing component to be re-created without destroying previous instance
        // 4. Subscription management issues where old subscriptions continue to emit results
      }
    }, 0);
  }

  resetSearch() {
    console.log(`[${this.instanceId}] Reset search triggered`);
    this.searchForm.reset({ sortBy: 'departureTime', from: '', to: '', date: new Date() });
    this.searchResults = [];
    this.searched = false;
    this.noResultsFound = false;
    this.filteredFromLocations = this.setupLocationFiltering('from');
    this.filteredToLocations = this.setupLocationFiltering('to');
  }

  private sortResults(results: Schedule[], sortBy: string): Schedule[] {
    if (!results || results.length === 0) return [];
    switch (sortBy) {
      case 'price':
        return [...results].sort((a, b) => a.price - b.price);
      case 'duration':
        return [...results].sort(
          (a, b) =>
            this.calculateDurationMinutes(a.departureTime, a.arrivalTime) -
            this.calculateDurationMinutes(b.departureTime, b.arrivalTime)
        );
      case 'departureTime':
      default:
        return [...results].sort(
          (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
        );
    }
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
    if (diffMs < 0) return 'Invalid dates';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  calculateDurationMinutes(departureTime: Date, arrivalTime: Date): number {
    if (!departureTime || !arrivalTime) return 0;
    const depTime = new Date(departureTime).getTime();
    const arrTime = new Date(arrivalTime).getTime();
    const diffMs = arrTime - depTime;
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / (1000 * 60));
  }

  viewScheduleDetails(scheduleId: number) {
    console.log(`[${this.instanceId}] Viewing schedule:`, scheduleId);
    this.router.navigate(['/schedules', scheduleId]);
  }

  bookNow(scheduleId: number): void {
    console.log(`[${this.instanceId}] Booking schedule:`, scheduleId);
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Please log in to book a schedule.', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar'],
        politeness: 'assertive'
      });
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate(['/schedule-booking', scheduleId]);
  }

  private formatDateParam(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
