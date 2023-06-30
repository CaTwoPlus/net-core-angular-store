import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap'

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent { 
  @Input() item: any;
  activateCarousel: boolean = false;
  @ViewChild('viewCarousel') viewCarouselModal: any;

  openCarousel(targetModalId: string) {
    setTimeout(() => {
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        const bootstrapModal = new Modal(targetModal);
        bootstrapModal.show();
      }
      this.activateCarousel = true;
    }, 100);
  }

  modalClose() {
    const targetModal = document.getElementById('viewCarousel');
    if (targetModal) {
      const bootstrapModal = new Modal(targetModal);
      bootstrapModal.hide();
    }
    this.activateCarousel = false;
  }  

  onHover(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    if (event.type === 'mouseenter') {
      target.classList.add('hovered');
    } else {
      target.classList.remove('hovered');
    }
  }
}
