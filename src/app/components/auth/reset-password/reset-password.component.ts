import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup; // Use definite assignment assertion
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      // Assuming email might be pre-filled or retrieved from context/route param later
      // If not, add it here: email: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]], // Added email field
      newPassword: ['', [Validators.required, Validators.minLength(6)]] // Example min length
    });
  }

  get email() { return this.resetPasswordForm.get('email'); }
  get newPassword() { return this.resetPasswordForm.get('newPassword'); }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched(); // Mark fields as touched to show errors
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { email, newPassword } = this.resetPasswordForm.value;

    // Assuming AuthService has a resetPassword method
    this.authService.resetPassword(email, newPassword).subscribe({
      next: (response: any) => { // Type the response if possible
        this.loading = false;
        this.successMessage = 'Password reset successfully. You can now log in.';
        // Optionally navigate after a delay or on user action
        setTimeout(() => this.router.navigate(['/login']), 3000);
        // this.resetPasswordForm.reset();
      },
      error: (error: { error: { message: any; }; }) => {
        this.loading = false;
        this.errorMessage = error.error?.message || error.error || 'Failed to reset password. Please try again.';
        console.error('Password reset error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
