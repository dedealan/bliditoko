import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  userAuthenticated: boolean = false;
  private authStatusSub: Subscription;

  constructor(private authService: AuthService, private router: Router, private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('Login | ' + environment.appTitle);

    this.userAuthenticated = this.authService.isAuth();

    this.authStatusSub = this.authService.getAuthStatus().subscribe(isAuth => {
      this.isLoading = false;
      this.userAuthenticated = isAuth;
    });

    if (this.userAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Login action
   *
   * @param form Login form parameters
   */
  onLogin(form: NgForm) {
    this.isLoading = true;
    if (form.invalid) {
      this.isLoading = false;
      return;
    }

    this.authService.login(form.value.username, form.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
