import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  onSubmit() {
    const credentials = {
      username: this.username,
      password: this.password
    };

    if (this.username.length === 0 || this.password.length === 0) {
      return;
    }

    this.http.post<any>('api/auth', credentials).subscribe({
      next: (response) => {
        // Assuming the backend returns a JWT token in the response
        const token = response.token;
    
        // Store the token in local storage
        localStorage.setItem('token', token);
    
        // Redirect or perform any other necessary actions
      },
      error: (error) => {
        if (error.status === 401) {
          alert('Helytelen felhasználónév vagy jelszó!');
        } else if (error.status === 404) {
          alert('A kért állomány nem található!')
        }
        else {
          alert('Egyéb hiba történt!')
          console.error('Hiba történt:', error);
        }
      }
    });
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
