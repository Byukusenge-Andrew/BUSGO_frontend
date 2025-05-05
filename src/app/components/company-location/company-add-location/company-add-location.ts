import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {Router, RouterModule} from '@angular/router';
import { BusLocationService, BusLocation } from '../../../services/bus-location.service';
import {MatCard, MatCardContent} from '@angular/material/card';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    MatCard,
    MatCardContent
  ],
  template: `
    <div class="add-location-container">
      <div class="header">
        <h1>Add New Location</h1>
        <a routerLink="/locations" mat-button color="primary">View All Locations</a>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="locationForm" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Location Name</mat-label>
              <input matInput formControlName="locationName" required >
              <mat-error *ngIf="locationForm.get('locationName')?.hasError('required')">
                Location name is required
              </mat-error>
              <mat-error *ngIf="locationForm.get('locationName')?.hasError('minlength')">
                Location name must be at least 3 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City/District</mat-label>
              <input matInput formControlName="city" required>
              <mat-error *ngIf="locationForm.get('city')?.hasError('required')">
                City is required
              </mat-error>
              <mat-error *ngIf="locationForm.get('city')?.hasError('minlength')">
                City must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>State/Province</mat-label>
              <input matInput formControlName="state" required>
              <mat-error *ngIf="locationForm.get('state')?.hasError('required')">
                State/Province is required
              </mat-error>
              <mat-error *ngIf="locationForm.get('state')?.hasError('minlength')">
                State/Province must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country" required>
              <mat-error *ngIf="locationForm.get('country')?.hasError('required')">
                Country is required
              </mat-error>
              <mat-error *ngIf="locationForm.get('country')?.hasError('minlength')">
                Country must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Location Type</mat-label>
              <mat-select formControlName="locationType" required class="topunit">
                <mat-option value="Bus Terminal">Bus Terminal</mat-option>
                <mat-option value="Bus Station">Bus Station</mat-option>
                <mat-option value="Stop">Stop</mat-option>
              </mat-select>
              <mat-error *ngIf="locationForm.get('locationType')?.hasError('required')">
                Location type is required
              </mat-error>
            </mat-form-field>

            <!-- Address Fields (Optional) -->
            <h3>Address (Optional)</h3>
            <mat-form-field appearance="outline">
              <mat-label>Street</mat-label>
              <input matInput formControlName="street">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" formControlName="latitude">
              <mat-error *ngIf="locationForm.get('latitude')?.hasError('min') || locationForm.get('latitude')?.hasError('max')">
                Latitude must be between -90 and 90
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" formControlName="longitude">
              <mat-error *ngIf="locationForm.get('longitude')?.hasError('min') || locationForm.get('longitude')?.hasError('max')">
                Longitude must be between -180 and 180
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/locations">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="locationForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Adding...' : 'Add Location' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .add-location-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    input{
      padding-left: 5px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1, h3 {
      margin: 0;
      color: var(--primary-black);
    }

    h3 {
      margin-top: 1rem;
      font-size: 1.2rem;
    }

    mat-card {
      padding: 1.5rem;
    }
  mat-select{
   background-color: white;
  }
  mat-option{
    background-color: white;
  }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class AddLocationComponent {
  locationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private locationService: BusLocationService,
    private snackBar: MatSnackBar,
    private router:Router
  ) {
    this.locationForm = this.fb.group({
      locationName: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      locationType: ['', Validators.required],
      street: [''],
      postalCode: [''],
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]]
    });
  }

  submit(): void {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.locationForm.value;
    const locationData: BusLocation = {
      id: 0, // Will be set by backend
      locationName: formValue.locationName,
      city: formValue.city,
      state: formValue.state,
      country: formValue.country,
      locationType: formValue.locationType,
      location: (formValue.street || formValue.postalCode || formValue.latitude || formValue.longitude) ? {
        street: formValue.street || undefined,
        postalCode: formValue.postalCode || undefined,
        latitude: formValue.latitude || undefined,
        longitude: formValue.longitude || undefined
      } : undefined
    };

    this.locationService.createLocation(locationData).subscribe({
      next: () => {
        this.snackBar.open('Location created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/company/location']);
        this.isSubmitting = false;

      },
      error: (error: { error: { error: any; }; message: any; }) => {
        console.error('Error creating location:', error);
        let errorMessage = 'Failed to create location';
        if (error.error?.error) {
          errorMessage += `: ${error.error.error}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}
