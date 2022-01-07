import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public loginPage = { title: 'Login', url: '/login', icon: 'log-in' };
  public stationsPage = {title: 'Stations', url :'/station', icon:'flag' }
  public registerPage = { title: 'Register', url: '/register', icon: 'person-add' };
  public findPathPage = { title: 'Optimal Station Path', url: '/path', icon: 'person-add' };
  public logoutPage = { title: 'Logout', url: '/logout', icon: 'log-out' };


  constructor(public authService: AuthService) {}

  onLogout() {
    this.authService.logout();
  }
}
