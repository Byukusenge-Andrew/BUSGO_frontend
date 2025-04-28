import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import {AuthService} from '../../services/auth.service';
import {BusService} from '../../services/bus.service';
import {response} from 'express';

interface BusType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-company-add-bus',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],

  templateUrl:'./company-add-bus.component.html',
  styleUrl:'./company-add-bus.component.css'
})
export class CompanyAddBusComponent implements OnInit {
  busForm: FormGroup;
  submitting = false;

  busTypes: BusType[] = [
    {value: 'STANDARD', viewValue: 'Standard'},
    {value: 'PREMIUM', viewValue: 'Premium'},
    {value: 'LUXURY', viewValue: 'Luxury'},
    {value: 'MINI', viewValue: 'Mini Bus'},
    {value: 'DOUBLE_DECKER', viewValue: 'Double Decker'}
  ];

  constructor(
    private authservice:AuthService,
    private router:Router,
    private busService: BusService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.busForm = this.fb.group({
      registrationNumber: ['', Validators.required],
      model: ['', Validators.required],
      busType: ['STANDARD', Validators.required],
      capacity: [45, [Validators.required, Validators.min(1)]],
      hasAC: [false],
      hasWifi: [false],
      hasUSB: [false],
      hasTV: [false],
      hasWater: [false],
      hasBathroom: [false],
      hasRecliningSeats: [false],
      hasLegroom: [false],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  onSubmit(): void {
    if (this.busForm.invalid) return;

    this.submitting = true;

    // Prepare amenities as an array for the backend
    const formValue = this.busForm.value;
    const features = [
      formValue.hasAC ? 'AC' : null,
      formValue.hasWifi ? 'WiFi' : null,
      formValue.hasUSB ? 'USB Charging' : null,
      formValue.hasTV ? 'TV/Entertainment' : null,
      formValue.hasWater ? 'Drinking Water' : null,
      formValue.hasBathroom ? 'Bathroom' : null,
      formValue.hasRecliningSeats ? 'Reclining Seats' : null,
      formValue.hasLegroom ? 'Extra Legroom' : null
    ].filter(features => features !== null);

    const companyId = this.authservice.getCurrentUserId()
    const busData = {
      registrationNumber: formValue.registrationNumber,
      model: formValue.model,
      busType: formValue.busType,
      capacity: formValue.capacity,
      features: features,
      notes: formValue.notes,
      companyId: companyId,
      status: formValue.status || 'ACTIVE'
    };
 console.log("current company Id "+  this.authservice.getCurrentUserId())
    // In a real app, this would send data to a service
    console.log('Submitting bus data:', busData);

    this.busService.addBus(busData).subscribe({
      next: (response)=>{
        this.submitting=false;
        this.snackBar.open("Bus added successfully",'close');
        this.router.navigate(['/company/dashboard']);

      },
      error: error => {
        this.submitting=false;
        console.log("Error adding bus"+error);
        this.snackBar.open("Failed to add bus",'close');
      }
      }

    );


  }
}
