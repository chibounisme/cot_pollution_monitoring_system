import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { FindPathComponent } from './pages/stations/find-path/find-path.component';
import { StationDashboardComponent } from './pages/stations/station-dashboard/station-dashboard.component';
import { StationsComponent } from './pages/stations/stations.component';
import { AuthguardService } from './services/authguard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'station',
    component: StationsComponent,
    canActivate: [AuthguardService]
  },
  {
    path: 'stations/:stationId',
    component: StationDashboardComponent,
    canActivate: [AuthguardService]
  },
  {
    path: 'path',
    component: FindPathComponent,
    canActivate: [AuthguardService]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
