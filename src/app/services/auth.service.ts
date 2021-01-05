import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated: boolean = false;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Get auth status
   */
  getAuthStatus(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  /**
   * Check if user is authenticated
   */
  isAuth() {
    return this.isAuthenticated;
  }

  /**
   * Continuing session if still loged in
   */
  autoAuth(): void {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.expiresIn(expiresIn);
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
    }
  }

  /**
   * Get auth data from localStorage
   */
  getAuthData(): { access_token: string, expirationDate: Date } {
    const access_token = localStorage.getItem('access_token');
    const expiration = localStorage.getItem('expiration');

    if (!access_token && !expiration) {
      return;
    } else {
      return {
        access_token: access_token,
        expirationDate: new Date(expiration),
      };
    }
  }

  /**
   * Get User Profile
   */
  getUserProfile(): any {
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    return userInfo;
  }

  /**
   * Login account
   *
   * Send parameter to server to get authenticated
   *
   * @param username Account username
   * @param password Account password
   */
  login(username: string, password: string): void {
    const authData = { username: username, password: password };
    this.http
      .post(environment.apiUrl, authData, {
        params: {
          route: 'user/login',
        },
      })
      .subscribe(
        (res: {
          status: boolean;
          access_token: string;
          expired: number;
          error: number;
          message: string;
        }) => {
          if (res.status) {
            const now = new Date();
            const expiresIn = res.expired * 1000 - now.getTime();
            this.expiresIn(expiresIn);
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
            this.saveAuth(res.access_token, new Date(res.expired * 1000));
            this.router.navigate(['/']);
          } else {
            this.isAuthenticated = false;
            this.authStatusListener.next(false);
          }
        }
      );
  }

  /**
   * Logout from app
   */
  logout(): void {
    this.clearAuth();
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Set token expire time
   *
   * @param duration Expire time of access_token
   */
  private expiresIn(duration: number): void {
    setTimeout(() => {
      this.logout();
    }, duration);
  }

  /**
   * Save auth to localStorage
   *
   * @param token acces_token from server
   * @param expirationDate Token expiration date
   */
  private saveAuth(token: string, expirationDate: Date): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  /**
   * Remove auth data from localStorage
   */
  private clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('user_info');
  }

  /**
   * Get user profile
   */
  userProfile(): Observable<{ status: boolean, data: any[] }> {
    return this.http.get<{ status: boolean, data: any[] }>(environment.apiUrl, {
      params: {
        route: 'user/profile'
      }
    })
  }

  /**
   * Save profile to localStorage
   *
   * @param userInfo User data/profile given by server
   */
  saveProfile(userInfo: { status: boolean, data: any[] }): void {
    let profile = JSON.stringify(userInfo.data[0]);
    localStorage.setItem('user_info', profile);
  }
}
