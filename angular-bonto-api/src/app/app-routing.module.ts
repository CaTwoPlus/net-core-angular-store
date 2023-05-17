import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditAlkatreszComponent } from './alkatresz/add-edit-alkatresz/add-edit-alkatresz.component';
import { ShowAlkatreszComponent } from './alkatresz/show-alkatresz/show-alkatresz.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'admin/alkatreszek', component: ShowAlkatreszComponent },
  { path: 'admin/alkatresz_hozzaad_v_modosit', component: AddEditAlkatreszComponent },
  { path: 'admin/bejelentkezes', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
