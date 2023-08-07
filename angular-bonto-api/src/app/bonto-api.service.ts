import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class BontoApiService {

  readonly bontoAPIUrl = "https://localhost:7094/api";
  readonly headers = new HttpHeaders().set('Cache-Control', 'must-revalidate');

  constructor(private http:HttpClient) { 
  }

  getAlkatresz(id:number|string):Observable<any>{
    return this.http.get<any>(this.bontoAPIUrl + `/Alkatresz/${id}`, {headers: this.headers})
  }

  getAlkatreszList():Observable<any[]>{
    return this.http.get<any>(this.bontoAPIUrl + '/Alkatresz', {headers: this.headers});
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
    return this.http.get<any>(this.bontoAPIUrl + '/Kategoria', {headers: this.headers});
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
    return this.http.get<any>(this.bontoAPIUrl + '/AutoTipus', {headers: this.headers});
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
  
  searchAlkatreszByKeyword(keyword: string, order: string): Observable<any[]> {
    const filterParams = new HttpParams().set('searchTerm', keyword).set('orderOption', order);
    const filterRequest = {
      headers: this.headers,
      params: filterParams
    };
    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', filterRequest);
  }

  searchAlkatreszByCategories(categories: string, order: string): Observable<any[]> {
    const categoryParams = new HttpParams().set('categoryFilter', categories).set('orderOption', order);
    const categoriesRequest = {
      headers: this.headers,
      params: categoryParams
    }
    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', categoriesRequest);
  }

  searchAlkatreszByKeywordAndCategories(keyword: string, categories: string, order: string): Observable<any[]> {
    const filterParams = new HttpParams().set('searchTerm', keyword).set('orderOption', order);
    const filterRequest = {
      headers: this.headers,
      params: filterParams
    };
    const categoriesParams = new HttpParams().set('categoryFilter', categories).set('orderOption', order);
    const categoriesRequest = {
      headers: this.headers,
      params: categoriesParams
    }

    const filteredAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', filterRequest);
    const categorizedAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', categoriesRequest);

    return combineLatest([filteredAlkatresz$, categorizedAlkatresz$]).pipe(
      map(([filtered, categorized]) => this.filterByCategories(filtered, categorized))
    );
  }

  private filterByCategories(filtered: any[], categorized: any[]): any[] {
    // Perform filtering to keep only alkatreszek present in both lists
    return filtered.filter((item) => categorized.some((categorizedItem) => categorizedItem.id === item.id));
  }
}