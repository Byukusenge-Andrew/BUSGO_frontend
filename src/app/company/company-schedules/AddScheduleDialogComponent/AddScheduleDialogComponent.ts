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
import { ScheduleService } from '../../../services/schedule.services';
import { RouteService } from '../../../services/bus-route.service';
import { BusLocationService, BusLocation } from '../../../services/bus-location.service';
import { AuthService } from '../../../services/auth.service';
import { Schedule } from '../../../models/schedule.model';
import { BusService } from '../../../services/bus.service';

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
          <mat-select formControlName="routeId" required (selectionChange)="onRouteChange($event.value)">
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

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Departure Date</mat-label>
            <input matInput [matDatepicker]="depDatePicker" formControlName="departureDate" required
                   (dateChange)="updateArrivalTime()">
            <mat-datepicker-toggle matSuffix [for]="depDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #depDatePicker></mat-datepicker>
            <mat-error *ngIf="scheduleForm.get('departureDate')?.hasError('required')">
              Departure date is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Departure Time</mat-label>
            <input matInput type="time" formControlName="departureTime" required
                   (change)="updateArrivalTime()">
            <mat-error *ngIf="scheduleForm.get('departureTime')?.hasError('required')">
              Departure time is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Estimated Arrival Date</mat-label>
            <input matInput [value]="calculatedArrivalDate | date:'yyyy-MM-dd'" readonly>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Estimated Arrival Time</mat-label>
            <input matInput [value]="calculatedArrivalTime" readonly>
          </mat-form-field>
        </div>

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
          <mat-label>Bus</mat-label>
          <mat-select formControlName="busId" required (selectionChange)="onBusChange($event.value)">
            <mat-option *ngFor="let bus of buses" [value]="bus.id">
              {{ bus.registrationNumber }} - {{ bus.model }} ({{ bus.busType }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="scheduleForm.get('busId')?.hasError('required')">
            Bus is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Bus Type</mat-label>
          <input matInput formControlName="busType" readonly>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Total Seats</mat-label>
            <input matInput type="number" formControlName="totalSeats" readonly>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Available Seats</mat-label>
            <input matInput type="number" formControlName="availableSeats" readonly>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Bus Number</mat-label>
          <input matInput formControlName="busNumber" readonly>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="scheduleForm.invalid || isSubmitting || !calculatedArrivalDate" (click)="submit()">
        Add Schedule
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 1rem;
      max-height: 70vh;
      overflow-y: auto;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .form-row mat-form-field {
      flex: 1;
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
  buses: any[] = [];
  isSubmitting = false;
  calculatedArrivalDate: Date | null = null;
  calculatedArrivalTime: string = '';
  private estimatedDuration: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddScheduleDialogComponent>,
    private scheduleService: ScheduleService,
    private routeService: RouteService,
    private locationService: BusLocationService,
    private busService: BusService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.scheduleForm = this.fb.group({
      routeId: ['', Validators.required],
      sourceLocationId: ['', Validators.required],
      destinationLocationId: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      busId: ['', Validators.required],
      busType: ['', Validators.required],
      totalSeats: [{ value: 0, disabled: true }],
      availableSeats: [{ value: 0, disabled: true }],
      busNumber: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadRoutes();
    this.loadLocations();
    this.loadBuses();
  }

  loadBuses(): void {
    const companyId = this.authService.getCurrentUserId();
    if (companyId) {
      this.busService.getCompanyBuses(companyId).subscribe({
        next: (buses) => {
          this.buses = buses;
        },
        error: (err) => {
          this.snackBar.open('Failed to get buses: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
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

  onRouteChange(routeId: string): void {
    const selectedRoute = this.routes.find(route => route.id === routeId);
    if (selectedRoute) {
      this.estimatedDuration = selectedRoute.estimatedDuration || 0;
      this.scheduleForm.patchValue({
        price: selectedRoute.basePrice || 0
      });

      if (selectedRoute.origin && selectedRoute.destination) {
        let sourceLocation = this.locations.find(
          loc => loc.locationName.toLowerCase() === selectedRoute.origin.toLowerCase()
        ) || this.locations.find(
          loc => loc.city.toLowerCase() === selectedRoute.origin.toLowerCase()
        ) || this.locations.find(
          loc => loc.locationName.toLowerCase().includes(selectedRoute.origin.toLowerCase()) ||
            selectedRoute.origin.toLowerCase().includes(loc.city.toLowerCase())
        );

        let destLocation = this.locations.find(
          loc => loc.locationName.toLowerCase() === selectedRoute.destination.toLowerCase()
        ) || this.locations.find(
          loc => loc.city.toLowerCase() === selectedRoute.destination.toLowerCase()
        ) || this.locations.find(
          loc => loc.locationName.toLowerCase().includes(selectedRoute.destination.toLowerCase()) ||
            selectedRoute.destination.toLowerCase().includes(loc.city.toLowerCase())
        );

        if (sourceLocation) {
          this.scheduleForm.patchValue({ sourceLocationId: sourceLocation.id });
        } else {
          console.warn(`Could not find matching source location for route origin: ${selectedRoute.origin}`);
        }

        if (destLocation) {
          this.scheduleForm.patchValue({ destinationLocationId: destLocation.id });
        } else {
          console.warn(`Could not find matching destination location for route destination: ${selectedRoute.destination}`);
        }
      }

      this.updateArrivalTime();
    }
  }

  onBusChange(busId: string): void {
    const selectedBus = this.buses.find(bus => bus.id === busId);
    if (selectedBus) {
      this.scheduleForm.patchValue({
        busType: selectedBus.busType || '',
        totalSeats: selectedBus.capacity || 0,
        availableSeats: selectedBus.capacity || 0,
        busNumber: selectedBus.registrationNumber || ''
      });
    }
  }

  updateArrivalTime(): void {
    const departureDate = this.scheduleForm.get('departureDate')?.value;
    const departureTime = this.scheduleForm.get('departureTime')?.value;

    if (departureDate && departureTime && this.estimatedDuration > 0) {
      const departureDateTime = this.combineDateAndTime(departureDate, departureTime);
      const arrivalDateTime = new Date(departureDateTime.getTime() + this.estimatedDuration * 60 * 1000);

      const hours = arrivalDateTime.getHours().toString().padStart(2, '0');
      const minutes = arrivalDateTime.getMinutes().toString().padStart(2, '0');
      this.calculatedArrivalTime = `${hours}:${minutes}`;
      this.calculatedArrivalDate = arrivalDateTime;
    } else {
      this.calculatedArrivalTime = '';
      this.calculatedArrivalDate = null;
    }
  }

  submit(): void {
    if (this.scheduleForm.invalid || !this.calculatedArrivalDate) {
      const invalidControls: string[] = [];
      Object.keys(this.scheduleForm.controls).forEach(key => {
        const control = this.scheduleForm.get(key);
        if (control?.invalid) {
          invalidControls.push(key);
        }
      });
      console.warn('Invalid form controls:', invalidControls);
      return;
    }

    this.isSubmitting = true;
    const companyId = this.authService.getCurrentUserId();
    if (!companyId) {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', { duration: 5000 });
      this.isSubmitting = false;
      return;
    }

    const sourceLocation = this.locations.find(loc => loc.id === Number(this.scheduleForm.value.sourceLocationId));
    const destinationLocation = this.locations.find(loc => loc.id === Number(this.scheduleForm.value.destinationLocationId));
    const selectedBus = this.buses.find(bus => bus.id === this.scheduleForm.value.busId);

    if (!sourceLocation || !destinationLocation) {
      this.snackBar.open('Source or destination location not found', 'Close', { duration: 5000 });
      this.isSubmitting = false;
      return;
    }

    const departureDateTime = this.combineDateAndTime(
      this.scheduleForm.value.departureDate,
      this.scheduleForm.value.departureTime
    );

    const scheduleData: Partial<Schedule> = {
      companyId: Number(companyId),
      routeId: Number(this.scheduleForm.value.routeId),
      sourceLocation: sourceLocation,
      destinationLocation: destinationLocation,
      departureTime: departureDateTime,
      arrivalTime: this.calculatedArrivalDate,
      price: this.scheduleForm.value.price,
      busType: this.scheduleForm.value.busType,
      totalSeats: selectedBus?.capacity || 0,
      availableSeats: selectedBus?.capacity || 0,
      busNumber: selectedBus?.registrationNumber || '',
      status: 'SCHEDULED'
    };

    console.log('Submitting schedule data:', scheduleData);

    this.scheduleService.createSchedule(scheduleData).subscribe({
      next: (createdSchedule) => {
        this.snackBar.open('Schedule created successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(createdSchedule);
      },
      error: (error) => {
        console.error('Schedule creation error:', error);
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

  private combineDateAndTime(date: Date, timeString: string): Date {
    if (!date || !timeString) {
      return new Date();
    }

    // Create a new Date object from the input date to avoid modifying it
    const result = new Date(date);
    const timeParts = timeString.split(':');

    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      result.setHours(hours, minutes, 0, 0);
    }

    return result;
  }
}
