import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusRouteService } from '../../services/bus-route.service';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {
  routes: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  filteredRoutes: any[] = [];

  constructor(private routeService: BusRouteService) {}

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    this.loading = true;
    this.routeService.getRoutes().subscribe({
      next: (routes) => {
        this.routes = routes;
        this.filteredRoutes = routes;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load routes. Please try again later.';
        this.loading = false;
      }
    });
  }

  searchRoutes() {
    if (!this.searchTerm) {
      this.filteredRoutes = this.routes;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRoutes = this.routes.filter(route =>
      route.origin.toLowerCase().includes(term) ||
      route.destination.toLowerCase().includes(term) ||
      route.routeNumber.toLowerCase().includes(term)
    );
  }

  formatTime(time: string): string {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }
}
