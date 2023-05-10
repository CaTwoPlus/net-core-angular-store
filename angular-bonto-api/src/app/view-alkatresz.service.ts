import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewAlkatreszService {

  private selectedId!: number;
  private selectedKepek!: string;

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
}
