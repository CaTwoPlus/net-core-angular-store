import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditAlkatreszComponent } from './admin/add-edit-alkatresz/add-edit-alkatresz.component';
import { ShowAlkatreszComponent } from './admin/show-alkatresz/show-alkatresz.component';
import { LoginComponent } from './login/login.component';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';
import { canActivate } from './admin/admin.guard';

const routes: Routes = [
  { path: 'admin/alkatreszek', component: ShowAlkatreszComponent, canActivate: [canActivate] },
  { path: 'admin/alkatresz_hozzaad_v_modosit', component: AddEditAlkatreszComponent, canActivate: [canActivate] },
  { path: 'admin/bejelentkezes', component: LoginComponent },
  { path: '', component: VisitorPageComponent, pathMatch: 'full', data:{ category: '' } },
  { path: 'szolgaltatasok', component: VisitorPageComponent },
  { path: 'vasarlasi_infok', component: VisitorPageComponent },
  { path: 'kapcsolat', component: VisitorPageComponent },
  { path: 'alkatreszek', component: VisitorPageComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
