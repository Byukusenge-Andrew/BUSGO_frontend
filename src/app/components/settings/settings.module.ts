import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  { path: '', component: SettingsComponent }
];

@NgModule({

  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SettingsModule {}
