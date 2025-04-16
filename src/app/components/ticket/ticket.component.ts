import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class TicketComponent implements OnInit {
  ticket: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // Simulate fetch ticket by id
    setTimeout(() => {
      this.ticket = {
        id,
        route: { source: 'City A', destination: 'City B' },
        travelDate: new Date(),
        travelTime: '10:00 AM',
        seats: 2,
        status: 'CONFIRMED'
      };
    }, 500);
  }
}
