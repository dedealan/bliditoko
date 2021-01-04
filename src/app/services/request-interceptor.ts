import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

// import { AuthService } from './auth.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor() { };

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // const isAuth = this.authService.isAuth();
    // const authData = this.authService.getAuthData();
    const headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    const request = req.clone({
      // params: (isAuth && req.method === 'GET') ? req.params.append('access_token', authData.access_token) : req.params,
      headers: new HttpHeaders(headers),
      // body: isAuth ? { ...req.body, access_token: authData.access_token } : req.body
    });
    return next.handle(request);
  }
}
