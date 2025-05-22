import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

interface Bus {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
}

@Component({
  selector: 'app-company-add-ticket',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Ticket</mat-card-title>
          <mat-card-subtitle>Link a ticket to a route and bus</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Route</mat-label>
                <input type="text"
                       placeholder="Select a route"
                       matInput
                       formControlName="route"
                       [matAutocomplete]="autoRoute">
                <mat-autocomplete #autoRoute="matAutocomplete" [displayWith]="displayRouteFn">
                  <mat-option *ngFor="let route of filteredRoutes | async" [value]="route">
                    {{ route.name }} ({{ route.origin }} → {{ route.destination }})
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="ticketForm.get('route')?.hasError('required')">
                  Route is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Bus</mat-label>
                <input type="text"
                       placeholder="Select a bus"
                       matInput
                       formControlName="bus"
                       [matAutocomplete]="autoBus">
                <mat-autocomplete #autoBus="matAutocomplete" [displayWith]="displayBusFn">
                  <mat-option *ngFor="let bus of filteredBuses | async" [value]="bus">
                    {{ bus.registrationNumber }} - {{ bus.model }} ({{ bus.capacity }} seats)
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="ticketForm.get('bus')?.hasError('required')">
                  Bus is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Departure Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="departureDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="ticketForm.get('departureDate')?.hasError('required')">
                  Departure date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Departure Time</mat-label>
                <input matInput type="time" formControlName="departureTime">
                <mat-error *ngIf="ticketForm.get('departureTime')?.hasError('required')">
                  Departure time is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Price (RWF)</mat-label>
                <input matInput type="number" formControlName="price" min="0">
                <mat-error *ngIf="ticketForm.get('price')?.hasError('required')">
                  Price is required
                </mat-error>
                <mat-error *ngIf="ticketForm.get('price')?.hasError('min')">
                  Price must be 0 or greater
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="INACTIVE">Inactive</mat-option>
                  <mat-option value="SOLD_OUT">Sold Out</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-button routerLink="/company/tickets">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="ticketForm.invalid || submitting">
                <span *ngIf="!submitting">Create Ticket</span>
                <span *ngIf="submitting">Creating...</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class CompanyAddTicketComponent implements OnInit {
  ticketForm: FormGroup;
  submitting = false;

  routes: Route[] = [
    { id: '1', name: 'Kigali-Kampala Express', origin: 'Kigali', destination: 'Kampala' },
    { id: '2', name: 'Kigali-Nairobi Route', origin: 'Kigali', destination: 'Nairobi' },
    { id: '3', name: 'Kigali-Bujumbura Direct', origin: 'Kigali', destination: 'Bujumbura' }
  ];

  buses: Bus[] = [
    { id: '1', registrationNumber: 'RAA 123B', model: 'Toyota Coaster', capacity: 30 },
    { id: '2', registrationNumber: 'RAB 456C', model: 'Mercedes Sprinter', capacity: 20 },
    { id: '3', registrationNumber: 'RAC 789D', model: 'Hino Bus', capacity: 45 }
  ];

  filteredRoutes: Observable<Route[]>;
  filteredBuses: Observable<Bus[]>;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.ticketForm = this.fb.group({
      route: ['', Validators.required],
      bus: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required],
      notes: ['']
    });

    this.filteredRoutes = this.ticketForm.get('route')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterRoutes(name) : this.routes.slice();
      })
    );

    this.filteredBuses = this.ticketForm.get('bus')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const regNumber = typeof value === 'string' ? value : value?.registrationNumber;
        return regNumber ? this._filterBuses(regNumber) : this.buses.slice();
      })
    );
  }

  ngOnInit(): void {
    // In a real app, we would fetch routes and buses from a service
  }

  displayRouteFn(route: Route): string {
    return route ? `${route.name} (${route.origin} → ${route.destination})` : '';
  }

  displayBusFn(bus: Bus): string {
    return bus ? `${bus.registrationNumber} - ${bus.model}` : '';
  }

  private _filterRoutes(value: string): Route[] {
    const filterValue = value.toLowerCase();
    return this.routes.filter(route =>
      route.name.toLowerCase().includes(filterValue) ||
      route.origin.toLowerCase().includes(filterValue) ||
      route.destination.toLowerCase().includes(filterValue)
    );
  }

  private _filterBuses(value: string): Bus[] {
    const filterValue = value.toLowerCase();
    return this.buses.filter(bus =>
      bus.registrationNumber.toLowerCase().includes(filterValue) ||
      bus.model.toLowerCase().includes(filterValue)
    );
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) return;

    this.submitting = true;

    const formValue = this.ticketForm.value;

    // Format date and time
    const departureDate = new Date(formValue.departureDate);
    const [hours, minutes] = formValue.departureTime.split(':');
    departureDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const ticketData = {
      routeId: formValue.route.id,
      routeName: formValue.route.name,
      busId: formValue.bus.id,
      busRegistration: formValue.bus.registrationNumber,
      departureDateTime: departureDate,
      price: formValue.price,
      status: formValue.status,
      notes: formValue.notes,
      availableSeats: formValue.bus.capacity
    };

    // In a real app, this would send data to a service
    console.log('Submitting ticket data:', ticketData);

    // Simulate API call
    setTimeout(() => {
      this.submitting = false;
      this.snackBar.open('Ticket created successfully!', 'Close', { duration: 3000 });
      // this.router.navigate(['/company/tickets']);
    }, 1500);
  }
}
