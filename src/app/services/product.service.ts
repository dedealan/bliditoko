import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  searchProducts(q?: string, offset?: string, limit?: string): Observable<any> {
    return this.http.get(environment.apiUrl, {
      params: {
        route: 'product/list',
        q: q && q !== 'undefined' ? q : '',
        offset: offset && offset !== 'undefined' ? offset :  '0',
        limit: limit && limit !== 'undefined' ? limit : '12'
      }
    });
  }

  productDetail(id: string, url: string): Observable<any> {
    return this.http.get(environment.apiUrl, {
      params: {
        route: 'product/details',
        id: id,
        url: url
      }
    });
  }
}
