import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss']
})
export class RequestPasswordResetComponent implements OnInit {
  requestPasswordResetForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.requestPasswordResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  get email() { return this.requestPasswordResetForm.get('email'); }

  onSubmit() {
    if (this.requestPasswordResetForm.invalid) {
      this.requestPasswordResetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { email } = this.requestPasswordResetForm.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'A password reset link has been sent to your email. Please check your inbox (and spam/junk folder).';
        this.requestPasswordResetForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 5000);
      },
      error: (error) => {
        this.loading = false;
        const backendMessage = error.error?.message || 'Failed to send reset link. Please verify your email and try again.';
        if (backendMessage.includes('SMTPSendFailedException') || backendMessage.includes('450')) {
          this.errorMessage = 'Unable to send email due to server configuration. Please try again later or contact support.';
        } else if (backendMessage.includes('User not found')) {
          this.errorMessage = 'No account found with this email. Please check the email or register.';
        } else {
          this.errorMessage = backendMessage;
        }
        console.error('Password reset request error:', error);
      }
    });
  }
}
