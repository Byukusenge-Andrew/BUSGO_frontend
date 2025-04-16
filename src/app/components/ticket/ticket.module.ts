import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TicketComponent } from './ticket.component';

const routes: Routes = [
  { path: '', component: TicketComponent }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketModule {}
