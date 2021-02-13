import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocsViewComponent } from './docs-view/docs-view.component';

const routes: Routes = [{
    path: 'docs',
    component: DocsViewComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
