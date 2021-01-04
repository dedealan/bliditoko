import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { CheckoutService, Cart } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  totalPrice: number = 0;
  cartItems: Cart[] = [];
  private cartItemSub: Subscription;

  constructor(private checkoutService: CheckoutService, private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('Cart');

    this.cartItems = this.checkoutService.getCartItems();
    this.getTotal();

    this.cartItemSub = this.checkoutService.getUpdatedCart().subscribe((items) => {
      this.cartItems = items;
      this.getTotal();
    });
  }

  /**
   * Update total price
   */
  getTotal() {
    let totalPrice = 0;
    if (this.cartItems.length <= 0) {
      this.totalPrice = 0
    } else {
      this.cartItems.map(item => {
        totalPrice += (item.qty * item.price);
        this.totalPrice = totalPrice;
      });
    }
  }

  /**
   * Update quantity of item or product
   *
   * @param id an id of item or product
   * @param qty new quantity of item or product
   */
  updateQty(id: string, qty: string) {
    this.checkoutService.changeCartQty(id, qty);
  }

  ngOnDestroy(): void {
    this.cartItemSub.unsubscribe();
  }

}
