import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewAlkatreszService {

  private selectedId!: number;
  private selectedKepek!: string;
  private alkatresz$!: Observable<any>;

  constructor() { }

  setSelectedId(id: number) {
    this.selectedId = id;
  }

  getSelectedId() {
    return this.selectedId;
  }

  setImages(kepek: string) {
    this.selectedKepek = kepek;
  }

  getImages() {
    return this.selectedKepek;
  }

  setAlkatresz(alkatreszInput: Observable<any>) {
    this.alkatresz$ = alkatreszInput;
  }

  getAlkatresz() {
    return this.alkatresz$;
  }
}
