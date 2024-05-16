import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService } from './home.service';
import { ProgramModel } from '../../core/models/program.model';
import { AuthService } from '../../core/Auth/auth.service';
import { UserDataModel } from '../../core/models/user-data.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  // todo: a spinner in this page when data many data are loaded
  programsList$ = new Observable<ProgramModel[]>();
  userData$!: Observable<UserDataModel>;
  constructor(
    private readonly homeService: HomeService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = this.homeService.getProgramsList$('public');
  }
}
