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
    this.authService.preSignIn().subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    });
  }
}
