import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService } from './home.service';
import { ProgramModel } from '../../core/models/program.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  // todo: a spinner in this page when data many data are loaded
  programsList$ = new Observable<ProgramModel[]>();

  constructor(private readonly homeService: HomeService) {}

  ngOnInit() {
    this.programsList$ = this.homeService.getPrograms$('public');
  }
}
