import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { JwtInterceptor } from './services/jwt.interceptor';
import { StationsComponent } from './pages/stations/stations.component';
import { StationDashboardComponent } from './pages/stations/station-dashboard/station-dashboard.component';
import { FindPathComponent } from './pages/stations/find-path/find-path.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, RegisterComponent, StationsComponent, StationDashboardComponent, FindPathComponent],
  entryComponents: [],
  imports: [BrowserModule, CommonModule, IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [{
    provide: RouteReuseStrategy,
    useClass: IonicRouteStrategy
  }, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },],
  bootstrap: [AppComponent],
})
export class AppModule { }
