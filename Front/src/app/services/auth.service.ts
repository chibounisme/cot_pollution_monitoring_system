import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import hmacsha256 from 'crypto-js/hmac-sha256';
import { v4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import Base64 from 'crypto-js/enc-base64';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  backendUrl: string = environment.backendUrl;
  sha256Secret: string = environment.sha265Secret;

  // pre-signin
  codeVerifier: string;
  codeChallenge: string;
  clientId: string;

  // signin
  preAuthorization: string;

  // post-signin
  postAuthorization: string;
  accessToken: string;
  refreshToken: string;

  connectedUserId: string;

  constructor(private http: HttpClient) { }

  initAuthService() {
    this.codeVerifier = v4();
    this.codeChallenge = Base64.stringify(hmacsha256(this.codeVerifier, this.sha256Secret));
    this.clientId = v4();
  }

  preSignIn() {
    this.preAuthorization = 'Bearer ' + btoa(this.clientId + ':' + this.codeChallenge);

    return this.http.post<any>(`${this.backendUrl}/authorize`, null);
  }

  signIn() {

  }

  postSignIn() {

  }
}
