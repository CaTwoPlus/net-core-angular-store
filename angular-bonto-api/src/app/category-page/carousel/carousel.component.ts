import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap'
import { StateChange } from 'ng-lazyload-image';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent { 
  @Input() item: any;
  @Output() loadingSucceeded: EventEmitter<StateChange> = new EventEmitter<StateChange>();
  
  bootstrapModal?: Modal;
  selectedItem: any;
  activeIndexModal = 0;
  activeIndexCarousel = 0;  
  loadedCounts: number[] = [];
  targetModalId = 'viewCarousel';
  @ViewChild('viewCarousel') viewCarouselModal: any; 

  openCarousel() {
    setTimeout(() => {
      const targetModal = document.getElementById(this.targetModalId);
      if (targetModal && !this.bootstrapModal) {
        this.bootstrapModal = new Modal(targetModal);
        this.bootstrapModal.show();
      }
    }, 100);
  }

  modalClose() {
    setTimeout(() => {
      const targetModal = document.getElementById(this.targetModalId);
      if (targetModal) {
        this.selectedItem = null;
        this.bootstrapModal?.dispose();
        this.bootstrapModal = undefined;
        targetModal.remove();
        targetModal.style.display = '';
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'scroll';
        document.body.style.paddingRight = '';
      }
    }, 100);
  }  

  onHover(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    if (event.type === 'mouseenter') {
      target.classList.add('hovered');
    } else {
      target.classList.remove('hovered');
    }
  }

  changeActiveIndex(index: number, carousel: string) {
    if (carousel === 'modal') {
      this.activeIndexModal = index;
    } else if (carousel === 'carousel') {
      this.activeIndexCarousel = index;
    }
  }

  selectItem(item: any) {
    this.selectedItem = item;
    this.openCarousel();
  }

  lazyLoadSpinner(index: number, event: StateChange) {
    if (!this.loadedCounts[index]) {
      this.loadedCounts[index] = 0;
    }
  
    switch (event.reason) {
      case 'start-loading':
        if (this.loadedCounts[index] === 0) {
          // Start loading for a new item
          this.loadedCounts[index] = -1; // Set to -1 to account for the current image being loaded
        }
        break;
  
      case 'loading-succeeded':
        this.loadedCounts[index]++; // Increment loaded count for the item
        if (this.loadedCounts[index] >= this.item.kepek.split(';').length) {
          // All images for the item have loaded
          this.loadedCounts[index] = 0; // Reset loaded count for the next item
        }
        this.loadingSucceeded.emit(event);
        break;
    }
  /*
  console.log('itemId: ', this.item.id);
  console.log('loadedCounts:', this.loadedCounts);
  console.log('totalImages:', this.item.kepek.split(';').length);
  console.log('isItemLoaded:', this.isItemLoaded(index));*/
  }
  
  isItemLoaded(index: number): boolean {
    console.log("isItemLoaded() called");
    return this.loadedCounts[index] === 0;
  } 
}
