import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sort-modal',
  templateUrl: './sort-modal.component.html',
  styleUrls: ['./sort-modal.component.scss'],
})
export class SortModalComponent implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}
  closeModal() {
    this.modalController.dismiss(null, 'cancel').then();
  }
  radioChanged(event) {
    this.modalController.dismiss(event.target.value, 'sort').then();
  }
}
