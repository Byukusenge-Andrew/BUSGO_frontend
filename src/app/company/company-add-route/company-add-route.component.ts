
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { RouteService } from '../../services/bus-route.service';
import { AuthService } from '../../services/auth.service';
import { BusLocationService, BusLocation } from '../../services/bus-location.service';

@Component({
  selector: 'app-company-add-route',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `<div class="container">
    <mat-card>
      <mat-card-header>
        <mat-card-title>Add New Route</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="routeForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Route Name</mat-label>
              <input matInput formControlName="routeName">
              <mat-error *ngIf="routeForm.get('routeName')?.hasError('required')">
                Route name is required
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Route Code</mat-label>
              <input matInput formControlName="routeCode">
              <mat-error *ngIf="routeForm.get('routeCode')?.hasError('required')">
                Route code is required
              </mat-error>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Origin</mat-label>
              <mat-select formControlName="originLocationId" required>
                <mat-option *ngFor="let location of locations" [value]="location.id">
                  {{ location.locationName }} ({{ location.city }}, {{ location.country }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="routeForm.get('originLocationId')?.hasError('required')">
                Origin is required
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Destination</mat-label>
              <mat-select formControlName="destinationLocationId" required>
                <mat-option *ngFor="let location of locations" [value]="location.id">
                  {{ location.locationName }} ({{ location.city }}, {{ location.country }})
                </mat-option>
              </mat-select>
              <mat-error *ngIf="routeForm.get('destinationLocationId')?.hasError('required')">
                Destination is required
              </mat-error>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Total Distance (km)</mat-label>
              <input matInput type="number" formControlName="totalDistance">
              <mat-error *ngIf="routeForm.get('totalDistance')?.hasError('required')">
                Distance is required
              </mat-error>
              <mat-error *ngIf="routeForm.get('totalDistance')?.hasError('min')">
                Distance must be greater than 0
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estimated Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="estimatedDuration">
              <mat-error *ngIf="routeForm.get('estimatedDuration')?.hasError('required')">
                Duration is required
              </mat-error>
              <mat-error *ngIf="routeForm.get('estimatedDuration')?.hasError('min')">
                Duration must be greater than 0
              </mat-error>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Base Price</mat-label>
              <input matInput type="number" formControlName="basePrice">
              <mat-error *ngIf="routeForm.get('basePrice')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="routeForm.get('basePrice')?.hasError('min')">
                Price must be greater than 0
              </mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="active">
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="actions">
            <button mat-button routerLink="/company/routes">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="routeForm.invalid || isSubmitting">
              <span *ngIf="!isSubmitting">Save Route</span>
              <span *ngIf="isSubmitting">Saving...</span>
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  </div>`,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `]
})

export class CompanyAddRouteComponent implements OnInit {
  routeForm: FormGroup;
  isSubmitting = false;
  locations: BusLocation[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private routeService: RouteService,
    private authService: AuthService,
    private locationService: BusLocationService,
    private router: Router
  ) {
    this.routeForm = this.fb.group({
      routeName: ['', Validators.required],
      routeCode: ['', Validators.required],
      originLocationId: ['', Validators.required],
      destinationLocationId: ['', Validators.required],
      description: [''],
      totalDistance: [0, [Validators.required, Validators.min(0.1)]],
      estimatedDuration: [0, [Validators.required, Validators.min(1)]],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    // Generate route code
    const timestamp = new Date().getTime();
    const routeCode = `RT-${timestamp.toString().slice(-6)}`;
    this.routeForm.get('routeCode')?.setValue(routeCode);

    // Load locations
    this.loadLocations();
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

  onSubmit(): void {
    if (this.routeForm.invalid) return;

    this.isSubmitting = true;
    const companyId = this.authService.getCurrentUserId();
    console.log("The current user id is " + companyId);

    if (!companyId) {
      this.snackBar.open('Authentication error. Please log in again.', 'Close', {
        duration: 5000
      });
      this.isSubmitting = false;
      return;
    }

    // Find the selected locations
    const originLocation = this.locations.find(loc => loc.id === Number(this.routeForm.value.originLocationId));
    const destinationLocation = this.locations.find(loc => loc.id === Number(this.routeForm.value.destinationLocationId));

    if (!originLocation || !destinationLocation) {
      this.snackBar.open('Selected locations not found. Please try again.', 'Close', {
        duration: 5000
      });
      this.isSubmitting = false;
      return;
    }

    const routeData = {
      routeName: this.routeForm.value.routeName,
      routeCode: this.routeForm.value.routeCode,
      description: this.routeForm.value.description,
      totalDistance: this.routeForm.value.totalDistance,
      estimatedDuration: this.routeForm.value.estimatedDuration,
      basePrice: this.routeForm.value.basePrice,
      active: this.routeForm.value.active,
      origin: originLocation.locationName,
      destination: destinationLocation.locationName,
      originLocationId: originLocation.id,
      destinationLocationId: destinationLocation.id,
      company: {
        companyId: Number(companyId)
      }
    };

    console.log('Route data to submit:', JSON.stringify(routeData));

    this.routeService.createRoute(routeData).subscribe({
      next: (createdRoute) => {
        this.snackBar.open('Route created successfully!', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/company/routes']);
      },
      error: (error) => {
        console.error('Error creating route:', error);
        let errorMessage = 'Failed to create route';
        if (error.error?.error) {
          errorMessage += `: ${error.error.error}`;
        } else if (error.error?.message) {
          errorMessage += `: ${error.error.message}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
