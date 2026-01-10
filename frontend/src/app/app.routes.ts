import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { ErrorComponent } from './components/error/error.component';
import { AuthGuard, GuestGuard } from './services/route.guards';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard] // Only allow if NOT logged in
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard] // Only allow if NOT logged in
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]   // Only allow if logged in
  },
  { 
    path: 'profile/:username', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]   // Only allow if logged in
  },
  { 
    path: 'users', 
    component: UserSearchComponent,
    canActivate: [AuthGuard]   // Only allow if logged in
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { requiresAdmin: true } // Only allow if logged in AND admin
  },
  {
    path: 'error',
    component: ErrorComponent
  },
  { 
    path: '**', 
    component: ErrorComponent,
    data: { code: 404 }
  }
];
