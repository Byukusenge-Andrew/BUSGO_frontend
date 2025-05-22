import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Route } from '../../../services/bus-route.service';
import { Company } from '../../../services/company.services';

interface DialogData {
  mode: 'add' | 'edit' | 'view';
  route: Route;
  companies: Company[];
}

@Component({
  selector: 'app-route-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Route' : data.mode === 'edit' ? 'Edit Route' : 'View Route' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="routeForm" class="route-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Route Name</mat-label>
          <input matInput formControlName="routeName" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Company</mat-label>
          <mat-select formControlName="companyId" [disabled]="data.mode === 'view'">
            <mat-option *ngFor="let company of data.companies" [value]="company.companyId">
              {{ company.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Origin</mat-label>
          <input matInput formControlName="origin" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Destination</mat-label>
          <input matInput formControlName="destination" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Distance (km)</mat-label>
          <input matInput type="number" formControlName="distance" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Duration (hrs)</mat-label>
          <input matInput type="number" formControlName="duration" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Price (RWF)</mat-label>
          <input matInput type="number" formControlName="basePrice" [readonly]="data.mode === 'view'">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="active" [disabled]="data.mode === 'view'">
            <mat-option [value]="true">Active</mat-option>
            <mat-option [value]="false">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Close</button>
      <button mat-raised-button color="primary" *ngIf="data.mode !== 'view'" [disabled]="!routeForm.valid" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .route-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem;
    }
    .full-width {
      width: 100%;
    }
  `],
})
export class RouteDialogComponent {
  routeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RouteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.routeForm = this.fb.group({
      routeName: [
        { value: data.route.routeName || `${data.route.origin || ''} - ${data.route.destination || ''}`, disabled: data.mode === 'view' },
        Validators.required,
      ],
      companyId: [{ value: data.route.companyId || '', disabled: data.mode === 'view' }, Validators.required],
      origin: [{ value: data.route.origin || '', disabled: data.mode === 'view' }, Validators.required],
      destination: [{ value: data.route.destination || '', disabled: data.mode === 'view' }, Validators.required],
      distance: [{ value: data.route.distance || 0, disabled: data.mode === 'view' }, [Validators.required, Validators.min(0)]],
      duration: [{ value: data.route.duration || 0, disabled: data.mode === 'view' }, [Validators.required, Validators.min(0)]],
      basePrice: [{ value: data.route.basePrice || 0, disabled: data.mode === 'view' }, [Validators.required, Validators.min(0)]],
      active: [{ value: data.route.active !== undefined ? data.route.active : true, disabled: data.mode === 'view' }, Validators.required],
    });
  }

  onSave(): void {
    if (this.routeForm.valid) {
      const route: Route = {
        ...this.data.route,
        ...this.routeForm.value,
        id: this.data.route.id || '',
        createdAt: this.data.route.createdAt || new Date(),
      };
      this.dialogRef.close(route);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
