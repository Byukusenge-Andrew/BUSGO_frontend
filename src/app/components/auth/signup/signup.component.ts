import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, SignupData } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome to BUSGO</h2>
          <p class="auth-subtitle">Already have an account? <a routerLink="/login">Log in</a></p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form" #signupForm="ngForm">
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
              #emailInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              [(ngModel)]="username"
              name="username"
              required
              placeholder="Choose a username"
              class="form-input"
              #usernameInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              [(ngModel)]="firstName"
              name="firstName"
              required
              placeholder="Enter your first name"
              class="form-input"
              #firstNameInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              [(ngModel)]="lastName"
              name="lastName"
              required
              placeholder="Enter your last name"
              class="form-input"
              #lastNameInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              [(ngModel)]="phoneNumber"
              name="phoneNumber"
              placeholder="Enter your phone number (optional)"
              class="form-input"
              #phoneNumberInput="ngModel"
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
                placeholder="Create a password"
                class="form-input"
                #passwordInput="ngModel"
              >
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <div class="password-requirements">
              <div class="requirement" [class.met]="hasMinLength">Use 8 or more characters</div>
              <div class="requirement" [class.met]="hasUpperCase">One Uppercase character</div>
              <div class="requirement" [class.met]="hasLowerCase">One lowercase character</div>
              <div class="requirement" [class.met]="hasSpecialChar">One special character</div>
              <div class="requirement" [class.met]="hasNumber">One number</div>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="acceptMarketing"
                name="acceptMarketing"
                class="checkbox-input"
              >
              <span class="checkbox-text">
                I want to receive emails about the product, feature updates, events, and marketing promotions.
              </span>
            </label>
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div class="terms-text">
            By creating an account, you agree to the <a href="/terms" target="_blank">Terms of use</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || !isFormValid()">
            {{ loading ? 'Creating account...' : 'Create an account' }}
          </button>
        </form>
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

    .password-requirements {
      margin-top: 0.75rem;
      font-size: 0.875rem;

      .requirement {
        color: var(--text-light);
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;

        &.met {
          color: #22c55e;

          &:before {
            content: "✓";
            margin-right: 0.5rem;
          }
        }
      }
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
    }

    .checkbox-input {
      margin-top: 0.25rem;
    }

    .checkbox-text {
      color: var(--text-dark);
      font-size: 0.875rem;
      font-weight: normal;
    }

    .terms-text {
      text-align: center;
      color: var(--text-light);
      font-size: 0.875rem;
      margin: 1.5rem 0;

      a {
        color: var(--primary-red);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
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
  `]
})
export class SignupComponent {
  email: string = '';
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = '';
  password: string = '';
  role: string = 'USER';
  showPassword: boolean = false;
  acceptMarketing: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  private readonly upperCaseRegex = /[A-Z]/;
  private readonly lowerCaseRegex = /[a-z]/;
  private readonly specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  private readonly numberRegex = /\d/;

  constructor(private authService: AuthService) {}

  get hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  get hasUpperCase(): boolean {
    return this.upperCaseRegex.test(this.password);
  }

  get hasLowerCase(): boolean {
    return this.lowerCaseRegex.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return this.specialCharRegex.test(this.password);
  }

  get hasNumber(): boolean {
    return this.numberRegex.test(this.password);
  }

  isFormValid(): boolean {
    return (
      this.email.length > 0 &&
      this.username.length > 0 &&
      this.firstName.length > 0 &&
      this.lastName.length > 0 &&
      this.hasMinLength &&
      this.hasUpperCase &&
      this.hasLowerCase &&
      this.hasSpecialChar &&
      this.hasNumber
    );
  }

  onSubmit() {
    if (this.loading || !this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.error = null;

    const signupData: SignupData = {
      email: this.email,
      username: this.username,
      password: this.password,
      role: this.role,
      active: true,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber
    };

    this.authService.signup(signupData).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
