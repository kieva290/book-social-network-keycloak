import { Component } from '@angular/core';
import {AuthenticationService} from '../../services/services/authentication.service';
import {Router} from '@angular/router';
import {skipUntil} from 'rxjs';
import {NgIf} from '@angular/common';
import {CodeInputModule} from 'angular-code-input';

@Component({
  selector: 'app-activate-account',
  imports: [
    NgIf,
    CodeInputModule
  ],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent {

  message = '';
  isOkay = true;
  submitted = false;
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
  }

  private confirmationAccount(token: string) {
    this.authService.confirm({
      token
    }).subscribe({
      next: () => {
        this.message = 'Your account has been successfully activated.\nNow you can proceed to login';
        this.submitted = true;
        this.isOkay = true;
      },
      error: () => {
        this.message = 'Token has been expired or invalid';
        this.submitted = true;
        this.isOkay = false;
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['login']);
  }

  onCodeCompleted(token: string) {
    this.confirmationAccount(token);
  }

  protected readonly skipUntil = skipUntil;
}
