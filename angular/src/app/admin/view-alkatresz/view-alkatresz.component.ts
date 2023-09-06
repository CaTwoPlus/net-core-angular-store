import { Component, Input } from '@angular/core';
import { prodEnvironment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-view-alkatresz',
  templateUrl: './view-alkatresz.component.html',
  styleUrls: ['./view-alkatresz.component.css']
})
export class ViewAlkatreszComponent { 
  @Input() alkatresz: any;

  constructor() {}

  activateImageGallery: boolean = false;
  baseUrl: string = prodEnvironment.baseUrl;
  imgUrl: string = this.baseUrl + "/images/";

  onHover(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    if (event.type === 'mouseenter') {
      target.classList.add('hovered');
    } else {
      target.classList.remove('hovered');
    }
  }

  openCarousel() {
    this.activateImageGallery = true;
  }
  
  closeCarousel() {
    this.activateImageGallery = false;
  }
}