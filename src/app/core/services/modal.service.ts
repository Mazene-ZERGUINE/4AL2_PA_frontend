// modal.service.ts
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  openDialog<T, R = any>(
    component: ComponentType<T>,
    width: number,
    data?: R,
    config?: MatDialogConfig<R>,
  ): Observable<R> {
    const dialogRef = this.dialog.open(component, {
      width: `${width}px`,
      data: data,
      ...config,
    });

    return dialogRef.afterClosed() as Observable<R>;
  }
}
