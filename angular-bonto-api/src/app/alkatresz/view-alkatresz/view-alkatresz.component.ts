import { Component, OnInit, } from '@angular/core';
import { Observable } from "rxjs";
import { BontoApiService } from 'src/app/bonto-api.service';
import { ViewAlkatreszService } from "src/app/view-alkatresz.service";

@Component({
  selector: 'app-view-alkatresz',
  templateUrl: './view-alkatresz.component.html',
  styleUrls: ['./view-alkatresz.component.css']
})
export class ViewAlkatreszComponent implements OnInit{

  alkatresz$!:Observable<any>;
  selectedId: number = 0;
  selectedImage: string | null = null;

  constructor(private service: BontoApiService, private ViewAlkatresz: ViewAlkatreszService,) {}

  ngOnInit(): void {
    this.selectedId = this.ViewAlkatresz.getSelectedId();
    this.alkatresz$ = this.service.getAlkatresz(this.selectedId);
  }

  onHover(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    if (event.type === 'mouseenter') {
      target.classList.add('hovered');
    } else {
      target.classList.remove('hovered');
    }
  }

  showImage(imgUrl: string, $event: any) {
    $event.preventDefault(); // Prevents the default action of the click event
    this.selectedImage = imgUrl;
  }
}