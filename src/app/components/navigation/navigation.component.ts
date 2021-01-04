import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Cart, CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  cartItems: Cart[] = [];
  totalQty: number = 0;
  totalQtyDisplay: string = '0';
  private cartItemSub: Subscription;

  constructor(private checkoutService: CheckoutService) { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', this.togleButton);

    this.cartItems = this.checkoutService.getCartItems();
    this.getTotalQty();

    this.cartItemSub = this.checkoutService.getUpdatedCart().subscribe((items) => {
      this.cartItems = items;
      this.getTotalQty();
    });
  }

  /**
   * Togle navigation menu
   */
  togleButton = () => {
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
      $navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {
          const target = el.dataset.target;
          const $target = document.getElementById(target);
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
        });
      });
    }
  }



  /**
   * Update total quantity in cart
   * Update display item in cart count
   */
  getTotalQty() {
    let totalQty = 0;
    if (this.cartItems.length <= 0) {
      this.totalQty = totalQty;
      this.totalQtyDisplay = totalQty.toString();
    } else {
      this.cartItems.map(item => {
        totalQty += item.qty
        this.totalQty = totalQty;

        if (totalQty > 9) {
          this.totalQtyDisplay = '9+';
        } else {
          this.totalQtyDisplay = totalQty.toString();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cartItemSub.unsubscribe();
    document.removeEventListener('DOMContentLoaded', this.togleButton);
  }

}
