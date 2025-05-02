import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Schedule, ScheduleService } from '../../../services/schedule.services'; // Use Schedule interface from service
import { Route, RouteService } from '../../../services/bus-route.service'; // Assuming RouteService exists
import { BusLocation, BusLocationService } from '../../../services/bus-location.service'; // Assuming BusLocationService exists
import { AuthService } from '../../../services/auth.service'; // To get company ID

@Component({
  selector: 'app-edit-schedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './edit-schedule-dialog.component.html',
  styleUrl: './edit-schedule-dialog.component.scss'// Separate template file
  // Add styles if needed or use global styles
})
export class EditScheduleDialogComponent implements OnInit {
  editForm: FormGroup;
  routes: Route[] = []; // Assuming Route interface exists
  locations: BusLocation[] = []; // Assuming BusLocation interface exists
  minDate = new Date();
  scheduleStatus = ['SCHEDULED', 'CANCELLED']; // Example statuses

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { schedule: Schedule },
    private routeService: RouteService, // Inject RouteService
    private locationService: BusLocationService, // Inject LocationService
    private authService: AuthService // Inject AuthService
  ) {
    // Initialize form with data passed from the parent component
    this.editForm = this.fb.group({
      routeId: [data.schedule.routeId, Validators.required],
      // sourceLocationId: [{ value: data.schedule.sourceLocation?.id, disabled: true }, Validators.required], // Often derived from route
      // destinationLocationId: [{ value: data.schedule.destinationLocation?.id, disabled: true }, Validators.required], // Often derived from route
      departureTime: [data.schedule.departureTime ? new Date(data.schedule.departureTime) : null, Validators.required],
      arrivalTime: [data.schedule.arrivalTime ? new Date(data.schedule.arrivalTime) : null, Validators.required],
      busNumber: [data.schedule.busNumber, Validators.required],
      busType: [data.schedule.busType, Validators.required],
      price: [data.schedule.price, [Validators.required, Validators.min(0)]],
      totalSeats: [data.schedule.totalSeats, [Validators.required, Validators.min(1)]],
      // availableSeats: [data.schedule.availableSeats], // Usually calculated or managed separately
      status: [data.schedule.status, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCompanyRoutes();
    // this.loadLocations(); // Locations might be derived from routes, load if needed directly
  }

  loadCompanyRoutes(): void {
    const companyId = this.authService.getCurrentUserId(); // Get current company ID
    if (companyId) {
      this.routeService.getCompanyRoutes(companyId).subscribe(routes => {
        this.routes = routes;
        // Optionally set source/destination based on selected route
        // this.editForm.get('routeId')?.valueChanges.subscribe(routeId => {
        //   const selectedRoute = this.routes.find(r => r.id === routeId);
        //   this.editForm.patchValue({
        //      sourceLocationId: selectedRoute?.sourceLocation?.id,
        //      destinationLocationId: selectedRoute?.destinationLocation?.id
        //   });
        // });
      });
    }
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe(locations => {
      this.locations = locations;
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.getRawValue(); // Use getRawValue if fields are disabled

      // Prepare the data in the format expected by the service's update method
      const updatedScheduleData: Partial<Schedule> = {
        id: this.data.schedule.id, // Keep the original ID
        companyId: this.data.schedule.companyId, // Keep the original company ID
        routeId: formValue.routeId,
        departureTime: formValue.departureTime,
        arrivalTime: formValue.arrivalTime,
        busNumber: formValue.busNumber,
        busType: formValue.busType,
        price: formValue.price,
        totalSeats: formValue.totalSeats,
        // availableSeats might need recalculation based on bookings or set based on totalSeats initially
        availableSeats: this.data.schedule.availableSeats, // Preserve current available seats or recalculate
        status: formValue.status,
        // Include source/destination if they are part of the update payload and not derived
        // sourceLocation: this.locations.find(l => l.id === formValue.sourceLocationId),
        // destinationLocation: this.locations.find(l => l.id === formValue.destinationLocationId),
      };

      this.dialogRef.close(updatedScheduleData);
    } else {
      // Mark fields as touched to show errors
      this.editForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without sending data
  }
}
