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
import { UserService } from '../../../services/user.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: Date;
}

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
    MatSnackBarModule
  ],
  template: `
    <div class="admin-users">
      <div class="header">
        <h2>Manage Users</h2>
        <button mat-raised-button color="primary" (click)="openAddUserDialog()">
          <mat-icon>add</mat-icon> Add User
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline">
          <mat-label>Search Users</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, or role" #input>
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="users" matSort>
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let user">{{ user.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
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
              <span class="status-badge" [ngClass]="user.status.toLowerCase()">
                {{ user.status }}
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
              <button mat-icon-button color="primary" (click)="editUser(user)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" colspan="7">No data matching the filter "{{ input.value }}"</td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of users"></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
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
        width: 100px;
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

        &.pending {
          background-color: #fff3e0;
          color: #f57c00;
        }
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  filteredUsers: User[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // In a real app, this would fetch from the API
    this.users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'ACTIVE', lastLogin: new Date() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'USER', status: 'ACTIVE', lastLogin: new Date(Date.now() - 86400000) },
      { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: new Date(Date.now() - 172800000) },
      { id: 4, name: 'Bus Company', email: 'company@example.com', role: 'COMPANY', status: 'ACTIVE', lastLogin: new Date(Date.now() - 259200000) },
      { id: 5, name: 'Inactive User', email: 'inactive@example.com', role: 'USER', status: 'INACTIVE', lastLogin: new Date(Date.now() - 345600000) }
    ];
    this.filteredUsers = [...this.users];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue) ||
      user.role.toLowerCase().includes(filterValue)
    );
  }

  openAddUserDialog(): void {
    // In a real app, this would open a dialog to add a user
    this.snackBar.open('Add user functionality will be implemented', 'Close', { duration: 3000 });
  }

  editUser(user: User): void {
    // In a real app, this would open a dialog to edit a user
    this.snackBar.open(`Edit user ${user.name} functionality will be implemented`, 'Close', { duration: 3000 });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      // In a real app, this would delete the user from the API
      this.users = this.users.filter(u => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
      this.snackBar.open(`User ${user.name} deleted successfully`, 'Close', { duration: 3000 });
    }
  }
}
