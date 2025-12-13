import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
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
    path: 'admin', 
    component: DashboardComponent, // Temporary - will create admin component later
    canActivate: [AuthGuard],
    data: { requiresAdmin: true } // Only allow if logged in AND admin
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
