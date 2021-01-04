import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { CheckoutService, Cart } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  step: number = 1;
  private cartItemSub: Subscription;
  cartItems: Cart[] = [];
  totalPrice: number = 0;
  totalWeight: number = 0;
  addresses: FormGroup = new FormGroup({
    addressee: new FormControl('', [Validators.required, Validators.minLength(3)]),
    phone_number: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(15), Validators.pattern(/^(62)([0-9])*$/)]),
    address: new FormControl('', [Validators.required, Validators.minLength(5)]),
    city_id: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required, Validators.minLength(3)]),
    province_id: new FormControl('', [Validators.required]),
    province: new FormControl('', [Validators.required, Validators.minLength(3)]),
    postal_code: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]*$/)])
  });
  isAddressInvalid: boolean = false;

  provinces: { option: string | number, value: string | number, selected: boolean }[] = [];
  cities: { option: string | number, value: string | number, selected: boolean }[] = [];

  shippings: any[] = [];

  shippingCost: number = 0;
  shippingCourier: string = null;

  banks: string[] = ['BCA', 'MANDIRI', 'BNI', 'BRI', 'CIMB NIAGA', 'BTPN'];
  selectedBank: string = null;

  constructor(private checkoutService: CheckoutService, private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('Checkout');

    this.step = 1;
    document.addEventListener('DOMContentLoaded', this.closeNotification);

    this.cartItems = this.checkoutService.getCartItems();
    this.getTotal();

    this.cartItemSub = this.checkoutService.getUpdatedCart().subscribe((items) => {
      this.cartItems = items;
      this.getTotal();
    });

    this.checkoutService.getProvince().subscribe(res => {
      this.provinces = res.data.map(data => {
        let option: any = {};
        option.option = data.province;
        option.value = data.province_id;
        option.selected = false;
        return option;
      });
    });
  }

  /**
   * Update total price and weight
   */
  getTotal() {
    let totalPrice = 0;
    let totalWeight = 0;
    if (this.cartItems.length <= 0) {
      this.totalPrice = 0;
      this.totalWeight = 0;
    } else {
      this.cartItems.map(item => {
        totalPrice += (item.qty * item.price);
        totalWeight += item.weight;
        this.totalPrice = totalPrice;
        this.totalWeight = totalWeight;
      });
    }
  }

  /**
   * Next step
   */
  next(page: number): void {
    if (this.step === 1 && page > this.step && this.addresses.invalid) {
      this.isAddressInvalid = true;
      setTimeout(() => {
        this.closeNotification();
      }, 3000);
      return;
    } else if (this.step === 2 && page > this.step && !this.shippingCourier) {
      return;
    } else if (this.step === 3 && page > this.step && !this.selectedBank) {
      return;
    } else {
      this.step = page;
    }

    if (this.step === 2 && this.shippings.length === 0) {
      this.getShippingCost();
    }
  }

  /**
   * Back step
   */
  back(): void {
    this.step -= 1;
  }

  /**
   * Go to Step
   *
   * @param step Step number
   */
  setStep(step: number) {
    this.step = step;
  }

  /**
   * Action when province is changed
   *
   * @param value Selected value
   */
  onProvinceChanged(value: string | number): void {
    this.cities = [];
    if (value !== '') {
      this.checkoutService.getCity(value.toString()).subscribe(res => {
        this.cities = res.data.map(data => {
          let option: any = {};
          option.option = data.type + ' ' + data.city_name;
          option.value = data.city_id;
          option.selected = false;
          return option;
        });
      });
      let province = this.provinces.find(prov => prov.value === value);
      this.addresses.get('province').setValue(province.option);
      this.shippingCourier = null;
      this.shippingCost = null;
      this.shippings = [];
    } else {
      this.addresses.get('province_id').setValue('');
      this.addresses.get('province').setValue('');
    }
  }

  /**
   * Value when city is changed
   *
   * @param value Selected value
   */
  onCityChanged(value: string | number): void {
    if (value !== '' && value !== 'undefined' && value !== null) {
      let citiy = this.cities.find(ct => ct.value === value);
      this.addresses.get('city_id').setValue(citiy.value);
      this.addresses.get('city').setValue(citiy.option);
      this.shippingCourier = null;
      this.shippingCost = null;
      this.shippings = [];
    } else {
      this.addresses.get('city_id').setValue('');
      this.addresses.get('city').setValue('');
    }
  }

  /**
   * Action when shipping selected
   *
   * @param value value of selected shipping
   */
  selectShipping(value: string): void {
    let splitValue = value.split('|');
    this.shippingCourier = splitValue[0];
    this.shippingCost = parseInt(splitValue[1]);
  }

  /**
   * Get shipping cost
   */
  getShippingCost(): void {
    this.checkoutService.getShippingCost(this.addresses.get('city_id').value.toString(), this.totalWeight.toString()).subscribe(res => {
      this.shippings = res.data;
    })
  }

  /**
   * Assign bank
   *
   * @param bank
   */
  selectBank(bank: string): void {
    this.selectedBank = bank;
  }

  /**
   * Close notification
   */
  closeNotification = () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      var $notification = $delete.parentNode;

      $delete.addEventListener('click', () => {
        $notification.parentNode.removeChild($notification);
      });
    });

    this.isAddressInvalid = false;
  }

  ngOnDestroy(): void {
    this.cartItemSub.unsubscribe();
    document.removeEventListener('DOMContentLoaded', this.closeNotification);
  }

}
