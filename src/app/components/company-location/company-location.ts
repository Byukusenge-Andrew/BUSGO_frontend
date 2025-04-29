import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { BusLocationService, BusLocation } from '../../services/bus-location.service';

@Component({
  selector: 'app-view-locations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <div class="view-locations-container">
      <div class="header">
        <h1>Manage Locations</h1>
        <a routerLink="/add-location" mat-raised-button color="primary">
          <mat-icon>add</mat-icon> Add New Location
        </a>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="filter">
            <mat-label>Search Locations</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, city, or street" #input>
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="table-container mat-elevation-z8">
            <table mat-table [dataSource]="filteredLocations" matSort>
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let location">{{ location.id }}</td>
              </ng-container>

              <ng-container matColumnDef="locationName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let location">{{ location.locationName }}</td>
              </ng-container>

              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>City</th>
                <td mat-cell *matCellDef="let location">{{ location.city }}</td>
              </ng-container>

              <ng-container matColumnDef="state">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>State/Province</th>
                <td mat-cell *matCellDef="let location">{{ location.state }}</td>
              </ng-container>

              <ng-container matColumnDef="country">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Country</th>
                <td mat-cell *matCellDef="let location">{{ location.country }}</td>
              </ng-container>

              <ng-container matColumnDef="locationType">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let location">{{ location.locationType }}</td>
              </ng-container>

              <ng-container matColumnDef="address">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Address</th>
                <td mat-cell *matCellDef="let location">
                  {{ location.address?.street || 'N/A' }}
                  <span *ngIf="location.address?.postalCode"> ({{ location.address.postalCode }})</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let location">
                  <button mat-icon-button color="accent" (click)="editLocation(location)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteLocation(location)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="8">No data matching the filter "{{ input.value }}"</td>
              </tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 25]" aria-label="Select page of locations"></mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .view-locations-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: var(--primary-black);
    }

    .filter {
      width: 100%;
      max-width: 300px;
      margin-bottom: 1.5rem;
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

    .mat-column-address {
      max-width: 200px;
    }
  `]
})
export class ViewLocationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<BusLocation>;

  locations: BusLocation[] = [];
  filteredLocations: BusLocation[] = [];
  displayedColumns: string[] = [
    'id', 'locationName', 'city', 'state', 'country', 'locationType', 'address', 'actions'
  ];

  constructor(
    private locationService: BusLocationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        console.log('Locations loaded:', locations);
        this.locations = locations;
        this.filteredLocations = [...locations];
        this.table.renderRows();
        if (this.paginator) {
          this.paginator.length = this.filteredLocations.length;
        }
        if (locations.length === 0) {
          this.snackBar.open('No locations found.', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.snackBar.open('Failed to load locations: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredLocations = this.locations.filter(location =>
      location.locationName.toLowerCase().includes(filterValue) ||
      location.city.toLowerCase().includes(filterValue) ||
      (location.address?.street?.toLowerCase().includes(filterValue) ?? false)
    );
    this.table.renderRows();
    if (this.paginator) {
      this.paginator.length = this.filteredLocations.length;
    }
  }

  editLocation(location: BusLocation): void {
    this.snackBar.open(`Edit location ${location.id} functionality will be implemented`, 'Close', { duration: 3000 });
    // TODO: Implement edit functionality (e.g., open a dialog similar to AddLocationComponent)
  }

  deleteLocation(location: BusLocation): void {
    if (confirm(`Are you sure you want to delete location ${location.locationName}?`)) {
      this.locationService.deleteLocation(location.id).subscribe({
        next: () => {
          this.locations = this.locations.filter(l => l.id !== location.id);
          this.filteredLocations = this.filteredLocations.filter(l => l.id !== location.id);
          this.table.renderRows();
          if (this.paginator) {
            this.paginator.length = this.filteredLocations.length;
          }
          this.snackBar.open(`Location ${location.locationName} deleted successfully`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting location:', error);
          let errorMessage = 'Failed to delete location';
          if (error.error?.error) {
            errorMessage += `: ${error.error.error}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
