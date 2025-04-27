import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {User} from '../../../services/user.service';

interface DialogData {
  title: string;
  user: Partial<User>;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <!-- Username field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username">
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <!-- Email field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" placeholder="Enter email" type="email">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <!-- First Name field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" placeholder="Enter first name">
        </mat-form-field>

        <!-- Last Name field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" placeholder="Enter last name">
        </mat-form-field>

        <!-- Phone Number field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
        </mat-form-field>

        <!-- Password field (only for new users) -->
        <mat-form-field appearance="outline" class="full-width" *ngIf="isNewUser">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" placeholder="Enter password" type="password">
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
            Password must be at least 6 characters
          </mat-error>
        </mat-form-field>

        <!-- Role field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="ADMIN">Admin</mat-option>
            <mat-option value="USER">User</mat-option>
            <mat-option value="COMPANY">Company</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('role')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>

        <!-- Active checkbox -->
        <div class="checkbox-field">
          <mat-checkbox formControlName="active">Active</mat-checkbox>
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
          {{ isNewUser ? 'Create' : 'Update' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .checkbox-field {
      margin-bottom: 15px;
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  isNewUser: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isNewUser = !data.user.id;
    this.userForm = this.fb.group({
      username: [data.user.username || '', Validators.required],
      email: [data.user.email || '', [Validators.required, Validators.email]],
      firstName: [data.user.firstName || ''],
      lastName: [data.user.lastName || ''],
      phoneNumber: [data.user.phoneNumber || ''],
      role: [data.user.role || 'USER', Validators.required],
      active: [data.user.active !== undefined ? data.user.active : true]
    });

    // Add password field only for new users
    if (this.isNewUser) {
      this.userForm.addControl('password', this.fb.control('', [
        Validators.required,
        Validators.minLength(6)
      ]));
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
