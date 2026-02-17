import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoadingComponent, ConfirmDialogComponent],
  template: `<router-outlet></router-outlet><app-toast /><app-loading /><app-confirm-dialog />`
})
export class AppComponent {}
