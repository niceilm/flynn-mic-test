import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RecordingComponent } from './recording/recording.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recording', component: RecordingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
