import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent {
  title = 'ford';
  navbarfixed: boolean = false;
  /*@HostListener('window:scroll', ['$event']) onscroll() {
    if (window.scrollY > 100) {
      this.navbarfixed = true
    }
    else {
      this.navbarfixed = false
    }
  }*/
  viewtype: boolean = false;   
  @HostListener('window:resize', ['$event']) onresize() {
    if (window.innerWidth < 768) {
      this.viewtype = true
    }
    else {
      this.viewtype = false
    }
  }
}
