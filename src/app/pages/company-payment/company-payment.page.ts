import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyPaymentComponent } from '../../components/company-payment/company-payment.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-company-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    CompanyPaymentComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Payment Management</h1>
          <p class="subtitle">Manage your company's payment methods, transactions, and billing information</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="primary" routerLink="/company/dashboard">
            <mat-icon>arrow_back</mat-icon>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div class="page-content">
        <app-company-payment></app-company-payment>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0 0.5rem 0;
      color: var(--primary-black);
    }

    .subtitle {
      color: var(--text-dark);
      font-size: 1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .page-content {
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `]
})
export class CompanyPaymentPage {}
