import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  cartItems: Cart[] = [];
  private cartUpdated = new Subject<Cart[]>();

  constructor(private http: HttpClient) { }

  /**
   * Add item to Cart
   *
   * @param item An object with type of Cart
   */
  addToCart(item: Cart): void {
    this.cartItems = this.getSavedCart() ? this.getSavedCart() : this.cartItems;

    const index = this.cartItems.findIndex((itm) => itm.id === item.id);

    if (index === -1) {
      this.cartItems.push(item);
    } else {
      this.cartItems[index].qty += item.qty;
    }

    this.cartUpdated.next([...this.cartItems]);
    this.saveCartItems(this.cartItems);
  }

  /**
   * Get items in cart
   *
   * @returns list of items in Cart
   */
  getCartItems() {
    this.cartItems = this.getSavedCart() ? this.getSavedCart() : this.cartItems;
    return this.cartItems;
  }

  /**
   * Get an Observable updated items in cart
   *
   * @returns an Observable items of Cart
   */
  getUpdatedCart() {
    return this.cartUpdated.asObservable();
  }

  /**
   * Remove item from Cart
   *
   * @param id is an ID of item or product
   */
  removeCartItem(id: string) {
    this.cartItems = this.getSavedCart() ? this.getSavedCart() : this.cartItems;

    this.cartItems = [...this.cartItems.filter(item => item.id !== id)];
    this.cartUpdated.next([...this.cartItems]);
    this.saveCartItems(this.cartItems);
  }

  /**
   * Update quantity of item in cart
   *
   * @param id is an ID of item or product
   * @param qty is the new item quantity
   */
  changeCartQty(id: string, qty: string) {
    this.cartItems = this.getSavedCart() ? this.getSavedCart() : this.cartItems;

    this.cartItems.map(item => {
      if (item.id === id) {
        if (parseInt(qty) == 0 || !parseInt(qty)) {
          this.cartItems = [...this.cartItems.filter(item => item.id !== id)];
        } else {
          item.qty = parseInt(qty) < 0 ? 0 : parseInt(qty);
        }

        if (item.qty <= 0) {
          this.removeCartItem(id);
        }

        this.cartUpdated.next([...this.cartItems]);
      }
    });

    this.saveCartItems(this.cartItems);
  }

  /**
   * Get cart data from localStorage
   *
   * @returns a list of items
   */
  getSavedCart(): Cart[] {
    return JSON.parse(localStorage.getItem('cart'));
  }

  /**
   * Save items in cart to localStorage
   *
   * @param items Items inside cart
   */
  saveCartItems(items: Cart[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
  }

  /**
   * Get Province ID
   *
   * @param provinceId If this parameter not asigned, it will return all available province IDs
   */
  getProvince(provinceId?: string): Observable<any> {
    return this.http.get(environment.apiUrl, {
      params: {
        route: 'shipping/province',
        id: provinceId ? provinceId : ''
      }
    });
  }

  /**
   * Get City ID
   *
   * @param provinceId If this parameter not asigned, it will return all available city IDs
   * @param cityId If this parameter not asigned, it will return all available city IDs based on province ID
   */
  getCity(provinceId?: string, cityId?: string): Observable<any> {
    return this.http.get(environment.apiUrl, {
      params: {
        route: 'shipping/city',
        province: provinceId ? provinceId : '',
        id: cityId ? cityId : ''
      }
    });
  }

  /**
   * Get Shipping Cost
   *
   * @param destination City ID of shipping destination
   * @param weight Total weight
   * @param courier Available courier: jne,tiki,pos
   */
  getShippingCost(destination: string, weight: string, courier?: string): Observable<any> {
    return this.http.get(environment.apiUrl, {
      params: {
        route: 'shipping/cost',
        destination: destination,
        weight: weight,
        courier: courier ? courier : ''
      }
    });
  }

}


/**
 * Interface for Cart items
 */
export interface Cart {
  id: string;
  name: string;
  url: string;
  image: string;
  qty: number;
  price: number;
  weight: number;
}

/**
 * Interface for shipping address
 */
export interface Addresses {
  receiver: string;
  phone_number: string;
  address: string;
  sub_district: string;
  city_id: number;
  city: string;
  province_id: number;
  province: string;
  country: string;
  postal_code: string;
}
