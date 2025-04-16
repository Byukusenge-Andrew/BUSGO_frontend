import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminRoutesComponent } from './components/admin-routes/admin-routes.component';
import { AdminCompaniesComponent } from './components/admin-companies/admin-companies.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';

const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'routes', component: AdminRoutesComponent },
  { path: 'companies', component: AdminCompaniesComponent },
  { path: 'users', component: AdminUsersComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes)
  ],
  exports: [RouterModule]
})
export class AdminModule { }
