import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SupportComponent } from './support.component';

const routes: Routes = [
  { path: '', component: SupportComponent }
];

@NgModule({

    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule]
  })

export class SupportModule {}
