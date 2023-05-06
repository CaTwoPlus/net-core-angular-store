import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, concatAll, concatMap, forkJoin, from, map, reduce, switchMap, take, tap, toArray } from 'rxjs';

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

  getImageUrlList(kategoriak: string, nev: string): Observable<string[]> {
    const kategoriakArr = kategoriak.toLowerCase().split(';');
    const nevToMatch = nev.toLowerCase();
  
    const kategoriaList$ = this.getKategoriaList().pipe(
      map(kategoriaList => kategoriaList.map(k => k.nev.toLowerCase()))
    );
  
    const autoTipusList$ = this.getAutoTipusList().pipe(
      map(autoTipusList => autoTipusList.map(a => a.nev.toLowerCase()))
    );
  
    return combineLatest([kategoriaList$, autoTipusList$]).pipe(
      map(([kategoriaList, autoTipusList]) => {
        const kategoria = kategoriaList.find(k => kategoriakArr.includes(k));
        const autoTipus = autoTipusList.find(a => kategoriakArr.includes(a));
        const params = new HttpParams()
          .set('fájlNév', nev)
          .set('kategoria', kategoria || '')
          .set('autoTipus', autoTipus || '');
        return `${this.bontoAPIUrl}/Media?${params.toString()}`;
      }),
      switchMap(url => this.http.get<{ path: string }>(url)),
      map(response => [response.path]),
      map(urls => urls.filter(url => {
      const filename = url.split('/').pop()?.toLowerCase().replace(/\s\s+/g, ' ');
      const regex = new RegExp(`^${filename?.split('.').at(0)}\\w*`, 'i');
      return nevToMatch.match(regex) !== null;
    }))
    );
  }
}