import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loadingIndicator: HTMLIonLoadingElement;

  constructor(public formBuilder: FormBuilder, public loadingController: LoadingController, private authService: AuthService) { }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.loadingIndicator = await this.loadingController.create({
      message: 'Loading...'
    });
  }

  async submitLoginForm() {
    await this.loadingIndicator.present();
    this.authService.initAuthService();
    this.authService.preSignIn().subscribe(preSignInData => {
      console.log(preSignInData);
      const signInId = preSignInData.signInId;
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;
      this.authService.signIn(signInId, username, password).subscribe(signInData => {
        console.log(signInData);
        const authCode = signInData.authCode;
        this.authService.postSignIn(authCode).subscribe(postSignInData => {
          const accessToken = postSignInData.accessToken;
          const refreshToken = postSignInData.refreshToken;
          this.authService.setTokens(accessToken, refreshToken);
          this.loadingIndicator.dismiss();
        }, err => {
          console.log('third step');
          console.log(err);
        });
      }, err => {
        console.log('second step');
        console.log(err);
      });
    }, err => {
      console.log('first step');
      console.log(err);
    });
  }
}
