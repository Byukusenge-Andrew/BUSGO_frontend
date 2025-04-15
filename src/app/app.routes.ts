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

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'company/login', component: CompanyLoginComponent },
  { path: 'search', component: BusSearchComponent },
  { path: 'my-bookings', redirectTo: 'dashboard', pathMatch: 'full' },
  // { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: UserDashboardComponent},
  { path: 'routes', component: RoutesComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard],
    canMatch: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
