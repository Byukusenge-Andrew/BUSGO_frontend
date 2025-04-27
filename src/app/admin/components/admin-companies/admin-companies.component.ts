import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../services/admin.service';
import { Company } from '../../../models/company.model';
import {UserFormDialogComponent} from '../user-form-dialog/user-form-dialog.component';
import {AddCompanyDialogComponent} from '../admin-add-company/admin-add-company.component';

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
        <button class="button" mat-raised-button color="primary" (click)="openAddCompanyDialog()">
         Add Company
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline">
          <mat-label>Search Companies</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, or phone" #input>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let company">{{ company.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="companyName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let company">{{ company.companyName }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="contactEmail">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let company">{{ company.contactEmail }}</td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="contactPhone">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Phone</th>
            <td mat-cell *matCellDef="let company">{{ company.contactPhone }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let company">
              <span class="status-badge" [ngClass]="company.active ? 'active' : 'inactive'">
                {{ company.active ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </td>
          </ng-container>

          <!-- Bus Count Column -->
          <ng-container matColumnDef="busCount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Buses</th>
            <td mat-cell *matCellDef="let company">
              <mat-chip-listbox>
                <mat-chip color="primary" selected>
                  {{ company.busCount || 0 }} Buses
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
                  {{ company.routeCount || 0 }} Routes
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
                <span>visibility</span>
              </button>
              <button mat-icon-button color="accent" (click)="editCompany(company)">
                <span>search</span>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCompany(company)">
                <span>delete</span>
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
      padding: 1px;



      button {
        display: inline-block;
        padding: 3px 3px;
        margin-left: 1px;
        background-color: #a5230d;
        color: #ffffff;
        text-align: center;
        text-decoration: none;
        font-size: 10px;
        font-weight: 500;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      button:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
      }

      button:active {
        transform: translateY(0);
      }

      button:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
      }

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
export class AdminCompaniesComponent implements OnInit, AfterViewInit {
  companies: Company[] = [];
  displayedColumns: string[] = ['id', 'companyName', 'contactEmail', 'contactPhone', 'status', 'busCount', 'routeCount', 'registrationDate', 'actions'];
  dataSource = new MatTableDataSource<Company>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.adminService.getAllCompanies().subscribe({
      next: (companies) => {
        // Convert dates to Date objects
        this.companies = companies.map(company => ({
          ...company,
          registrationDate: new Date(company.registrationDate)
        }));
        this.dataSource.data = this.companies;
        this.isLoading = false;
        console.log(companies);
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;

        // Fallback to mock data if API fails
        this.loadMockCompanies();
      }
    });
  }

  loadMockCompanies(): void {
    // Mock data for development/testing
    this.companies = [
      {
        id: 1,
        companyId: 1,
        companyName: 'Rwanda Express',
        contactEmail: 'info@rwandaexpress.com',
        contactPhone: '+250 788 123 456',
        contactPerson: "John Doe",
        address: 'KN 5 Rd, Kigali',
        active: true,
        licenseNumber: "LIC123456",
        busCount: 15,
        routeCount: 8,
        registrationDate: new Date(2022, 0, 15),
        status: 'ACTIVE'
      },
      {
        id: 2,
        companyId: 2,
        companyName: 'Volcano Transport',
        contactEmail: 'contact@volcanotransport.com',
        contactPhone: '+250 789 234 567',
        address: 'KG 123 St, Kigali',
        active: true,
        contactPerson: "Jane Smith",
        licenseNumber: "LIC234567",
        busCount: 12,
        routeCount: 6,
        registrationDate: new Date(2022, 2, 10),
        status: 'ACTIVE'
      },
      {
        id: 3,
        companyId: 3,
        companyName: 'Kigali Bus Services',
        contactEmail: 'info@kigalibus.com',
        contactPhone: '+250 787 345 678',
        address: 'KN 3 Rd, Kigali',
        active: false,
        contactPerson: "Mockingbird",
        licenseNumber: "LIC345678",
        busCount: 5,
        routeCount: 3,
        registrationDate: new Date(2023, 1, 20),
        status: 'ACTIVE'
      },
      {
        id: 4,
        companyId: 4,
        companyName: 'Lake Kivu Transport',
        contactEmail: 'info@lakekivutransport.com',
        contactPhone: '+250 786 456 789',
        address: 'KG 456 Ave, Kigali',
        active: false,
        contactPerson: "Robert Johnson",
        licenseNumber: "LIC456789",
        busCount: 8,
        routeCount: 4,
        registrationDate: new Date(2022, 5, 5),
        status: 'ACTIVE'
      },
      {
        id: 5,
        companyId: 5,
        companyName: 'Mountain View Buses',
        contactEmail: 'contact@mountainviewbuses.com',
        contactPhone: '+250 785 567 890',
        address: 'KN 7 Rd, Kigali',
        active: true,
        contactPerson: "Sarah Williams",
        licenseNumber: "LIC567890",
        busCount: 10,
        routeCount: 5,
        registrationDate: new Date(2022, 8, 12),
        status: 'ACTIVE'
      }
    ];
    this.dataSource.data = this.companies;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // openAddCompanyDialog(): void {
  //   // TODO: Implement dialog component for adding companies
  //   this.snackBar.open('Add company functionality will be implemented', 'Close', { duration: 3000 });
  // }

  viewCompany(company: Company): void {
    // TODO: Implement dialog component for viewing company details
    this.adminService.getCompanyById(company.id).subscribe({
      next: (companyDetails) => {
        console.log('Company details:', companyDetails);
        this.snackBar.open(`View company ${company.companyName} functionality will be implemented`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  editCompany(company: Company): void {
    // TODO: Implement dialog component for editing companies
    this.snackBar.open(`Edit company ${company.companyName} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  deleteCompany(company: Company): void {
    if (confirm(`Are you sure you want to delete ${company.companyName}?`)) {
      this.adminService.deleteCompany(company.id).subscribe({
        next: () => {
          this.loadCompanies(); // Reload the list after deletion
        },
        error: (error) => {
          console.error(error);

          // If API call fails, update UI optimistically
          this.companies = this.companies.filter(c => c.id !== company.id);
          this.dataSource.data = this.companies;
        }
      });
    }
  }

  openAddCompanyDialog(): void {
    const dialogRef = this.dialog.open(AddCompanyDialogComponent, {
      width: '500px',
      data: { title: 'Add New User', user: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createUser(result).subscribe({
          next: () => {
            this.loadCompanies();
          }
        });
      }
    });
  }
}
