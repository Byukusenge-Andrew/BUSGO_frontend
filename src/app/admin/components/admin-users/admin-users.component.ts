import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AdminService, AdminUser } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
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
    MatTooltipModule
  ],
  template: `
    <div class="admin-users">
      <div class="header">
        <h2>Manage Users</h2>
        <button class="button" mat-raised-button color="primary" (click)="openAddUserDialog()">
          Add User
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline">
          <mat-label>Search Users</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, or role" #input>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="dataSource" matSort>
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let user">{{ user.id }}</td>
          </ng-container>

          <!-- Username Column -->
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Username</th>
            <td mat-cell *matCellDef="let user">{{ user.username }}</td>
          </ng-container>

          <!-- Full Name Column -->
          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Full Name</th>
            <td mat-cell *matCellDef="let user">
              {{ (user.firstName && user.lastName) ? (user.firstName + ' ' + user.lastName) : 'N/A' }}
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <!-- Phone Column -->
          <ng-container matColumnDef="phoneNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Phone</th>
            <td mat-cell *matCellDef="let user">{{ user.phoneNumber || 'N/A' }}</td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
            <td mat-cell *matCellDef="let user">
              <span class="role-badge" [ngClass]="user.role.toLowerCase()">
                {{ user.role }}
              </span>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let user">
              <span class="status-badge" [ngClass]="user.active ? 'active' : 'inactive'">
                {{ user.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <!-- Last Login Column -->
          <ng-container matColumnDef="lastLogin">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Login</th>
            <td mat-cell *matCellDef="let user">{{ user.lastLogin | date:'medium' }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button class="button" color="primary" (click)="editUser(user)">
                <span>edit</span>
              </button>
              <button
                (click)="toggleUserStatus(user)"
                class="button"
                matTooltip="{{ user.active ? 'Deactivate' : 'Activate' }} user">
                <span>{{ user.active ? 'block' : 'check_circle' }}</span>
              </button>
              <button class="button" color="warn" (click)="deleteUser(user)">
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

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
      padding: 1rem;

      .button {
        display: inline-block;
        padding: 3px 3px;
        margin-left: 1px;
        background-color: #a5230d;
        color: #ffffff;
        text-align: center;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .button:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
      }

      .button:active {
        transform: translateY(0);
      }

      .button:focus {
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

      .role-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.admin {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        &.user {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        &.company {
          background-color: #fff3e0;
          color: #f57c00;
        }
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
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'fullName', 'email', 'phoneNumber', 'role', 'status', 'lastLogin', 'actions'];
  dataSource = new MatTableDataSource<AdminUser>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { title: 'Add New User', user: {} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.createUser(result).subscribe({
          next: () => {
            this.loadUsers();
          }
        });
      }
    });
  }

  editUser(user: AdminUser): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { title: 'Edit User', user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateUser(user.id, result).subscribe({
          next: () => {
            this.loadUsers();
          }
        });
      }
    });
  }

  toggleUserStatus(user: AdminUser): void {
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} ${user.username}?`,
        confirmText: 'Yes',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.changeUserStatus(user.id, newStatus).subscribe({
          next: () => {
            this.loadUsers();
          }
        });
      }
    });
  }

  deleteUser(user: AdminUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.username}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
          }
        });
      }
    });
  }
}
