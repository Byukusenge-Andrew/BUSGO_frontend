import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface CompanyDialogData {
  title: string;
  company?: any;
}

@Component({
  selector: 'app-add-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content>
      <form [formGroup]="companyForm">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Company Name</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="companyForm.get('name')?.hasError('required')">
              Company name is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="companyForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="companyForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone">
            <mat-error *ngIf="companyForm.get('phone')?.hasError('required')">
              Phone number is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Address</mat-label>
            <textarea matInput formControlName="address" rows="3"></textarea>
            <mat-error *ngIf="companyForm.get('address')?.hasError('required')">
              Address is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>License Number</mat-label>
            <input matInput formControlName="licenseNumber">
            <mat-error *ngIf="companyForm.get('licenseNumber')?.hasError('required')">
              License number is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="PENDING">Pending</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
            </mat-select>
            <mat-error *ngIf="companyForm.get('status')?.hasError('required')">
              Status is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="companyForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="companyForm.get('password')?.hasError('minlength')">
              Password must be at least 8 characters
            </mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="companyForm.invalid"
        (click)="onSubmit()">
        Register Company
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-row {
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 500px;
      max-width: 800px;
      padding-top: 1rem;
    }
  `]
})
export class AddCompanyDialogComponent implements OnInit {
  companyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddCompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyDialogData
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    // If editing an existing company, populate the form
    if (data.company) {
      this.companyForm.patchValue({
        name: data.company.companyName || data.company.name,
        email: data.company.contactEmail || data.company.email,
        phone: data.company.contactPhone || data.company.phone,
        address: data.company.address,
        licenseNumber: data.company.licenseNumber,
        status: data.company.status || 'ACTIVE'
      });

      // Remove password requirement when editing
      if (data.company.id) {
        this.companyForm.get('password')?.clearValidators();
        this.companyForm.get('password')?.updateValueAndValidity();
      }
    }
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.companyForm.invalid) return;

    // Return form data to the caller
    this.dialogRef.close(this.companyForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
