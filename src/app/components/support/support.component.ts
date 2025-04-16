import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SupportComponent {
  support = {
    message: ''
  };
  supportSuccess = false;

  submitSupport() {
    // Simulate support submission
    this.supportSuccess = true;
    setTimeout(() => this.supportSuccess = false, 2000);
    this.support.message = '';
  }
}
