import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

interface BusType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-company-add-bus',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  // template: `
  //   <div class="add-bus-container">
  //     <mat-card class="add-bus-card">
  //       <mat-card-header>
  //         <mat-card-title>Add New Bus</mat-card-title>
  //         <mat-card-subtitle>Enter bus details below</mat-card-subtitle>
  //       </mat-card-header>
  //
  //       <mat-card-content>
  //         <form [formGroup]="busForm" (ngSubmit)="onSubmit()">
  //           <div class="form-row">
  //             <mat-form-field appearance="outline">
  //               <mat-label>Bus Registration Number</mat-label>
  //               <input matInput formControlName="registrationNumber" placeholder="e.g., RAA 123B">
  //               <mat-error *ngIf="busForm.get('registrationNumber')?.hasError('required')">
  //                 Registration number is required
  //               </mat-error>
  //             </mat-form-field>
  //
  //             <mat-form-field appearance="outline">
  //               <mat-label>Model</mat-label>
  //               <input matInput formControlName="model" placeholder="e.g., Toyota Coaster">
  //               <mat-error *ngIf="busForm.get('model')?.hasError('required')">
  //                 Model is required
  //               </mat-error>
  //             </mat-form-field>
  //           </div>
  //
  //           <div class="form-row">
  //             <mat-form-field appearance="outline">
  //               <mat-label>Bus Type</mat-label>
  //               <mat-select formControlName="busType">
  //                 <mat-option *ngFor="let type of busTypes" [value]="type.value">
  //                   {{type.viewValue}}
  //                 </mat-option>
  //               </mat-select>
  //               <mat-error *ngIf="busForm.get('busType')?.hasError('required')">
  //                 Bus type is required
  //               </mat-error>
  //             </mat-form-field>
  //
  //             <mat-form-field appearance="outline">
  //               <mat-label>Capacity</mat-label>
  //               <input matInput type="number" formControlName="capacity" min="1">
  //               <mat-error *ngIf="busForm.get('capacity')?.hasError('required')">
  //                 Capacity is required
  //               </mat-error>
  //               <mat-error *ngIf="busForm.get('capacity')?.hasError('min')">
  //                 Capacity must be greater than 0
  //               </mat-error>
  //             </mat-form-field>
  //           </div>
  //
  //           <div class="form-section">
  //             <h3>Amenities</h3>
  //             <p class="section-description">Select the amenities available on this bus</p>
  //
  //             <div class="amenities-grid">
  //               <mat-checkbox formControlName="hasAC">Air Conditioning</mat-checkbox>
  //               <mat-checkbox formControlName="hasWifi">WiFi</mat-checkbox>
  //               <mat-checkbox formControlName="hasUSB">USB Charging</mat-checkbox>
  //               <mat-checkbox formControlName="hasTV">TV/Entertainment</mat-checkbox>
  //               <mat-checkbox formControlName="hasWater">Drinking Water</mat-checkbox>
  //               <mat-checkbox formControlName="hasBathroom">Bathroom</mat-checkbox>
  //               <mat-checkbox formControlName="hasRecliningSeats">Reclining Seats</mat-checkbox>
  //               <mat-checkbox formControlName="hasLegroom">Extra Legroom</mat-checkbox>
  //             </div>
  //           </div>
  //
  //           <mat-form-field appearance="outline" class="full-width">
  //             <mat-label>Additional Notes</mat-label>
  //             <textarea matInput formControlName="notes" rows="3"></textarea>
  //           </mat-form-field>
  //
  //           <div class="form-actions">
  //             <button mat-button type="button" routerLink="/company/buses">Cancel</button>
  //             <button mat-raised-button color="primary" type="submit" [disabled]="busForm.invalid || submitting">
  //               <span *ngIf="!submitting">Add Bus</span>
  //               <span *ngIf="submitting">Adding...</span>
  //             </button>
  //           </div>
  //         </form>
  //       </mat-card-content>
  //     </mat-card>
  //   </div>
  // `,
  templateUrl:'./company-add-bus.component.html',
  // styles: [`
  //   .add-bus-container {
  //     max-width: 800px;
  //     margin: 2rem auto;
  //     padding: 0 1rem;
  //   }
  //
  //   .add-bus-card {
  //     border-radius: 8px;
  //     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  //   }
  //
  //   mat-card-header {
  //     margin-bottom: 1.5rem;
  //   }
  //
  //   mat-card-title {
  //     font-size: 1.75rem;
  //     font-weight: 500;
  //     margin-bottom: 0.5rem;
  //   }
  //
  //   mat-card-subtitle {
  //     color: rgba(0, 0, 0, 0.6);
  //   }
  //
  //   .form-row {
  //     display: flex;
  //     gap: 1rem;
  //     margin-bottom: 1rem;
  //   }
  //
  //   .form-row mat-form-field {
  //     flex: 1;
  //   }
  //
  //   .form-section {
  //     margin: 1.5rem 0;
  //   }
  //
  //   .form-section h3 {
  //     font-size: 1.1rem;
  //     font-weight: 500;
  //     margin-bottom: 0.5rem;
  //   }
  //
  //   .section-description {
  //     color: rgba(0, 0, 0, 0.6);
  //     font-size: 0.9rem;
  //     margin-bottom: 1rem;
  //   }
  //
  //   .amenities-grid {
  //     display: grid;
  //     grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  //     gap: 1rem;
  //     margin-bottom: 1.5rem;
  //   }
  //
  //   .full-width {
  //     width: 100%;
  //   }
  //
  //   .form-actions {
  //     display: flex;
  //     justify-content: flex-end;
  //     gap: 1rem;
  //     margin-top: 1.5rem;
  //   }
  //
  //   @media (max-width: 600px) {
  //     .form-row {
  //       flex-direction: column;
  //       gap: 0;
  //     }
  //
  //     .amenities-grid {
  //       grid-template-columns: 1fr;
  //     }
  //   }
  // `]
  styleUrl:'./company-add-bus.component.css'
})
export class CompanyAddBusComponent implements OnInit {
  busForm: FormGroup;
  submitting = false;

  busTypes: BusType[] = [
    {value: 'STANDARD', viewValue: 'Standard'},
    {value: 'PREMIUM', viewValue: 'Premium'},
    {value: 'LUXURY', viewValue: 'Luxury'},
    {value: 'MINI', viewValue: 'Mini Bus'},
    {value: 'DOUBLE_DECKER', viewValue: 'Double Decker'}
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.busForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      model: ['', Validators.required],
      busType: ['STANDARD', Validators.required],
      capacity: [45, [Validators.required, Validators.min(1)]],
      hasAC: [false],
      hasWifi: [false],
      hasUSB: [false],
      hasTV: [false],
      hasWater: [false],
      hasBathroom: [false],
      hasRecliningSeats: [false],
      hasLegroom: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  onSubmit(): void {
    if (this.busForm.invalid) return;

    this.submitting = true;

    // Prepare amenities as an array for the backend
    const formValue = this.busForm.value;
    const amenities = [
      formValue.hasAC ? 'AC' : null,
      formValue.hasWifi ? 'WiFi' : null,
      formValue.hasUSB ? 'USB Charging' : null,
      formValue.hasTV ? 'TV/Entertainment' : null,
      formValue.hasWater ? 'Drinking Water' : null,
      formValue.hasBathroom ? 'Bathroom' : null,
      formValue.hasRecliningSeats ? 'Reclining Seats' : null,
      formValue.hasLegroom ? 'Extra Legroom' : null
    ].filter(amenity => amenity !== null);

    const busData = {
      registrationNumber: formValue.registrationNumber,
      model: formValue.model,
      busType: formValue.busType,
      capacity: formValue.capacity,
      amenities: amenities,
      notes: formValue.notes
    };

    // In a real app, this would send data to a service
    console.log('Submitting bus data:', busData);

    // Simulate API call
    setTimeout(() => {
      this.submitting = false;
      this.snackBar.open('Bus added successfully!', 'Close', { duration: 3000 });
      // this.router.navigate(['/company/buses']);
    }, 1000);
  }
}
