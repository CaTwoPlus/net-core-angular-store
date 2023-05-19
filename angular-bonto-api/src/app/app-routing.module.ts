import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditAlkatreszComponent } from './alkatresz/add-edit-alkatresz/add-edit-alkatresz.component';
import { ShowAlkatreszComponent } from './alkatresz/show-alkatresz/show-alkatresz.component';
import { LoginComponent } from './login/login.component';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';

const routes: Routes = [
  { path: 'admin/alkatreszek', component: ShowAlkatreszComponent },
  { path: 'admin/alkatresz_hozzaad_v_modosit', component: AddEditAlkatreszComponent },
  { path: 'admin/bejelentkezes', component: LoginComponent },
  { path: '', component: VisitorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
