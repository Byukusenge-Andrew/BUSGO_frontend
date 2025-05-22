import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-company-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Company Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter company email"
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Enter password"
            />
          </div>
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <button type="submit" [disabled]="!loginForm.valid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <div class="register-link">
          Need to register your company? <a routerLink="/company/register">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background-color: var(--white);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;

      h2 {
        text-align: center;
        color: var(--primary-black);
        margin-bottom: 1.5rem;
      }
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        color: var(--text-dark);
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      input {
        width: 100%;
        padding: 0.875rem 1rem;
        border: 2px solid var(--text-light);
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: var(--primary-red);
          box-shadow: 0 0 0 3px rgba(255, 76, 48, 0.1);
        }
      }
    }

    button {
      width: 100%;
      padding: 1rem;
      background-color: var(--primary-red);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        background-color: darken(#d32f2f, 10%); // Darken #d32f2f by 10%
      }

      &:disabled {
        background-color: var(--text-light);
        cursor: not-allowed;
      }
    }

    .error-message {
      color: var(--primary-red);
      margin-bottom: 1rem;
      text-align: center;
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-dark);

      a {
        color: var(--primary-red);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class CompanyLoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;
      this.authService.companyLogin(email, password).subscribe({
        next: () => {
          this.router.navigate(['/company/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Invalid credentials';
          this.loading = false;
        }
      });
    }
  }
}
