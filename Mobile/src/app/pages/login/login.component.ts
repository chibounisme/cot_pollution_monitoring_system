import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loadingIndicator: HTMLIonLoadingElement;
  loginToast: HTMLIonToastElement;

  constructor(public formBuilder: FormBuilder, public loadingController: LoadingController,
    public toastController: ToastController, private authService: AuthService,
    private router: Router) { }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async submitLoginForm() {
    if(this.loginForm.valid) {
      this.loadingIndicator = await this.loadingController.create({
        message: 'Loading...'
      });
      this.loginToast = await this.toastController.create({
        duration: 2500
      });
  
      await this.loadingIndicator.present();
      this.authService.initAuthService();
      this.authService.preSignIn().subscribe(preSignInData => {
        const signInId = preSignInData.signInId;
        const username = this.loginForm.value.username;
        const password = this.loginForm.value.password;
        this.authService.signIn(signInId, username, password).subscribe(signInData => {
          const authCode = signInData.authCode;
          this.authService.postSignIn(authCode).subscribe(async postSignInData => {
            const accessToken = postSignInData.accessToken;
            const refreshToken = postSignInData.refreshToken;
            this.authService.setTokens(accessToken, refreshToken);
            this.loadingIndicator.dismiss();
            this.loginToast.message = 'Successfully connected!';
            this.loginToast.color = 'success';
            await this.loginToast.present();

            this.authService.activateRunner();
            this.router.navigate(['/station']);
          }, async err => {
            this.loadingIndicator.dismiss();
            this.loginToast.message = 'Login Failed!';
            this.loginToast.color = 'danger';
            await this.loginToast.present();
            console.log(err);
          });
          
          this.loginForm.reset();
        }, async err => {
          this.loadingIndicator.dismiss();
          this.loginToast.message = 'Login Failed!';
          this.loginToast.color = 'danger';
          await this.loginToast.present();
          console.log(err);
          
          this.loginForm.reset();
        });
      }, async err => {
        this.loadingIndicator.dismiss();
        this.loginToast.message = 'Login Failed!';
        this.loginToast.color = 'danger';
        await this.loginToast.present();
        console.log(err);
  
        this.loginForm.reset();
      });
    }
  }
}
