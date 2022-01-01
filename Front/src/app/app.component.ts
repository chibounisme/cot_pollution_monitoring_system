import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Login', url: '/login', icon: 'log-in' },
    { title: 'Register', url: '/register', icon: 'person-add' },
    { title: 'Logout', url: '/logout', icon: 'log-out' },
  ];

  constructor() {}
}
