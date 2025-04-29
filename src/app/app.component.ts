import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

  `,
  styles: [`
    .main-content {
      padding: 0.5rem;
      max-width: 1350px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  title = 'BUSGO';
}
