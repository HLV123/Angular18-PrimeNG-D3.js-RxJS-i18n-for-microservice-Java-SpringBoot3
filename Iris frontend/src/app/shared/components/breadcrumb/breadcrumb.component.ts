import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" *ngIf="segments.length > 0">
      <a routerLink="/dashboard" class="bc-link"><i class="pi pi-home"></i></a>
      @for (seg of segments; track $index) {
        <i class="pi pi-chevron-right bc-sep"></i>
        @if ($index < segments.length - 1) {
          <a [routerLink]="seg.path" class="bc-link">{{ seg.label }}</a>
        } @else {
          <span class="bc-current">{{ seg.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; }
    .bc-link { color: #64748b; text-decoration: none; } .bc-link:hover { color: #2563eb; }
    .bc-sep { font-size: 10px; color: #cbd5e1; }
    .bc-current { color: #1e293b; font-weight: 600; }
  `]
})
export class BreadcrumbComponent {
  segments: { label: string; path: string }[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects || e.url)
    ).subscribe((url: string) => {
      const parts = url.split('/').filter(Boolean);
      this.segments = parts.map((p, i) => ({
        label: p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        path: '/' + parts.slice(0, i + 1).join('/')
      }));
    });
  }
}