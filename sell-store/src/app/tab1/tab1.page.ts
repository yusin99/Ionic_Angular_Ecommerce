/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';
import { ProductService } from './../services/product.service';
import { ProductModel } from './../Models/product-model';
import { LoadingController, ToastController } from '@ionic/angular';
import { ReadVarExpr } from '@angular/compiler';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  sliderImages: any[] = [
    '/assets/slide1.jpg',
    '/assets/slide2.jpg',
    '/assets/slide3.jpg',
    '/assets/slide4.jpg',
    '/assets/slide5.jpg',
  ];
  sliderOptions = {
    autoplay: {
      delay: 2000,
    },
    loop: true,
  };
  listArrayOfProducts: ProductModel[] = [];
  displayedList: ProductModel[] = [];
  currentPage: number = 1;
  constructor(
    private productService: ProductService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    console.log(this.sliderImages);
  }
  async ngOnInit() {
    const loader = await this.loadingController.create({
      message: 'Getting Products..',
      spinner: 'bubbles',
      animated: true,
    });
    await loader.present().then();
    this.productService.getAllProducts().subscribe(
      async (products: ProductModel[]) => {
        await loader.dismiss().then();
        this.listArrayOfProducts = products;
        this.displayedList = [...this.listArrayOfProducts];
      },
      async (err) => {
        await loader.dismiss().then();
        console.log(err);
      }
    );
  }
  async loadMoreData(e: any) {
    const toast = await this.toastController.create({
      message: 'No more products',
      animated: true,
      duration: 2000,
      buttons: [
        {
          text: 'Done',
          role: 'Cancel',
          icon: 'close',
        },
      ],
    });
    if (e === null) {
      this.currentPage = 1;
    } else {
      this.currentPage++;
      this.productService.getAllProducts(this.currentPage).subscribe(
        async (prods: ProductModel[]) => {
          this.listArrayOfProducts = this.listArrayOfProducts.concat(prods);
          this.displayedList = [...this.listArrayOfProducts];
          if (e !== null) {
            e.target.complete();
          }
          if (prods.length < 10) {
            await toast.present().then();
            // e.target.disabled() = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
}
