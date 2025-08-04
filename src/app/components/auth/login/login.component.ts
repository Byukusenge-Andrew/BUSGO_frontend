import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome back</h2>
          <p class="auth-subtitle">New to BUSGO? <a routerLink="/signup">Create an account</a></p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="Enter your email"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                placeholder="Enter your password"
                class="form-input"
              >
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || !isFormValid()">
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>
        </form>

        <div class="auth-footer">
          <a href="/forgot-password" class="forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-color: var(--white);
    }

    .auth-card {
      background: var(--white);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h2 {
      color: var(--primary-black);
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .auth-subtitle {
      color: var(--text-light);
      margin-bottom: 2rem;

      a {
        color: var(--primary-red);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      color: var(--text-dark);
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .form-input {
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

    .password-input {
      position: relative;

      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--primary-red);
        font-weight: 500;
        cursor: pointer;
      }
    }

    .btn-block {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 1rem;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
    }

    .forgot-password {
      color: var(--primary-red);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .alert {
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .alert-danger {
      color: #721c24;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isFormValid(): boolean {
    return this.email.length > 0 && this.password.length > 0;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 400) {
          this.error = 'Invalid username or password';
        } else if (error.status === 401) {
          this.error = 'Invalid credentials. Please check your email and password.';
        } else if (error.status === 403) {
          this.error = 'Access denied. Your account may be disabled.';
        } else if (error.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = error.error?.message || 'Login failed. Please check your credentials.';
        }
      }
    });
  }
}
