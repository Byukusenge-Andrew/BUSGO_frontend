import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BusBookingService } from '../../services/bus-booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bus-search.component.html',
  styleUrls: ['./bus-search.component.scss']
})
export class BusSearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: any[] = [];
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private busBookingService: BusBookingService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      from: [''],
      to: [''],
      date: [''],
      passengers: [1]
    });
  }

  ngOnInit() {
    // Load initial search results if needed
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.loading = true;
      this.busBookingService.searchBuses(this.searchForm.value).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching buses:', error);
          this.loading = false;
        }
      });
    }
  }

  viewBusDetails(busId: number) {
    this.router.navigate(['/bus-details', busId]);
  }
}
