import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlkatreszComponent } from './alkatresz/alkatresz.component';
import { ShowAlkatreszComponent } from './alkatresz/show-alkatresz/show-alkatresz.component';
import { AddEditAlkatreszComponent } from './alkatresz/add-edit-alkatresz/add-edit-alkatresz.component';
import { BontoApiService } from './bonto-api.service';
import { SearchBarComponent } from './alkatresz/search/search.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewAlkatreszComponent } from './alkatresz/view-alkatresz/view-alkatresz.component';

@NgModule({
  declarations: [
    AppComponent,
    AlkatreszComponent,
    ShowAlkatreszComponent,
    AddEditAlkatreszComponent,
    SearchBarComponent,
    ViewAlkatreszComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  exports: [
    SearchBarComponent
  ], 
  providers: [BontoApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
