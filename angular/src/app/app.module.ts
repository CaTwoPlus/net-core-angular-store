import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ShowAlkatreszComponent } from './admin/show-alkatresz/show-alkatresz.component';
import { AddEditAlkatreszComponent } from './admin/add-edit-alkatresz/add-edit-alkatresz.component';
import { BontoApiService } from './bonto-api.service';
import { SearchBarComponent } from './search/search.component';
import { AdminSearchBarComponent } from './search/search.admin.component';
import { ViewAlkatreszComponent } from './admin/view-alkatresz/view-alkatresz.component';
import { LoginComponent } from './login/login.component';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CategoryPageComponent } from './category-page/category-page.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { SearchService } from './search/search.service';
import { CarouselComponent } from './category-page/carousel/carousel.component';
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { AuthenticationService } from './login/auth.service';
import { TokenInterceptor } from './login/token.interceptor';

// Angular Materials
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Material Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent,
    ShowAlkatreszComponent,
    AddEditAlkatreszComponent,
    SearchBarComponent,
    AdminSearchBarComponent,
    ViewAlkatreszComponent,
    LoginComponent,
    VisitorPageComponent,
    CategoryPageComponent,
    ProductPageComponent,
    CarouselComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    TypeaheadModule,
    LazyLoadImageModule,
    RecaptchaModule,
    RecaptchaFormsModule, 
  ],
  exports: [
    SearchBarComponent,
    AdminSearchBarComponent,
    AppRoutingModule
  ], 
  providers: [BontoApiService, SearchService, AuthenticationService,  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
