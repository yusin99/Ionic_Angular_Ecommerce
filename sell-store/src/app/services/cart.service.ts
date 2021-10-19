/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModel } from './../Models/cart-model';
import { Router } from '@angular/router';
import { ProductModel } from './../Models/product-model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  // Local variables
  private serverUrl = environment.backend_api_url;
  private cartDataArray: CartModel = {
    count: 0,
    productData: [],
  };
  private cartData$: BehaviorSubject<CartModel> =
    new BehaviorSubject<CartModel>({ count: 0, productData: [] });
  private totalAmount: number = 0;
  private totalAmount$: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  constructor(
    private httpClient: HttpClient,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private storage: Storage,
    private router: Router
  ) {
    this.storage.create();
    this.totalAmount = 0;
    this.storage.get('cart').then((data) => {
      if (data) {
        this.cartDataArray = data;
        this.cartData$.next(this.cartDataArray);
        // TODO Calculate Total
      }
    });
  }

  async addToCart(product: ProductModel) {
    const loader = await this.loadingController.create({
      message: 'Adding To Cart..',
      animated: true,
      spinner: 'circles',
      backdropDismiss: false,
      showBackdrop: true,
    });

    const alert = await this.alertController.create({
      header: 'Cart Updated',
      buttons: [
        {
          text: 'Continue',
          role: 'cancel',
          cssClass: 'continue',
          handler: () => {
            console.log('Product Added');
          },
        },
        {
          text: 'View Cart',
          cssClass: 'view-cart',
          handler: () => {
            this.router.navigateByUrl('/tabs/tab3').then();
          },
        },
      ],
      animated: true,
      message: 'Product added to cart',
      backdropDismiss: false,
      cssClass: 'add-product',
    });

    const toast = await this.toastController.create({
      message: 'Only 5 allowed in cart',
      header: 'Max Quantity Reached',
      duration: 2000,
      position: 'bottom',
      animated: true,
      color: 'warning',
      buttons: [
        {
          side: 'end',
          role: 'cancel',
          text: 'Ok',
        },
      ],
    });

    await loader.present().then();

    // When the cart is not completely empty
    if (this.cartDataArray.count !== 0) {
      // Calculate Index
      const index = this.cartDataArray.productData.findIndex(
        (p) => p.id === product.id
      );

      // If there is a match, that means the index is not equal to -1

      if (index > -1) {
        // Limit the max purchasable quantity to 5 per product per order
        if (this.cartDataArray.productData[index].in_cart >= 5) {
          this.cartDataArray.productData[index].in_cart = 5;
          this.calculateTotal();
          this.storage.set('cart', { ...this.cartDataArray }).then();
          await loader.dismiss().then();
          await toast.present().then();
        } else {
          this.cartDataArray.productData[index].in_cart += 1;
          this.calculateTotal();
          this.storage.set('cart', { ...this.cartDataArray }).then();
          await loader.dismiss().then();
          await alert.present().then();
        }
        this.cartData$.next(this.cartDataArray);
      }

      // When the product is not in cart array but the cart is not empty
      else {
        this.cartDataArray.productData.push(product);
        const newProductIndex = this.cartDataArray.productData.findIndex(
          (p) => p.id === product.id
        );
        this.cartDataArray.productData[newProductIndex].in_cart = 1;
        this.calculateTotal();
        await loader.dismiss().then();
        await alert.present().then();
        this.cartDataArray.count = this.cartDataArray.productData.length;
        this.storage.set('cart', { ...this.cartDataArray }).then();
        this.cartData$.next(this.cartDataArray);
      }
    }
    // When the cart is absolutely empty
    else {
      this.cartDataArray.productData.push({ ...product, in_cart: 1 });
      this.cartDataArray.count = this.cartDataArray.productData.length;
      this.calculateTotal();
      this.storage.set('cart', { ...this.cartDataArray }).then();
      await loader.dismiss().then();
      await alert.present().then();
      this.cartData$.next(this.cartDataArray);
    }
  }
  removeFromCart(product: ProductModel) {
    this.cartDataArray.productData = this.cartDataArray.productData.filter(
      (p) => p.id !== product.id
    );
    this.cartDataArray.count = this.cartDataArray.productData.length;
    this.calculateTotal();
    this.cartData$.next(this.cartDataArray);
    this.totalAmount$.next(this.totalAmount);
    this.storage.set('cart', { ...this.cartDataArray }).then();
    return this.cartDataArray.productData;
  }
  updateQuantity(indexOfProduct: number, newInCartValue: number) {
    this.cartDataArray.productData[indexOfProduct].in_cart = newInCartValue;
    this.calculateTotal();
    this.storage.set('cart', { ...this.cartDataArray }).then();
    this.cartData$.next(this.cartDataArray);
    this.totalAmount$.next(this.totalAmount);
  }
  private emptyCart() {
    this.cartDataArray = { count: 0, productData: [] };
    this.calculateTotal();
    this.cartData$.next(this.cartDataArray);
  }
  private calculateTotal() {
    this.totalAmount = 0;
    if (this.cartDataArray.productData.length === 0) {
      this.totalAmount = 0;
      this.totalAmount$.next(this.totalAmount);
    } else {
      this.cartDataArray.productData.forEach((p: ProductModel) => {
        this.totalAmount += parseInt(p.price, 10) * p.in_cart;
      });
      this.totalAmount$.next(this.totalAmount);
    }
  }
  get cartData(): Observable<CartModel> {
    return this.cartData$.asObservable();
  }
  get cartTotal(): Observable<number> {
    return this.totalAmount$.asObservable();
  }
}