import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { BusSearchComponent } from './components/bus-search/bus-search.component';
import { ScheduleSearchComponent } from './components/schedule-search/schedule-search.component';
import { ScheduleBookingComponent } from './components/schedule-booking/schedule-booking.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';
import { CompanyLoginComponent } from './components/company-login/company-login.component';
import { authGuard } from './guards/auth.guard';
import { RoutesComponent } from './components/routes/routes.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { adminGuard } from './guards/admin.guard';
import {companyGuard} from './guards/company.guard';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SupportComponent } from './components/support/support.component';
import { TicketComponent } from './components/ticket/ticket.component';

import { MyBookingsComponent } from './components/my-bookings/my-bookings.component';

import { CompanyDashboardComponent } from './components/company-dashboard/company-dashboard.component';
import { CompanyRoutesComponent } from './components/company-routes/company-routes.component';
import { CompanyProfileComponent } from './components/company-profile/company-profile.component';
import { CompanySchedulesComponent } from './components/company-schedules/company-schedules.component';
import { CompanyTicketsComponent } from './components/company-tickets/company-tickets.component';
import { CompanySettingsComponent } from './components/company-settings/company-settings.component';
import { CompanySupportComponent } from './components/company-support/company-support.component';
import { CompanyPaymentPage } from './pages/company-payment/company-payment.page';
import { CompanyAddBusComponent } from './components/company-add-bus/company-add-bus.component';
import { CompanyAddRouteComponent } from './components/company-add-route/company-add-route.component';
import { CompanyAddTicketComponent } from './components/company-add-ticket/company-add-ticket.component';

import {CompanyRegisterComponent} from './components/company-register/company-register.component';
import {ticketGuard} from './guards/ticket.guard';
import {userGuard} from './guards/user.guard';
import {ViewLocationsComponent} from './components/company-location/company-location';
import {AddLocationComponent} from './components/company-location/company-add-location/company-add-location';
import {CompanyBusesComponent} from './components/company-busses/company-busses.component';
import {CompanyBusBookingsComponent} from './components/company-booking/company-bus-bookings.component';
import {UserPaymentComponent} from './components/payment/payment.component';
import {ResetPasswordComponent} from './components/auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'company/login', component: CompanyLoginComponent },
  {path: 'company/register', component: CompanyRegisterComponent },
  {path:'forgot-password',component:ResetPasswordComponent},
  { path: 'search', component: BusSearchComponent },
  { path: 'schedule-search', component: ScheduleSearchComponent },
  { path: 'schedule-booking/:id', component: ScheduleBookingComponent,canActivate:[authGuard] },
  { path: 'booking-confirmation/:id', component: BookingConfirmationComponent },
  { path: 'ticket/:id', component: TicketComponent,canActivate:[authGuard] },
  { path: 'admin/login', component: AdminLoginComponent },

  // Company-protected routes
  { path: 'company/dashboard', component: CompanyDashboardComponent,
     canActivate: [companyGuard] },
  { path: 'company/routes', component: CompanyRoutesComponent,
    canActivate: [companyGuard] },
  { path: 'company/routes/add', component: CompanyAddRouteComponent, canActivate: [companyGuard] },
  {path:'company/buses',component:CompanyBusesComponent,canActivate:[companyGuard] },
  { path: 'company/buses/add', component: CompanyAddBusComponent, canActivate: [companyGuard] },
  { path: 'company/schedules', component: CompanySchedulesComponent, canActivate: [companyGuard] },
  { path: 'company/tickets', component: CompanyTicketsComponent, canActivate: [companyGuard] },
  {path:'company/booking',component: CompanyBusBookingsComponent,canActivate:[companyGuard]},
  {path:'company/location',component:ViewLocationsComponent,canActivate:[companyGuard]},
  {path:'company/location/add',component:AddLocationComponent,canActivate:[companyGuard]},
  { path: 'company/tickets/add', component: CompanyAddTicketComponent, canActivate: [companyGuard] },
  { path: 'company/settings', component: CompanySettingsComponent, canActivate: [companyGuard] },
  { path: 'company/support', component: CompanySupportComponent, canActivate: [companyGuard] },
  { path: 'company/payment', component: CompanyPaymentPage, canActivate: [companyGuard] },
  { path: 'company/profile', component: CompanyProfileComponent, canActivate: [companyGuard] },

  // Admin-protected routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
    ]
  },

  // User-protected routes
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [userGuard] },
  { path: 'routes', component: RoutesComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: 'settings', component: SettingsComponent,canActivate:[userGuard] },
  { path: 'support', component: SupportComponent,canActivate:[userGuard] },
  {
    path: 'payment/:id', // Add the :id parameter
    component: UserPaymentComponent,
    canActivate: [userGuard]
  },
  { path: 'my-bookings', component: MyBookingsComponent,canActivate:[userGuard] },
  { path: '**', redirectTo: '' }
];
