import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SettingsComponent {
  settings = {
    notifications: 'all',
    password: ''
  };

  saveSettings() {
    // Simulate save
    alert('Settings saved!');
    this.settings.password = '';
  }
}
