import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as hmacsha256 from 'crypto-js/hmac-sha256';
import * as Base64 from 'crypto-js/enc-base64';
import { Storage } from '@ionic/storage-angular';

import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { LocalNotifications } from '@capacitor/local-notifications';
import { StationsService } from './stations.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper: JwtHelperService;

  backendUrl: string = environment.backendUrl;
  sha256Secret: string = environment.sha265Secret;

  // for showing notifications
  notificationRunner = null;

  // pre-signin
  codeVerifier: string;
  codeChallenge: string;
  clientId: string;

  // signin
  preAuthorization: string;
  signInId: string;

  // post-signin
  authCode: string;
  postAuthorization: string;
  authToken: string;

  authState = new BehaviorSubject(false);

  constructor(public toastController: ToastController, private storage: Storage, private http: HttpClient, private router: Router, private stationServices: StationsService) {
    this.jwtHelper = new JwtHelperService();
    this.init();
  }

  async init() {
    await this.storage.create();
    await this.storage.clear();
  }

  public set(key: string, value: any) {
    this.storage?.set(key, value);
  }

  public get(key: string) {
    return this.storage?.get(key);
  }

  initAuthService() {
    this.codeVerifier = v4();
    this.codeChallenge = Base64.stringify(hmacsha256(this.codeVerifier, this.sha256Secret));
    this.clientId = v4();
  }

  preSignIn() {
    this.preAuthorization = 'Bearer ' + btoa(this.clientId + ':' + this.codeChallenge);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return this.http.post<any>(`${this.backendUrl}/authorize`, null, { headers: { 'Pre-Authorization': this.preAuthorization } });
  }

  signIn(signInId, username, password) {
    this.signInId = signInId;
    return this.http.post<any>(`${this.backendUrl}/authenticate`, {
      signInId,
      username,
      password
    });
  }

  postSignIn(authCode) {
    this.authCode = authCode;
    this.postAuthorization = 'Bearer ' + btoa(this.authCode + ':' + this.codeVerifier);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return this.http.post<any>(`${this.backendUrl}/oauth/token`, null, { headers: { 'Post-Authorization': this.postAuthorization } });
  }

  setTokens(accessToken, refreshToken) {
    this.set('accessToken', accessToken);
    this.set('refreshToken', refreshToken);
    this.authToken = accessToken;
    this.setUserId(accessToken);
    this.authState.next(true);
  }

  setUserId(accessToken) {
    const accessTokenPayload = this.jwtHelper.decodeToken(accessToken);
    this.set('connectedUserId', accessTokenPayload.id);
  }

  async getUserId() {
    return await this.get('connectedUserId');
  }

  logout() {
    this.storage.clear().then(() => {
      this.router.navigate(['login']);
      this.authState.next(false);
    });

    clearInterval(this.notificationRunner);
  }

  signUp(firstname, lastname, username, password, email) {
    return this.http.post<any>(`${this.backendUrl}/signup`, {
      firstname, lastname, username, password, email
    });
  }

  isAuthenticated() {
    return this.authState.value;
  }

  getAccessToken() {
    return this.authToken;
  }

  activateRunner() {
    setInterval(() => {
      this.stationServices.getUserStations().subscribe(stations => {
        for (let station of stations) {
          {
            
          }
        }
      });
    }, 5000);
  }
}
