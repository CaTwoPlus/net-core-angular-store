import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Modal } from 'bootstrap'
import { StateChange } from 'ng-lazyload-image';
import Panzoom from '@panzoom/panzoom';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent { 
  @Input() item: any;
  @Output() loadingSucceeded: EventEmitter<StateChange> = new EventEmitter<StateChange>();
  @ViewChild('viewCarousel') viewCarouselModal: any; 

  constructor(private breakpointObserver: BreakpointObserver) { }

  bootstrapModal?: Modal;
  selectedItem: any;
  viewer: any;
  activeIndexModal = 0;
  activeIndexCarousel = 0;  
  loadedCounts: number[] = [];
  targetModalId = 'viewCarousel';
  carouselImages = document.getElementsByClassName('carousel-img');
  elem : any;
  panzoom: any[] = [];
  startScale: any;

  openCarousel() {
    setTimeout(() => {
      const targetModal = document.getElementById(this.targetModalId);
      if (targetModal && !this.bootstrapModal) {
        this.bootstrapModal = new Modal(targetModal);
        this.bootstrapModal.show();
        for (let i = 0; i < this.carouselImages.length; i++) {
          this.elem = this.carouselImages[i] as HTMLImageElement;
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          this.startScale = this.breakpointObserver.isMatched('(min-width: 1024px)') ? 0.5 * (viewportWidth / viewportHeight) : 1;
          this.panzoom[i] = Panzoom(this.elem, {
            startScale: this.startScale,
            maxScale: 2,
            minScale: 0.8,
            disablePan: this.breakpointObserver.isMatched('(min-width: 1024px)'),
            disableZoom: this.breakpointObserver.isMatched('(min-width: 1024px)'),
            cursor: this.breakpointObserver.isMatched('(min-width: 1024px)') ? 'default' : 'move',
          });
          if (this.elem.parentElement) {
            this.elem.parentElement.addEventListener('wheel', this.panzoom[i].zoomWithWheel);
          }
        }}
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

  resetPanZoom() {
    for (let i = 0; i < this.carouselImages.length; i++) {
      this.panzoom[i].reset();
    }
  }

  changeActiveIndex(index: number, carousel: string) {
    if (carousel === 'modal') {
      this.activeIndexModal = index;
      const clickedButton = document.activeElement as HTMLButtonElement;
      clickedButton.blur();
      if (!this.breakpointObserver.isMatched('(min-width: 1024px)')) {
        this.resetPanZoom();
      }
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
  }
  
  isItemLoaded(index: number): boolean {
    return this.loadedCounts[index] === 0;
  } 
}
