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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
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
    MatTooltipModule,
    MatBadgeModule,
  ],
  template: `
    <div class="search-page-container">
      <!-- Enhanced Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>🚌 Find Your Perfect Journey</h1>
          <p class="header-subtitle">Search and book bus tickets across Rwanda with ease</p>
        </div>
        <div class="header-decoration"></div>
      </div>

      <!-- Enhanced Search Form -->
      <mat-card class="search-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>search</mat-icon>
            Search Bus Schedules
          </mat-card-title>
          <mat-card-subtitle>Find the best routes for your journey</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
            <div class="form-row">
              <!-- From Location -->
              <mat-form-field appearance="outline" class="form-field location-field">
                <mat-label>
                  <mat-icon matPrefix>location_on</mat-icon>
                  Departure
                </mat-label>
                <input
                  matInput
                  id="fromInput"
                  formControlName="from"
                  [matAutocomplete]="fromAuto"
                  (input)="onInputChange($event, 'from')"
                  placeholder="Where are you leaving from?"
                />
                <mat-autocomplete #fromAuto="matAutocomplete" [displayWith]="displayLocationFn.bind(this)" (optionSelected)="onLocationSelected($event, 'from')">
                  <mat-option *ngFor="let location of filteredFromLocations | async" [value]="location" class="location-option">
                    <mat-icon>place</mat-icon>
                    <span class="location-name">{{ getLocationName(location) }}</span>
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="searchForm.get('from')?.hasError('required')">
                  <mat-icon>error</mat-icon>
                  Please select your departure location
                </mat-error>
              </mat-form-field>

              <!-- Swap Button -->
              <button type="button" mat-icon-button class="swap-button" (click)="swapLocations()" matTooltip="Swap locations">
                <mat-icon>swap_horiz</mat-icon>
              </button>

              <!-- To Location -->
              <mat-form-field appearance="outline" class="form-field location-field">
                <mat-label>
                  <mat-icon matPrefix>flag</mat-icon>
                  Destination
                </mat-label>
                <input
                  matInput
                  id="toInput"
                  formControlName="to"
                  [matAutocomplete]="toAuto"
                  (input)="onInputChange($event, 'to')"
                  placeholder="Where are you going?"
                />
                <mat-autocomplete #toAuto="matAutocomplete" [displayWith]="displayLocationFn.bind(this)" (optionSelected)="onLocationSelected($event, 'to')">
                  <mat-option *ngFor="let location of filteredToLocations | async" [value]="location" class="location-option">
                    <mat-icon>place</mat-icon>
                    <span class="location-name">{{ getLocationName(location) }}</span>
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="searchForm.get('to')?.hasError('required')">
                  <mat-icon>error</mat-icon>
                  Please select your destination
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <!-- Date Picker -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>
                  <mat-icon matPrefix>event</mat-icon>
                  Travel Date
                </mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate" placeholder="Select your travel date" />
                <mat-datepicker-toggle matIconSuffix [for]="picker">
                  <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
                </mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="searchForm.get('date')?.hasError('required')">
                  <mat-icon>error</mat-icon>
                  Please select a travel date
                </mat-error>
              </mat-form-field>

              <!-- Sort Options -->
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>
                  <mat-icon matPrefix>sort</mat-icon>
                  Sort By
                </mat-label>
                <mat-select formControlName="sortBy">
                  <mat-option value="departureTime">
                    <mat-icon>schedule</mat-icon>
                    Departure Time
                  </mat-option>
                  <mat-option value="price">
                    <mat-icon>attach_money</mat-icon>
                    Price (Low to High)
                  </mat-option>
                  <mat-option value="duration">
                    <mat-icon>timer</mat-icon>
                    Duration (Shortest)
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Action Buttons -->
            <div class="button-group">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading || searchForm.invalid" class="search-btn">
                <mat-icon *ngIf="!loading">search</mat-icon>
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                {{ loading ? 'Searching...' : 'Search Schedules' }}
              </button>
              <button mat-stroked-button color="accent" (click)="loadAllSchedules()" [disabled]="loading" class="view-all-btn">
                <mat-icon>list</mat-icon>
                View All Schedules
              </button>
              <button mat-button (click)="resetSearch()" [disabled]="loading" class="reset-btn">
                <mat-icon>refresh</mat-icon>
                Reset
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Results Section -->
      <div class="results-container" *ngIf="searched">
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <h2>
              <mat-icon>directions_bus</mat-icon>
              Available Schedules
            </h2>
            <p *ngIf="searchResults.length > 0" class="results-count">
              <mat-icon matBadge="{{ searchResults.length }}" matBadgeColor="primary">confirmation_number</mat-icon>
              Found {{ searchResults.length }} schedule{{ searchResults.length !== 1 ? 's' : '' }}
            </p>
          </div>
          <div class="results-actions" *ngIf="searchResults.length > 0">
            <button mat-icon-button matTooltip="Refresh results" (click)="onSearch()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div class="no-results" *ngIf="noResultsFound">
          <mat-card class="no-results-card">
            <mat-card-content>
              <div class="no-results-content">
                <div class="no-results-icon">
                  <mat-icon>search_off</mat-icon>
                </div>
                <h3>No Schedules Found</h3>
                <p>We couldn't find any bus schedules matching your search criteria.</p>

                <div class="suggestions">
                  <h4>
                    <mat-icon>lightbulb</mat-icon>
                    Try these suggestions:
                  </h4>
                  <ul>
                    <li><mat-icon>date_range</mat-icon> Try different dates</li>
                    <li><mat-icon>location_on</mat-icon> Check alternative locations</li>
                    <li><mat-icon>business</mat-icon> Visit the nearest bus terminal</li>
                    <li><mat-icon>phone</mat-icon> Contact customer support</li>
                  </ul>
                </div>

                <div class="no-results-actions">
                  <button mat-raised-button color="primary" (click)="resetSearch()">
                    <mat-icon>search</mat-icon>
                    New Search
                  </button>
                  <button mat-stroked-button (click)="loadAllSchedules()">
                    <mat-icon>list</mat-icon>
                    View All Schedules
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Results Grid -->
        <div class="results-grid" *ngIf="searchResults.length > 0">
          <mat-card class="result-card" *ngFor="let schedule of searchResults; trackBy: trackByScheduleId">
            <!-- Card Header -->
            <mat-card-header class="result-header">
              <div class="route-info">
                <mat-card-title class="route-name">
                  <mat-icon>route</mat-icon>
                  {{ schedule.routeName }}
                </mat-card-title>
                <mat-card-subtitle class="company-name">
                  <mat-icon>business</mat-icon>
                  {{ schedule.companyName }}
                </mat-card-subtitle>
              </div>
              <div class="bus-type-chip">
                <mat-chip-set>
                  <mat-chip [color]="getBusTypeColor(schedule.busType)" selected>
                    <mat-icon matChipAvatar>directions_bus</mat-icon>
                    {{ schedule.busType }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-header>

            <mat-card-content class="result-body">
              <!-- Journey Timeline -->
              <div class="journey-timeline">
                <div class="timeline-point departure">
                  <div class="timeline-icon">
                    <mat-icon>radio_button_checked</mat-icon>
                  </div>
                  <div class="timeline-content">
                    <div class="time">{{ formatTime(schedule.departureTime) }}</div>
                    <div class="location">{{ schedule.sourceLocation.locationName }}</div>
                    <div class="date">{{ formatDate(schedule.departureTime) }}</div>
                  </div>
                </div>

                <div class="timeline-connector">
                  <div class="duration-info">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ calculateDuration(schedule.departureTime, schedule.arrivalTime) }}</span>
                  </div>
                  <div class="connector-line"></div>
                </div>

                <div class="timeline-point arrival">
                  <div class="timeline-icon">
                    <mat-icon>location_on</mat-icon>
                  </div>
                  <div class="timeline-content">
                    <div class="time">{{ formatTime(schedule.arrivalTime) }}</div>
                    <div class="location">{{ schedule.destinationLocation.locationName }}</div>
                    <div class="date">{{ formatDate(schedule.arrivalTime) }}</div>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Schedule Details -->
              <div class="schedule-details">
                <div class="detail-item">
                  <mat-icon>confirmation_number</mat-icon>
                  <span class="label">Bus Number:</span>
                  <span class="value">{{ schedule.busNumber }}</span>
                </div>

                <div class="detail-item seats-info">
                  <mat-icon [class]="schedule.availableSeats > 0 ? 'seats-available' : 'seats-full'">
                    {{ schedule.availableSeats > 0 ? 'event_seat' : 'no_seats' }}
                  </mat-icon>
                  <span class="label">Seats:</span>
                  <span class="value" [class]="schedule.availableSeats > 0 ? 'seats-available' : 'seats-full'">
                    <ng-container *ngIf="schedule.availableSeats > 0; else soldOut">
                      {{ schedule.availableSeats }} available
                    </ng-container>
                    <ng-template #soldOut>
                      <strong>SOLD OUT</strong>
                    </ng-template>
                  </span>
                </div>

                <div class="detail-item price-info">
                  <mat-icon>payments</mat-icon>
                  <span class="label">Price:</span>
                  <span class="price">{{ schedule.price | currency:'RWF':'symbol':'1.0-0' }}</span>
                </div>
              </div>
            </mat-card-content>

            <!-- Card Actions -->
            <mat-card-actions class="result-actions">
              <button mat-stroked-button (click)="viewScheduleDetails(schedule.id)" class="details-btn">
                <mat-icon>info</mat-icon>
                Details
              </button>
              <button
                mat-raised-button
                color="primary"
                (click)="bookNow(schedule.id)"
                [disabled]="schedule.availableSeats === 0"
                class="book-btn"
              >
                <mat-icon>{{ schedule.availableSeats === 0 ? 'block' : 'book_online' }}</mat-icon>
                {{ schedule.availableSeats === 0 ? 'Sold Out' : 'Book Now' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Enhanced Header */
    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
      padding: 2rem 0;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ff0000 0%, #773030 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-subtitle {
      font-size: 1.125rem;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .header-decoration {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 4px;
      background: linear-gradient(90deg, #ff0000, #9c27b0, #e91e63);
      border-radius: 2px;
    }

    /* Enhanced Search Card */
    .search-card {
      margin-bottom: 2rem;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .search-card mat-card-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .search-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .search-card mat-card-subtitle {
      color: #64748b;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .search-form {
      padding: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: flex-start;
    }

    .form-field {
      flex: 1;
      min-width: 200px;
    }

    .location-field {
      flex: 2;
    }

    .swap-button {
      margin-top: 0.5rem;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      color: #3f51b5;
      border: 2px solid #e0e7ff;
      transition: all 0.3s ease;
    }

    .swap-button:hover {
      background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%);
      transform: rotate(180deg);
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .search-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
    }

    .view-all-btn, .reset-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      border-radius: 10px;
    }

    /* Location Options */
    .location-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
    }

    .location-name {
      font-weight: 500;
    }

    /* Results Section */
    .results-container {
      margin-top: 2rem;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .results-info h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0 0 0;
      color: #64748b;
      font-weight: 500;
    }

    /* No Results */
    .no-results-card {
      max-width: 600px;
      margin: 2rem auto;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    }

    .no-results-content {
      text-align: center;
      padding: 2rem;
    }

    .no-results-icon {
      margin-bottom: 1.5rem;
    }

    .no-results-icon mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #94a3b8;
    }

    .no-results-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .suggestions {
      margin: 2rem 0;
      text-align: left;
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .suggestions h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #1e293b;
      font-weight: 600;
    }

    .suggestions ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .suggestions li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: #64748b;
      font-weight: 500;
    }

    .suggestions li mat-icon {
      color: #3f51b5;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .no-results-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .result-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .result-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    }

    .result-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 1.5rem;
    }

    .route-info {
      flex: 1;
    }

    .route-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .company-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-weight: 500;
    }

    .bus-type-chip {
      align-self: flex-start;
    }

    /* Journey Timeline */
    .journey-timeline {
      display: flex;
      align-items: center;
      padding: 1.5rem 0;
      gap: 1rem;
    }

    .timeline-point {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .timeline-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      color: #3f51b5;
      flex-shrink: 0;
    }

    .timeline-content {
      text-align: center;
    }

    .timeline-content .time {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .timeline-content .location {
      font-weight: 500;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .timeline-content .date {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .timeline-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 0 0 120px;
    }

    .duration-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #3f51b5;
      background: #e0e7ff;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .connector-line {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #3f51b5, #9c27b0);
      border-radius: 1px;
    }

    /* Schedule Details */
    .schedule-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
    }

    .detail-item mat-icon {
      color: #64748b;
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .detail-item .label {
      font-weight: 500;
      color: #64748b;
      min-width: 80px;
    }

    .detail-item .value {
      font-weight: 600;
      color: #1e293b;
    }

    .seats-available {
      color: #059669 !important;
    }

    .seats-full {
      color: #dc2626 !important;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #059669;
    }

    /* Card Actions */
    .result-actions {
      display: flex;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .details-btn, .book-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      border-radius: 8px;
    }

    .book-btn {
      box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
    }

    .book-btn:disabled {
      background-color: #e2e8f0 !important;
      color: #94a3b8 !important;
      box-shadow: none;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .search-page-container {
        padding: 0.5rem;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .form-row {
        flex-direction: column;
        gap: 1rem;
      }

      .swap-button {
        order: 3;
        align-self: center;
        margin-top: 0;
      }

      .button-group {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .timeline-point {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .timeline-connector {
        flex: 0 0 80px;
      }

      .result-actions {
        flex-direction: column;
        gap: 0.75rem;
      }

      .details-btn, .book-btn {
        width: 100%;
      }
    }

    /* Material Design Overrides */
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    :host ::ng-deep .mat-mdc-form-field-outline {
      border-radius: 12px;
    }

    :host ::ng-deep .mat-mdc-autocomplete-panel {
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
    }

    :host ::ng-deep .mat-mdc-option {
      border-radius: 8px;
      margin: 0.25rem;
    }

    :host ::ng-deep .mat-mdc-chip {
      border-radius: 20px;
      font-weight: 500;
    }

    :host ::ng-deep .mat-mdc-card {
      border-radius: 16px;
    }

    /* Loading States */
    .search-btn mat-spinner {
      margin-right: 0.5rem;
    }

    /* Error States */
    :host ::ng-deep .mat-mdc-form-field-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
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
        this.handleLocationError(error);
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleLocationError(error: any) {
    let errorMessage = 'Failed to load locations. ';

    if (error.status === 403 || error.status === 401) {
      errorMessage += 'Authentication required. Please log in again.';
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
    });
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

  swapLocations() {
    const fromValue = this.searchForm.get('from')?.value;
    const toValue = this.searchForm.get('to')?.value;

    this.searchForm.patchValue({
      from: toValue,
      to: fromValue
    });

    // Update input displays
    const fromInput = document.getElementById('fromInput') as HTMLInputElement;
    const toInput = document.getElementById('toInput') as HTMLInputElement;

    if (fromInput && toValue) {
      fromInput.value = this.getLocationName(toValue);
    }
    if (toInput && fromValue) {
      toInput.value = this.getLocationName(fromValue);
    }
  }

  getBusTypeColor(busType: string): string {
    switch (busType?.toLowerCase()) {
      case 'luxury':
      case 'vip':
        return 'primary';
      case 'express':
      case 'premium':
        return 'accent';
      case 'standard':
      case 'economy':
        return 'warn';
      default:
        return '';
    }
  }

  trackByScheduleId(index: number, schedule: Schedule): number {
    return schedule.id;
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
        this.loading = false;
        this.noResultsFound = this.searchResults.length === 0;

        if (this.noResultsFound) {
          this.snackBar.open('No schedules found for the selected criteria.', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        } else {
          this.snackBar.open(`Found ${schedules.length} schedule${schedules.length !== 1 ? 's' : ''}.`, 'Close', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
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

    this.scheduleService.getActiveSchedules().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (schedules: Schedule[]) => {
        console.log(`[${this.instanceId}] Loaded ${schedules.length} schedules`);
        if (schedules.length === 0) {
          this.noResultsFound = true;
        } else {
          const sortBy = this.searchForm.get('sortBy')?.value || 'departureTime';
          this.searchResults = this.sortResults(schedules, sortBy);
          this.searched = true;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error(`[${this.instanceId}] Error loading schedules:`, error);
        this.loading = false;
        this.noResultsFound = true;
        this.searched = true;
      }
    });
  }

  resetSearch() {
    console.log(`[${this.instanceId}] Reset search triggered`);
    this.searchForm.reset({
      sortBy: 'departureTime',
      from: '',
      to: '',
      date: new Date()
    });
    this.searchResults = [];
    this.searched = false;
    this.noResultsFound = false;
    this.filteredFromLocations = this.setupLocationFiltering('from');
    this.filteredToLocations = this.setupLocationFiltering('to');

    // Clear input displays
    const fromInput = document.getElementById('fromInput') as HTMLInputElement;
    const toInput = document.getElementById('toInput') as HTMLInputElement;
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
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
