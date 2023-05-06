import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewAlkatreszService {

  private selectedId!: number;

  constructor() { }

  setSelectedId(id: number) {
    this.selectedId = id;
  }

  getSelectedId() {
    return this.selectedId;
  }
}
