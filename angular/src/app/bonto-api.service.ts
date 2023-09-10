import { HttpClient, HttpParams, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, combineLatest, map, of } from 'rxjs';
import { prodEnvironment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class BontoApiService {
  readonly bontoAPIUrl = prodEnvironment.apiUrl;
  readonly headers = new HttpHeaders().set('Cache-Control', 'must-revalidate');
  
  cachedCategorizedAlkatreszek: { [category: string]: { data: any[], eTag: string } } = {};
  cachedFilteredAlkatreszek: { [keyword: string]: { data: any[], eTag: string } } = {};
  cachedFilteredCategorizedAlkatreszek: { [keyword: string]: { [category: string]: 
    { data: any[], categoriesETag: string,  keywordETag: string} } } = {};
  searchByKeywordAndCategoriesData: any[] = [];
  setCache: boolean = false;
  searchByKeywordResponse?: HttpResponse<any>;

  constructor(private http:HttpClient) { 
  }

  getAlkatresz(id:number|string, admin = false):Observable<any>{
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    return this.http.get<any>(this.bontoAPIUrl + `/Alkatresz/${id}`, {headers: headers});
  }

  getAlkatreszList(admin = false):Observable<any[]>{
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const listRequest = {
      headers: headers,
      observe: 'response' as const,
    };
    const cachedAlaktreszekList = localStorage.getItem('cachedAlaktreszekList');
    const cachedAlkatreszListETag = localStorage.getItem('cachedAlkatreszListETag');
    if (cachedAlaktreszekList && cachedAlkatreszListETag) {
      const parsedETag = JSON.parse(cachedAlkatreszListETag);
      listRequest.headers = listRequest.headers.set('If-None-Match', parsedETag);
    }

    return this.http.get<any>(this.bontoAPIUrl + '/Alkatresz', listRequest).pipe(
      map(response => {
        if (response instanceof HttpResponse) {          
          if (response.status === 200) {
            // Update the cached ETag if available
            const newETag = response.headers.get('ETag') || '';
            localStorage.setItem('cachedAlaktreszekList', JSON.stringify(response.body));
            localStorage.setItem('cachedAlkatreszListETag', JSON.stringify(newETag));
            return response.body;
          }
        }
        return [];
      }), 
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          if (cachedAlaktreszekList) {
            return of (JSON.parse(cachedAlaktreszekList));
          }
        }
        return of ([]);
      })
    );
  }

  addAlkatresz(data:any){
    let request = new HttpHeaders;
    request.set('admin', 'true');
    return this.http.post(this.bontoAPIUrl + '/Alkatresz', data, {headers: request});
  }

  updateAlkatresz(id:number|string, data:any){
    let request = new HttpHeaders;
    request.set('admin', 'true');
    return this.http.put(this.bontoAPIUrl + `/Alkatresz/${id}`, data, {headers: request});
  }

  deleteAlkatresz(id:number|string){
    let request = new HttpHeaders;
    request.set('admin', 'true');
    return this.http.delete(this.bontoAPIUrl + `/Alkatresz/${id}`, {headers: request});
  }

  // Kategoriak
  getKategoriaList(admin = false):Observable<any[]>{
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const listRequest = {
      headers: headers,
      observe: 'response' as const,
    };
    const cachedKategoriaList = localStorage.getItem('cachedKategoriaList');
    const cachedKategoriaListETag = localStorage.getItem('cachedKategoriaListETag');
    if (cachedKategoriaList && cachedKategoriaListETag) {
      const parsedETag = JSON.parse(cachedKategoriaListETag);
      listRequest.headers = listRequest.headers.set('If-None-Match', parsedETag);
    }
    return this.http.get<any>(this.bontoAPIUrl + '/Kategoria', listRequest).pipe(
      map(response => {
        if (response instanceof HttpResponse) {          
          if (response.status === 200) {
            // Update the cached ETag if available
            const newETag = response.headers.get('ETag') || '';
            localStorage.setItem('cachedKategoriaList', JSON.stringify(response.body));
            localStorage.setItem('cachedKategoriaListETag', JSON.stringify(newETag));
            return response.body;
          }
        }
        return [];
      }), 
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          if (cachedKategoriaList) {
            return of (JSON.parse(cachedKategoriaList));
          }
        }
        return of ([]);
      })
    );
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
  getAutoTipusList(admin = false):Observable<any[]>{
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const listRequest = {
      headers: headers,
      observe: 'response' as const,
    };
    const cachedAutoTipusList = localStorage.getItem('cachedAutoTipusList');
    const cachedAutoTipusListETag = localStorage.getItem('cachedAutoTipusListETag');
    if (cachedAutoTipusList && cachedAutoTipusListETag) {
      const parsedETag = JSON.parse(cachedAutoTipusListETag);
      listRequest.headers = listRequest.headers.set('If-None-Match', parsedETag);
    }

    return this.http.get<any>(this.bontoAPIUrl + '/AutoTipus', listRequest).pipe(
      map(response => {
        if (response instanceof HttpResponse) {          
          if (response.status === 200) {
            // Update the cached ETag if available
            const newETag = response.headers.get('ETag') || '';
            localStorage.setItem('cachedAutoTipusList', JSON.stringify(response.body));
            localStorage.setItem('cachedAutoTipusListETag', JSON.stringify(newETag));
            return response.body;
          }
        }
        return [];
      }), 
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          if (cachedAutoTipusList) {
            return of (JSON.parse(cachedAutoTipusList));
          }
        }
        return of ([]);
      })
    );;
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
  searchAlkatreszByKeyword(keyword: string, order: string, admin = false): Observable<any[]> {
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const filterParams = new HttpParams().set('searchTerm', keyword).set('orderOption', order);
    const filterRequest = {
      headers: headers,
      params: filterParams,
      observe: 'response' as const,
    };
    const cachedFilter = localStorage.getItem(`cachedFilteredAlkatreszek=${keyword}`);
    if (cachedFilter) {
      const cachedFilterETag = JSON.parse(cachedFilter);
      if (cachedFilterETag.eTag)
      filterRequest.headers = filterRequest.headers.set('If-None-Match', cachedFilterETag.eTag);
    }

    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', filterRequest).pipe(
      map(response => {
        if (response instanceof HttpResponse) {          
          if (response.status === 200) {
            if (keyword.length >= 3 && response.body?.length !== 0) {
              this.searchByKeywordResponse = response;
            } 
            return response.body as any[];
          }
        }
        return [];
      }), 
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          const cachedFilteredAlkatreszekToParse = localStorage.getItem(`cachedFilteredAlkatreszek=${keyword}`);
          if (cachedFilteredAlkatreszekToParse) {
            const cachedData = JSON.parse(cachedFilteredAlkatreszekToParse);
            return of(cachedData.data);
          }
        }
        return of([]);
      })
    );
  }

  searchAlkatreszByCategories(categories: string, order: string, admin = false): Observable<any[]> {
    if (categories === '') {
      return of([]);
    }
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const categoryParams = new HttpParams().set('categoryFilter', categories).set('orderOption', order);
    const categoriesRequest = {
      headers: headers,
      params: categoryParams,
      observe: 'response' as const,
    }
    const cachedCategory = this.cachedCategorizedAlkatreszek[categories];
    if (cachedCategory && cachedCategory.eTag) {
      categoriesRequest.headers = categoriesRequest.headers.set('If-None-Match', cachedCategory.eTag);
    }

    return this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', categoriesRequest).pipe(
      map(response => {
        if (response instanceof HttpResponse) {          
          if (response.status === 200) {
            if (response.body && response.body?.length > 0) {
              // Update the cached ETag if available
              const newETag = response.headers.get('ETag') || '';
              this.cachedCategorizedAlkatreszek[categories] = { data: response.body as any[], eTag: newETag };
              localStorage.setItem(`cachedCategorizedAlkatreszek=${categories}`, JSON.stringify(this.cachedCategorizedAlkatreszek[categories]));
            }
            return response.body as any[];
          }
        }
        return [];
      }), 
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          const cachedCategorizedAlkatreszekToParse = localStorage.getItem(`cachedCategorizedAlkatreszek=${categories}`);
          if (cachedCategorizedAlkatreszekToParse) {
            const cachedData = JSON.parse(cachedCategorizedAlkatreszekToParse);
            return of(cachedData.data);
          }
        }
        return of ([]);
      })
    );
  }

  searchAlkatreszByKeywordAndCategories(keyword: string, categories: string, order: string, noCaching = false, admin = false): Observable<any[]> {
    let headers = this.headers;
    if (admin) {
      headers = headers.set('admin', 'true');
    }
    const filterParams = new HttpParams().set('searchTerm', keyword).set('orderOption', order);
    const filterRequest = {
      headers: headers,
      params: filterParams,
      observe: 'response' as const,
    };
    const categoriesParams = new HttpParams().set('categoryFilter', categories).set('orderOption', order);
    const categoriesRequest = {
      headers: headers,
      params: categoriesParams,
      observe: 'response' as const,
    }

    if (this.cachedFilteredCategorizedAlkatreszek[keyword] && !noCaching) {
      const cachedCombinedFilter = this.cachedFilteredCategorizedAlkatreszek[keyword][categories];
      if (cachedCombinedFilter && cachedCombinedFilter.categoriesETag && cachedCombinedFilter.keywordETag) {
        categoriesRequest.headers = categoriesRequest.headers.set('If-None-Match', cachedCombinedFilter.categoriesETag);
        filterRequest.headers = filterRequest.headers.set('If-None-Match', cachedCombinedFilter.keywordETag);
      }
    }

    const filteredAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/filtered-alkatreszek', filterRequest);
    const categorizedAlkatresz$ = this.http.get<any[]>(this.bontoAPIUrl + '/Alkatresz/categorized-alkatreszek', categoriesRequest);

    return combineLatest([filteredAlkatresz$, categorizedAlkatresz$]).pipe(
      map(([filtered, categorized]) => {
        if (filtered instanceof HttpResponse && categorized instanceof HttpResponse) {
          if (filtered.status === 200 && categorized.status === 200) {
            this.searchByKeywordAndCategoriesData = this.filterByCategories(filtered.body as any[], categorized.body as any[]);
            if (this.searchByKeywordAndCategoriesData.length > 0 && !noCaching) {
              if (!this.cachedFilteredCategorizedAlkatreszek[keyword]) {
                this.cachedFilteredCategorizedAlkatreszek[keyword] = {};
              }
              if (!this.cachedFilteredCategorizedAlkatreszek[keyword][categories]) {
                this.cachedFilteredCategorizedAlkatreszek[keyword][categories] = {
                  data: [],
                  keywordETag: '',
                  categoriesETag: ''
                };
              }
              this.cachedFilteredCategorizedAlkatreszek[keyword][categories] = {
                data: this.searchByKeywordAndCategoriesData,
                keywordETag: filtered.headers.get('ETag') || '',
                categoriesETag: categorized.headers.get('ETag') || ''
              }
              localStorage.setItem(`cachedFilteredCategorizedAlkatreszek=${keyword}_${categories}`, JSON.stringify(
                this.cachedFilteredCategorizedAlkatreszek[keyword][categories]));
            }
            return this.searchByKeywordAndCategoriesData;
          }
        }
        return [];
      }),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 304) {
          return of (this.cachedFilteredCategorizedAlkatreszek[keyword][categories].data);
        }
        return of ([]);
      })
    );
  }

  private filterByCategories(filtered: any[], categorized: any[]): any[] {
    return filtered.filter((item) => categorized.some((categorizedItem) => categorizedItem.id === item.id));
  }
}