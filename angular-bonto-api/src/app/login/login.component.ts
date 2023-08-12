import { Component } from '@angular/core';
import { AuthenticationService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = "";
  password: string = "";
  emailaddress: string = "";
  usernameInput: boolean = false;
  passwordInput: boolean = false;
  missingLoginDetails: boolean = true;
  activatePasswordResetModal: boolean = false;

  constructor(private auth: AuthenticationService) {}

  onSubmit() {
    const credentials = {
      username: this.username,
      password: this.password,
    };

    if (this.username.length === 0 || this.password.length === 0) {
      return;
    } else if (this.username.length !== 0 && this.password.length !== 0) {
      localStorage.setItem('username', credentials.username);
      this.auth.authenticate(credentials)
    }
    this.missingLoginDetails = true;
  }    

  resetPassword() {
  }

  modalOpen() {
    this.activatePasswordResetModal = true;
  }

  modalClose() {
    this.activatePasswordResetModal = false;
  }

  checkUsernameValue(target: EventTarget | null) {
    const inputElement = target as HTMLInputElement;
    this.usernameInput = inputElement.value.trim().length > 0;
    if (this.usernameInput && this.passwordInput) {
      this.missingLoginDetails = false;
    }
  }
  
  checkPasswordValue(target: EventTarget | null) {
    const inputElement = target as HTMLInputElement;
    this.passwordInput = inputElement.value.trim().length > 0;
    if (this.usernameInput && this.passwordInput) {
      this.missingLoginDetails = false;
    }
  }
}
