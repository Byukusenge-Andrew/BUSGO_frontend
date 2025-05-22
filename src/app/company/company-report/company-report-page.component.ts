import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms'; // For ngModel
import { CompanyReportService } from '../../services/company-report.service'; // Adjusted path

@Component({
  selector: 'app-company-report-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './company-report-page.component.html',
  styleUrls: ['./company-report-page.component.scss']
})
export class CompanyReportPageComponent implements OnInit {
  companyIdForReport: number | null = null;
  isLoadingUsersCompaniesReport = false;
  isLoadingCompanySpecificReport = false;

  constructor(private reportService: CompanyReportService) { }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  downloadUsersCompaniesReport(): void {
    this.isLoadingUsersCompaniesReport = true;
    this.reportService.downloadUsersAndCompaniesReport().subscribe({
      next: (blob) => {
        this.triggerDownload(blob, 'users_companies_report.csv');
        this.isLoadingUsersCompaniesReport = false;
      },
      error: (err) => {
        console.error('Error downloading users and companies report:', err);
        // Handle error (e.g., show a notification to the user)
        this.isLoadingUsersCompaniesReport = false;
      }
    });
  }

  downloadCompanySpecificReport(): void {
    if (this.companyIdForReport === null || this.companyIdForReport <= 0) {
      alert('Please enter a valid Company ID.');
      // Or use a more sophisticated notification system
      return;
    }
    this.isLoadingCompanySpecificReport = true;
    // Assuming downloadSpecificCompanyReport is uncommented and implemented in your service
    // based on the provided context for CompanyReportService
    this.reportService.downloadSpecificCompanyReport(this.companyIdForReport).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `company_${this.companyIdForReport}_report.csv`);
        this.isLoadingCompanySpecificReport = false;
      },
      error: (err) => {
        console.error(`Error downloading report for company ${this.companyIdForReport}:`, err);
        // Handle error
        this.isLoadingCompanySpecificReport = false;
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}
