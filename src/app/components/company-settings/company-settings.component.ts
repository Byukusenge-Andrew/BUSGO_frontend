import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div class="settings-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Company Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3>Notification Settings</h3>
              <mat-slide-toggle formControlName="emailNotifications">
                Email Notifications
              </mat-slide-toggle>
              <mat-slide-toggle formControlName="smsNotifications">
                SMS Notifications
              </mat-slide-toggle>
            </div>

            <div class="form-section">
              <h3>Booking Settings</h3>
              <mat-form-field appearance="outline">
                <mat-label>Default Booking Window (days)</mat-label>
                <input matInput type="number" formControlName="bookingWindow" min="1" max="90">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cancellation Policy</mat-label>
                <mat-select formControlName="cancellationPolicy">
                  <mat-option value="flexible">Flexible (Full refund up to 24h before)</mat-option>
                  <mat-option value="moderate">Moderate (50% refund up to 12h before)</mat-option>
                  <mat-option value="strict">Strict (No refund)</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-section">
              <h3>Payment Settings</h3>
              <mat-form-field appearance="outline">
                <mat-label>Default Currency</mat-label>
                <mat-select formControlName="currency">
                  <mat-option value="RWF">Rwandan Franc (RWF)</mat-option>
                  <mat-option value="USD">US Dollar (USD)</mat-option>
                  <mat-option value="EUR">Euro (EUR)</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-slide-toggle formControlName="autoConfirmBookings">
                Auto-confirm bookings
              </mat-slide-toggle>
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="!settingsForm.valid">
              Save Settings
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    mat-card {
      padding: 2rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    h3 {
      margin-bottom: 1rem;
      color: var(--primary-black);
    }

    mat-form-field {
      width: 100%;
    }

    mat-slide-toggle {
      margin-bottom: 1rem;
    }

    button {
      align-self: flex-start;
    }
  `]
})
export class CompanySettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      bookingWindow: [30, [Validators.required, Validators.min(1), Validators.max(90)]],
      cancellationPolicy: ['moderate', Validators.required],
      currency: ['RWF', Validators.required],
      autoConfirmBookings: [false]
    });
  }

  ngOnInit(): void {
    // In a real app, this would load settings from the API
    // For now, we'll use default values
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      // In a real app, this would save settings via an API call
      this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
    }
  }
}
