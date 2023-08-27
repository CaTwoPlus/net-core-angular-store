import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewAlkatreszService {

  private selectedId!: number;
  private selectedKepek!: string;
  viewAlkatresz$!: Observable<any[]>;

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

  setViewAlkatresz(alkatreszInput: Observable<any>) {
    this.viewAlkatresz$ = alkatreszInput;
  }
}
