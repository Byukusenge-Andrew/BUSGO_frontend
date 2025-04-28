import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {ScheduleService} from '../../../services/schedule.services';
import { RouteService } from '../../../services/bus-route.service';
import { BusLocationService, BusLocation } from '../../../services/bus-location.service';
import { AuthService } from '../../../services/auth.service';
import {Schedule} from '../../../models/schedule.model';

@Component({
  selector: 'app-add-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Schedule</h2>
    <mat-dialog-content>
      <form [formGroup]="scheduleForm">
        <mat-form-field appearance="outline">
          <mat-label>Route</mat-label>
          <mat-select formControlName="routeId" required>
            <mat-option *ngFor="let route of routes" [value]="route.id">
              {{ route.routeName }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="scheduleForm.get('routeId')?.hasError('required')">
            Route is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Source Location</mat-label>
          <mat-select formControlName="sourceLocationId" required>
            <mat-option *ngFor="let location of locations" [value]="location.id">
              {{ location.locationName }} ({{ location.city }}, {{ location.country }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="scheduleForm.get('sourceLocationId')?.hasError('required')">
            Source location is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Destination Location</mat-label>
          <mat-select formControlName="destinationLocationId" required>
            <mat-option *ngFor="let location of locations" [value]="location.id">
              {{ location.locationName }} ({{ location.city }}, {{ location.country }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="scheduleForm.get('destinationLocationId')?.hasError('required')">
            Destination location is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Departure Time</mat-label>
          <input matInput [matDatepicker]="depPicker" formControlName="departureTime" required>
          <mat-datepicker-toggle matSuffix [for]="depPicker"></mat-datepicker-toggle>
          <mat-datepicker #depPicker></mat-datepicker>
          <mat-error *ngIf="scheduleForm.get('departureTime')?.hasError('required')">
            Departure time is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Arrival Time</mat-label>
          <input matInput [matDatepicker]="arrPicker" formControlName="arrivalTime" required>
          <mat-datepicker-toggle matSuffix [for]="arrPicker"></mat-datepicker-toggle>
          <mat-datepicker #arrPicker></mat-datepicker>
          <mat-error *ngIf="scheduleForm.get('arrivalTime')?.hasError('required')">
            Arrival time is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fare</mat-label>
          <input matInput type="number" formControlName="price" required>
          <mat-error *ngIf="scheduleForm.get('price')?.hasError('required')">
            Fare is required
          </mat-error>
          <mat-error *ngIf="scheduleForm.get('price')?.hasError('min')">
            Fare must be non-negative
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Bus Type</mat-label>
          <mat-select formControlName="busType" required>
            <mat-option value="AC">AC</mat-option>
            <mat-option value="Non-AC">Non-AC</mat-option>
            <mat-option value="Sleeper">Sleeper</mat-option>
          </mat-select>
          <mat-error *ngIf="scheduleForm.get('busType')?.hasError('required')">
            Bus type is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Total Seats</mat-label>
          <input matInput type="number" formControlName="totalSeats" required>
          <mat-error *ngIf="scheduleForm.get('totalSeats')?.hasError('required')">
            Total seats is required
          </mat-error>
          <mat-error *ngIf="scheduleForm.get('totalSeats')?.hasError('min')">
            Total seats must be positive
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Available Seats</mat-label>
          <input matInput type="number" formControlName="availableSeats" required>
          <mat-error *ngIf="scheduleForm.get('availableSeats')?.hasError('required')">
            Available seats is required
          </mat-error>
          <mat-error *ngIf="scheduleForm.get('availableSeats')?.hasError('min')">
            Available seats must be non-negative
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Bus Number</mat-label>
          <input matInput formControlName="busNumber" required>
          <mat-error *ngIf="scheduleForm.get('busNumber')?.hasError('required')">
            Bus number is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="scheduleForm.invalid || isSubmitting" (click)="submit()">
        Add Schedule
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 1rem;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    mat-dialog-actions {
      justify-content: flex-end;
      padding: 1rem;
    }
  `]
})
export class AddScheduleDialogComponent implements OnInit {
  scheduleForm: FormGroup;
  routes: any[] = [];
  locations: BusLocation[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddScheduleDialogComponent>,
    private scheduleService: ScheduleService,
    private routeService: RouteService,
    private locationService: BusLocationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.scheduleForm = this.fb.group({
      routeId: ['', Validators.required],
      sourceLocationId: ['', Validators.required],
      destinationLocationId: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      busType: ['', Validators.required],
      totalSeats: [0, [Validators.required, Validators.min(1)]],
      availableSeats: [0, [Validators.required, Validators.min(0)]],
      busNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoutes();
    this.loadLocations();
  }

  loadRoutes(): void {
    const companyId = this.authService.getCurrentUserId();
    if (companyId) {
      this.routeService.getCompanyRoutes(companyId).subscribe({
        next: (routes) => {
          this.routes = routes;
        },
        error: (error) => {
          this.snackBar.open('Failed to load routes: ' + error.message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (error) => {
        this.snackBar.open('Failed to load locations: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  submit(): void {
    if (this.scheduleForm.invalid) return;

    this.isSubmitting = true;
    const companyId = this.authService.getCurrentUserId();
    if (!companyId) {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', { duration: 5000 });
      this.isSubmitting = false;
      return;
    }

    const sourceLocation = this.locations.find(loc => loc.id === Number(this.scheduleForm.value.sourceLocationId));
    const destinationLocation = this.locations.find(loc => loc.id === Number(this.scheduleForm.value.destinationLocationId));

    const scheduleData: Partial<Schedule> = {
      companyId: Number(companyId),
      routeId: Number(this.scheduleForm.value.routeId),
      sourceLocation: sourceLocation,
      destinationLocation: destinationLocation,
      departureTime: this.scheduleForm.value.departureTime,
      arrivalTime: this.scheduleForm.value.arrivalTime,
      price: this.scheduleForm.value.price,
      busType: this.scheduleForm.value.busType,
      totalSeats: this.scheduleForm.value.totalSeats,
      availableSeats: this.scheduleForm.value.availableSeats,
      busNumber: this.scheduleForm.value.busNumber,
      status: 'SCHEDULED'
    };

    this.scheduleService.createSchedule(scheduleData).subscribe({
      next: (createdSchedule) => {
        this.snackBar.open('Schedule created successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(createdSchedule);
      },
      error: (error) => {
        let errorMessage = 'Failed to create schedule';
        if (error.error?.error) {
          errorMessage += `: ${error.error.error}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
