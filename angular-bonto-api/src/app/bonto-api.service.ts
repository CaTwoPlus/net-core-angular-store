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

  // Search logic
  
  searchAlkatreszByFilter(filter: string): Observable<any[]> {
    const params = new HttpParams().set('searchTerm', filter);
    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', { params });
  }

  searchAlkatreszByCategories(categories: string, order: string): Observable<any[]> {
    const params = new HttpParams().set('categoryFilter', categories).set('orderOption', order);
    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', { params });
  }

  searchAlkatreszByFilterAndCategories(filter: string, categories: string, order: string): Observable<any[]> {
    const filterParams = new HttpParams().set('searchTerm', filter).set('orderOption', order);
    const categoriesParams = new HttpParams().set('categoryFilter', categories).set('orderOption', order);

    const filteredAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', { params: filterParams });
    const categorizedAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', { params: categoriesParams });

    return combineLatest([filteredAlkatresz$, categorizedAlkatresz$]).pipe(
      map(([filtered, categorized]) => this.filterByCategories(filtered, categorized))
    );
  }

  private filterByCategories(filtered: any[], categorized: any[]): any[] {
    // Perform filtering to keep only alkatreszek present in both lists
    return filtered.filter((item) => categorized.some((categorizedItem) => categorizedItem.id === item.id));
  }
}