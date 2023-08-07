import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditAlkatreszComponent } from './alkatresz/add-edit-alkatresz/add-edit-alkatresz.component';
import { ShowAlkatreszComponent } from './alkatresz/show-alkatresz/show-alkatresz.component';
import { LoginComponent } from './login/login.component';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';
import { CategoryPageComponent } from './category-page/category-page.component';

const routes: Routes = [
  { path: 'admin/alkatreszek', component: ShowAlkatreszComponent },
  { path: 'admin/alkatresz_hozzaad_v_modosit', component: AddEditAlkatreszComponent },
  { path: 'admin/bejelentkezes', component: LoginComponent },
  { path: '', component: VisitorPageComponent },
  { path: 'szolgaltatasok', component: VisitorPageComponent },
  { path: 'vasarlasi_infok', component: VisitorPageComponent },
  { path: 'kapcsolat', component: VisitorPageComponent },
  { path: 'alkatreszek/autohifi', component: VisitorPageComponent },
  { path: 'alkatreszek/biztonsagi_alkatreszek', component: VisitorPageComponent },
  { path: 'alkatreszek/elektromos_alkatreszek', component: VisitorPageComponent },
  { path: 'alkatreszek/fenyszorok_lampak', component: VisitorPageComponent },
  { path: 'alkatreszek/futomu_kormanymu_fek_alkatreszek', component: VisitorPageComponent },
  { path: 'alkatreszek/karosszeria_elemek', component: VisitorPageComponent },
  { path: 'alkatreszek/klima_futes', component: VisitorPageComponent },
  { path: 'alkatreszek/kuplung_sebessegvalto', component: VisitorPageComponent },
  { path: 'alkatreszek/motoralkatreszek', component: VisitorPageComponent },
  { path: 'alkatreszek/utaster_csomagter_egyeb', component: VisitorPageComponent },
  { path: 'alkatreszek/uzemanyag_ellato_rendszer', component: VisitorPageComponent },
  { path: 'alkatreszek/talalatok', component: VisitorPageComponent },
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
