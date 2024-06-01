import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ProgramModel } from '../../core/models/program.model';
import { UserDataModel } from '../../core/models/user-data.model';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
  readonly userData$: Observable<UserDataModel> = this.authService
    .getUserData()
    .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  readonly programsList$: Observable<ProgramModel[]> = this.userData$.pipe(
    switchMap((userData) =>
      this.homeService
        .getProgramsList$('public')
        .pipe(
          map((programList) =>
            programList.filter((program) => program.userId !== userData.userId),
          ),
        ),
    ),
  );

  constructor(
    private readonly homeService: HomeService,
    private readonly authService: AuthService,
  ) {}
}
