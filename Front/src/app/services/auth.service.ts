import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as hmacsha256 from 'crypto-js/hmac-sha256';
import * as Base64 from 'crypto-js/enc-base64';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper: JwtHelperService;

  backendUrl: string = environment.backendUrl;
  sha256Secret: string = environment.sha265Secret;

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
  accessToken: string;
  refreshToken: string;

  connectedUserId: string;

  constructor(private http: HttpClient) {
    this.jwtHelper = new JwtHelperService();
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
    console.log(this.authCode, this.codeVerifier);
    this.postAuthorization = 'Bearer ' + btoa(this.authCode + ':' + this.codeVerifier);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return this.http.post<any>(`${this.backendUrl}/oauth/token`, null, { headers: { 'Post-Authorization': this.postAuthorization } });
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.setUserId(this.accessToken);
  }

  setUserId(accessToken) {
    const accessTokenPayload = this.jwtHelper.decodeToken(accessToken);
    this.connectedUserId = accessTokenPayload.id;
  }
}
