import { Component, OnInit } from '@angular/core';
import { Title, Meta, MetaDefinition, DomSanitizer } from '@angular/platform-browser';

import { ProductService } from 'src/app/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

import { Cart, CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  isLoading: boolean = false;
  metaTags: MetaDefinition[];
  product: any;
  productId: string;
  productUrl: string;
  selectedImage: string;
  productToCart: Cart;
  orderQty: number = 1;

  constructor(private title: Title, private meta: Meta, private productService: ProductService, private router: Router, private activatedRoute: ActivatedRoute, private checkoutService: CheckoutService) { }

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id');
    this.productUrl = this.activatedRoute.snapshot.paramMap.get('url');
    this.getDetails(this.productId, this.productUrl);
  }

  getDetails(id: string, url: string): void {
    this.isLoading = true;
    this.productService.productDetail(id, url).subscribe(res => {
      this.isLoading = false;
      this.product = res.data;
      this.selectedImage = this.product.images[0];

      this.title.setTitle(this.product.name + ' | ' + environment.appTitle);

      this.metaTags = [
        {
          property: 'og:title',
          content: this.product.name
        },
        {
          property: 'og:url',
          content: this.router.url
        },
        {
          property: 'og:image',
          content: this.product.images[0]
        },
        {
          property: 'og:description',
          content: this.product.description.substr(0, 50)
        },
        {
          property: 'og:site_name',
          content: environment.appTitle
        }
      ];

      this.meta.addTags(this.metaTags);
    });
  }

  /**
   * Select image preview
   *
   * @param url url of image to change current preview of image
   */
  selectImage(url: string): void {
    this.selectedImage = url;
  }

  /**
   * Add product to cart
   *
   * @param product An object of product
   */
  addToCart(product: any) {
    this.productToCart = {
      id: product.id,
      name: product.name,
      url: product.url,
      image: product.images[0],
      price: product.price,
      qty: this.orderQty,
      weight: product.weight
    }

    this.checkoutService.addToCart(this.productToCart);
  }
}
