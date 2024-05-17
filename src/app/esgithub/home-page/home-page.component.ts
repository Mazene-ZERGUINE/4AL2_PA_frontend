import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
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
  programsList$ = new Observable<ProgramModel[]>();
  userData$!: Observable<UserDataModel>;
  isLoading = true;

  constructor(
    private readonly homeService: HomeService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.userData$ = this.authService.getUserData();
    this.programsList$ = combineLatest([
      this.userData$,
      this.homeService.getProgramsList$('public'),
    ]).pipe(
      map(([userData, programs]) =>
        programs.filter((program) => program.user.userId !== userData.userId),
      ),
      finalize(() => (this.isLoading = false)),
    );
  }
}
