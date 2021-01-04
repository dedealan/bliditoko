import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  total_data: number = 0;
  query: string = '';
  limit: number = 12;
  offset: number = 0;
  hasNext: boolean = false;
  isLoading: boolean = false;
  products: any[] = [];

  constructor(private title: Title, private productService: ProductService) { }

  ngOnInit(): void {
    this.title.setTitle('Home');
    this.getProducts();
    window.addEventListener('scroll', this.scroll, true);
  }

  /**
   * Update list of products
   */
  getProducts(): void {
    this.isLoading = true;
    this.productService.searchProducts(this.query, this.offset.toString(), this.limit.toString()).subscribe(res => {
      this.products = [...this.products, ...res.data];
      this.hasNext = res.hasNext;
      this.isLoading = false;
      this.offset = this.offset + this.limit;
    });
  }

  /**
   * Check if scroll has reach the bottom of page
   *
   * @returns boolean
   */
  isBottomReached(): boolean {
    let wrapper = document.getElementById('productSection');
    let content = document.getElementById('productContainer');
    if (wrapper.scrollTop + wrapper.offsetHeight + 100 > content.offsetHeight) {
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scroll, true);
  }

  /**
   * Infinitive scroll
   *
   * Update products if page at bottom of page
   */
  scroll = (event: Event): void => {
    if (this.isBottomReached() && this.hasNext && !this.isLoading) {
      this.isLoading = true;
      this.hasNext = false;
      this.getProducts();
    }
  };
}
