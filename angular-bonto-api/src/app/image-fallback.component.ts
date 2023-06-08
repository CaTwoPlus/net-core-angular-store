import { Directive, Input, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: 'img[appImgFallback]'
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string | undefined;
  private fallbackLoaded = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('error')
  handleImageError() {
    if (!this.fallbackLoaded) {
      const element: HTMLImageElement = this.eRef.nativeElement;
      element.src = this.appImgFallback || 'https://localhost:7094/images/placeholder.png';
      this.fallbackLoaded = true;
    }
  }
}
