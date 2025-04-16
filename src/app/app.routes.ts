import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { BusSearchComponent } from './components/bus-search/bus-search.component';
import { CompanyLoginComponent } from './components/company-login/company-login.component';
import { authGuard } from './guards/auth.guard';
import { RoutesComponent } from './components/routes/routes.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { adminGuard } from './guards/admin.guard';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SupportComponent } from './components/support/support.component';
import { TicketComponent } from './components/ticket/ticket.component';

import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CompanyDashboardComponent } from './components/company-dashboard/company-dashboard.component';
import { CompanyRoutesComponent } from './components/company-routes/company-routes.component';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';
import { CompanySchedulesComponent } from './components/company-schedules/company-schedules.component';
import { CompanyTicketsComponent } from './components/company-tickets/company-tickets.component';
import { CompanySettingsComponent } from './components/company-settings/company-settings.component';
import { CompanySupportComponent } from './components/company-support/company-support.component';
import { CompanyPaymentPage } from './pages/company-payment/company-payment.page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'company/login', component: CompanyLoginComponent },
  { path: 'search', component: BusSearchComponent },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'ticket/:id', component: TicketComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'support', component: SupportComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  // Company-protected routes
  { path:'company/dashboard', component: CompanyDashboardComponent, canActivate: [authGuard] },
  { path:'company/routes', component: CompanyRoutesComponent, canActivate: [authGuard] },
  { path:'company/schedules', component: CompanySchedulesComponent, canActivate: [authGuard] },
  { path:'company/tickets', component: CompanyTicketsComponent, canActivate: [authGuard] },
  { path:'company/settings', component: CompanySettingsComponent, canActivate: [authGuard] },
  { path:'company/support', component: CompanySupportComponent, canActivate: [authGuard] },
  { path:'company/payment', component: CompanyPaymentPage, canActivate: [authGuard] },
  { path:'company/profile', component: CompanyProfileComponent, canActivate: [authGuard] },
  // Admin-protected module
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  // User-protected routes
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'routes', component: RoutesComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
