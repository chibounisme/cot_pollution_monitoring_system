import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  loadingIndicator: HTMLIonLoadingElement;
  registerToast: HTMLIonToastElement;

  constructor(public formBuilder: FormBuilder, public loadingController: LoadingController,
    public toastController: ToastController, private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async submitRegisterForm() {
    this.loadingIndicator = await this.loadingController.create({
      message: 'Loading...'
    });
    this.registerToast = await this.toastController.create({
      duration: 5000
    });

    await this.loadingIndicator.present();

    this.authService.signUp(this.registerForm.value.firstname, this.registerForm.value.lastname,
      this.registerForm.value.username, this.registerForm.value.password,
      this.registerForm.value.email).subscribe(async _ => {
        this.loadingIndicator.dismiss();
        this.registerToast.message = 'Account created successfully!';
        this.registerToast.color = 'success';
        await this.registerToast.present();
        this.router.navigate(['/login']);
      }, async err => {
        this.loadingIndicator.dismiss();
        this.registerToast.message = 'There was a problem while creating the account!';
        this.registerToast.color = 'danger';
        await this.registerToast.present();
        console.log(err);
      });
  }

}
