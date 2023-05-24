import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BontoApiService {

  readonly bontoAPIUrl = "https://localhost:7094/api";

  constructor(private http:HttpClient) { 
  }

  getAlkatresz(id:number|string):Observable<any>{
    return this.http.get<any>(this.bontoAPIUrl + `/Alkatresz/${id}`)
  }

  getAlkatreszList():Observable<any[]>{
    return this.http.get<any>(this.bontoAPIUrl + '/Alkatresz');
  }

  addAlkatresz(data:any){
    return this.http.post(this.bontoAPIUrl + '/Alkatresz', data);
  }

  updateAlkatresz(id:number|string, data:any){
    return this.http.put(this.bontoAPIUrl + `/Alkatresz/${id}`, data);
  }

  deleteAlkatresz(id:number|string){
    return this.http.delete(this.bontoAPIUrl + `/Alkatresz/${id}`);
  }

  // Kategoriak

  getKategoriaList():Observable<any[]>{
    return this.http.get<any>(this.bontoAPIUrl + '/Kategoria');
  }

  addKategoria(data:any){
    return this.http.post(this.bontoAPIUrl + '/Kategoria', data);
  }

  updateKategoria(id:number|string, data:any){
    return this.http.put(this.bontoAPIUrl + `/Kategoria/${id}`, data);
  }

  deleteKategoria(id:number|string){
    return this.http.delete(this.bontoAPIUrl + `/Kategoria/${id}`);
  }

  // AutoTipus

  getAutoTipusList():Observable<any[]>{
    return this.http.get<any>(this.bontoAPIUrl + '/AutoTipus');
  }

  addAutoTipus(data:any){
    return this.http.post(this.bontoAPIUrl + '/AutoTipus', data);
  }

  updateAutoTipus(id:number|string, data:any){
    return this.http.put(this.bontoAPIUrl + `/AutoTipus/${id}`, data);
  }

  deleteAutoTipus(id:number|string){
    return this.http.delete(this.bontoAPIUrl + `/AutoTipus/${id}`);
  }
  
}