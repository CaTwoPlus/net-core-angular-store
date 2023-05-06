import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditAlkatreszComponent } from './alkatresz/add-edit-alkatresz/add-edit-alkatresz.component';
import { ShowAlkatreszComponent } from './alkatresz/show-alkatresz/show-alkatresz.component';

const routes: Routes = [
  { path: 'admin/alkatreszek', component: ShowAlkatreszComponent },
  { path: 'add-edit-alkatresz', component: AddEditAlkatreszComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
