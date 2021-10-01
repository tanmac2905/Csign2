import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreMenuModule } from '@core/components';
import { CoreCommonModule } from '@core/common.module';

import { VerticalMenuComponent } from 'app/layout/components/menu/vertical-menu/vertical-menu.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};
const routes: Routes = [
  {
    path: 'modals',
    component: VerticalMenuComponent,
    data: { animation: 'modals' }
  }
];
@NgModule({
  declarations: [VerticalMenuComponent],
  imports: [CoreMenuModule, CoreCommonModule,NgbModule,PdfViewerModule, PerfectScrollbarModule, RouterModule ,NgSelectModule,FormsModule,DragDropModule],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  exports: [VerticalMenuComponent]
})
export class VerticalMenuModule {}
