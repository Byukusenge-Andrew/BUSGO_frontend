import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features = [
    {
      title: 'EASY BOOKING',
      description: 'Book your tickets instantly for all major routes in Rwanda',
      icon: 'fa-ticket'
    },
    {
      title: 'NATIONWIDE COVERAGE',
      description: 'Travel to all provinces and major cities across Rwanda',
      icon: 'fa-map-marker-alt'
    },
    {
      title: '24/7 SERVICE',
      description: 'Round-the-clock customer support in Kinyarwanda, English, and French',
      icon: 'fa-clock'
    }
  ];

  statistics = [
    { value: '30+', label: 'DAILY ROUTES' },
    { value: '5', label: 'PROVINCES COVERED' },
    { value: '50+', label: 'MODERN BUSES' },
    { value: '10K+', label: 'HAPPY TRAVELERS' }
  ];

  services = [
    {
      title: 'KIGALI - MUSANZE',
      description: 'Regular services to the home of mountain gorillas',
      icon: 'fa-route',
      dark: false
    },
    {
      title: 'KIGALI - HUYE',
      description: 'Comfortable travel to Rwanda\'s cultural hub',
      icon: 'fa-sun',
      dark: true
    },
    {
      title: 'KIGALI - RUBAVU',
      description: 'Scenic routes to Lake Kivu\'s beautiful shores',
      icon: 'fa-water',
      dark: false
    }
  ];

}
