import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  loading = true;
  userId = 1; // TODO: Replace with real user ID from auth

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUser(this.userId).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert('Failed to load profile');
      }
    });
  }

  saveProfile() {
    this.userService.updateUser(this.userId, this.profile).subscribe({
      next: () => alert('Profile saved!'),
      error: () => alert('Failed to save profile')
    });
  }
}
