import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusBookingService } from '../../services/bus-booking.service';
import { Router } from '@angular/router';
import { BusRouteService } from '../../services/bus-route.service';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface Bus {
  id: string;
  busName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  type: string;
  availableSeats: number;
}

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './bus-search.component.html',
  styleUrls: ['./bus-search.component.scss']
})
export class BusSearchComponent implements OnInit {
  searchForm: FormGroup;
  loading = false;
  searchResults: Bus[] = [];
  searched = false;
  minDate = new Date().toISOString().split('T')[0];

  // Cities for autocomplete
  cities = [
    'Kigali',
    'Musanze',
    'Huye',
    'Rubavu',
    'Nyamata',
    'Rusizi',
    'Nyagatare',
    'Gisenyi',
    'Butare',
    'Kibuye'
  ];

  filteredFromCities: Observable<string[]> = of([]);
  filteredToCities: Observable<string[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private busRouteService: BusRouteService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      sortBy: ['price']
    });
  }

  ngOnInit() {
    // Initialize autocomplete filters
    this.filteredFromCities = this.searchForm.get('from')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredToCities = this.searchForm.get('to')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  displayFn(city: string): string {
    return city ? city : '';
  }

  onFromInput(event: any) {
    const value = event.target.value;
    if (!this.cities.includes(value)) {
      this.searchForm.get('from')!.setValue('');
    }
  }

  onToInput(event: any) {
    const value = event.target.value;
    if (!this.cities.includes(value)) {
      this.searchForm.get('to')!.setValue('');
    }
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.loading = true;
      this.searched = true;

      const searchParams = {
        from: this.searchForm.get('from')?.value,
        to: this.searchForm.get('to')?.value,
        date: this.searchForm.get('date')?.value,
        passengers: this.searchForm.get('passengers')?.value
      };

      this.busRouteService.searchBuses(searchParams).subscribe({
        next: (results: any[]) => {
          this.searchResults = this.sortResults(results, this.searchForm.get('sortBy')?.value);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error searching buses:', error);
          this.loading = false;
        }
      });
    }
  }

  private sortResults(results: Bus[], sortBy: string): Bus[] {
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'time':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'duration':
          return this.parseDuration(a.duration) - this.parseDuration(b.duration);
        default:
          return 0;
      }
    });
  }

  private parseDuration(duration: string): number {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours * 60 + minutes;
  }

  viewBusDetails(busId: string) {
    this.router.navigate(['/bus', busId]);
  }

  bookNow(busId: string) {
    this.router.navigate(['/booking', busId], {
      queryParams: {
        passengers: this.searchForm.get('passengers')?.value,
        date: this.searchForm.get('date')?.value
      }
    });
  }
}
