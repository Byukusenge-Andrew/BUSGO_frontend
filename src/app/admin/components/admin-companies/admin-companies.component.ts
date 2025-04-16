import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  busCount: number;
  routeCount: number;
  registrationDate: Date;
}

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="admin-companies">
      <div class="header">
        <h2>Manage Bus Companies</h2>
        <button mat-raised-button color="primary" (click)="openAddCompanyDialog()">
          <mat-icon>add</mat-icon> Add Company
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline">
          <mat-label>Search Companies</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, or phone" #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="companies" matSort>
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let company">{{ company.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let company">{{ company.name }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let company">{{ company.email }}</td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Phone</th>
            <td mat-cell *matCellDef="let company">{{ company.phone }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let company">
              <span class="status-badge" [ngClass]="company.status.toLowerCase()">
                {{ company.status }}
              </span>
            </td>
          </ng-container>

          <!-- Bus Count Column -->
          <ng-container matColumnDef="busCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Buses</th>
            <td mat-cell *matCellDef="let company">
              <mat-chip-listbox>
                <mat-chip color="primary" selected>
                  {{ company.busCount }} Buses
                </mat-chip>
              </mat-chip-listbox>
            </td>
          </ng-container>

          <!-- Route Count Column -->
          <ng-container matColumnDef="routeCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Routes</th>
            <td mat-cell *matCellDef="let company">
              <mat-chip-listbox>
                <mat-chip color="accent" selected>
                  {{ company.routeCount }} Routes
                </mat-chip>
              </mat-chip-listbox>
            </td>
          </ng-container>

          <!-- Registration Date Column -->
          <ng-container matColumnDef="registrationDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Registered</th>
            <td mat-cell *matCellDef="let company">{{ company.registrationDate | date:'mediumDate' }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let company">
              <button mat-icon-button color="primary" (click)="viewCompany(company)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="editCompany(company)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCompany(company)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="9">No data matching the filter "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of companies"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-companies {
      padding: 1rem;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;

        h2 {
          margin: 0;
          color: var(--primary-black);
        }
      }

      .search-bar {
        margin-bottom: 1.5rem;
        width: 100%;
        max-width: 500px;
      }

      .table-container {
        position: relative;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
      }

      table {
        width: 100%;
      }

      .mat-column-actions {
        width: 120px;
        text-align: center;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.active {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        &.inactive {
          background-color: #ffebee;
          color: #d32f2f;
        }

        &.pending {
          background-color: #fff3e0;
          color: #f57c00;
        }

        &.suspended {
          background-color: #f5f5f5;
          color: #616161;
        }
      }

      mat-chip-list {
        display: inline-block;
      }
    }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  companies: Company[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'status', 'busCount', 'routeCount', 'registrationDate', 'actions'];
  filteredCompanies: Company[] = [];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    // In a real app, this would fetch from the API
    this.companies = [
      {
        id: 1,
        name: 'Rwanda Express',
        email: 'info@rwandaexpress.com',
        phone: '+250 788 123 456',
        address: 'KN 5 Rd, Kigali',
        status: 'ACTIVE',
        busCount: 15,
        routeCount: 8,
        registrationDate: new Date(2022, 0, 15)
      },
      {
        id: 2,
        name: 'Volcano Transport',
        email: 'contact@volcanotransport.com',
        phone: '+250 789 234 567',
        address: 'KG 123 St, Kigali',
        status: 'ACTIVE',
        busCount: 12,
        routeCount: 6,
        registrationDate: new Date(2022, 2, 10)
      },
      {
        id: 3,
        name: 'Kigali Bus Services',
        email: 'info@kigalibus.com',
        phone: '+250 787 345 678',
        address: 'KN 3 Rd, Kigali',
        status: 'PENDING',
        busCount: 5,
        routeCount: 3,
        registrationDate: new Date(2023, 1, 20)
      },
      {
        id: 4,
        name: 'Lake Kivu Transport',
        email: 'info@lakekivutransport.com',
        phone: '+250 786 456 789',
        address: 'KG 456 Ave, Kigali',
        status: 'SUSPENDED',
        busCount: 8,
        routeCount: 4,
        registrationDate: new Date(2022, 5, 5)
      },
      {
        id: 5,
        name: 'Mountain View Buses',
        email: 'contact@mountainviewbuses.com',
        phone: '+250 785 567 890',
        address: 'KN 7 Rd, Kigali',
        status: 'ACTIVE',
        busCount: 10,
        routeCount: 5,
        registrationDate: new Date(2022, 8, 12)
      }
    ];
    this.filteredCompanies = [...this.companies];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredCompanies = this.companies.filter(company =>
      company.name.toLowerCase().includes(filterValue) ||
      company.email.toLowerCase().includes(filterValue) ||
      company.phone.toLowerCase().includes(filterValue)
    );
  }

  openAddCompanyDialog(): void {
    // In a real app, this would open a dialog to add a company
    this.snackBar.open('Add company functionality will be implemented', 'Close', { duration: 3000 });
  }

  viewCompany(company: Company): void {
    // In a real app, this would open a dialog to view company details
    this.snackBar.open(`View company ${company.name} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  editCompany(company: Company): void {
    // In a real app, this would open a dialog to edit a company
    this.snackBar.open(`Edit company ${company.name} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  deleteCompany(company: Company): void {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      // In a real app, this would delete the company from the API
      this.companies = this.companies.filter(c => c.id !== company.id);
      this.filteredCompanies = this.filteredCompanies.filter(c => c.id !== company.id);
      this.snackBar.open(`Company ${company.name} deleted successfully`, 'Close', { duration: 3000 });
    }
  }
}
