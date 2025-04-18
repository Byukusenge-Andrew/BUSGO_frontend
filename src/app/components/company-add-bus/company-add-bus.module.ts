import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyAddBusComponent } from './company-add-bus.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: CompanyAddBusComponent }
];

@NgModule({
  imports: [CommonModule,ReactiveFormsModule, RouterModule.forChild(routes)],
  exports: [RouterModule]

})
export class CompanyAddBusModule {}