import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, takeUntil, tap, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ProgramModel } from '../../core/models/program.model';
import { UserDataModel } from '../../core/models/user-data.model';
import { HomeService } from './home.service';
import { ReactionsEnum } from '../../shared/enums/reactions.enum';
import { ModalService } from '../../core/services/modal.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly userData$: Observable<UserDataModel> = this.authService
    .getUserData()
    .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  private refreshPrograms$ = new Subject<void>();
  private selectedLanguages$ = new BehaviorSubject<string[]>([]);
  private searchQuery$ = new BehaviorSubject<string>('');

  readonly componentDestroy$ = new Subject<void>();

  readonly programsList$: Observable<ProgramModel[]> = combineLatest([
    this.userData$,
    this.refreshPrograms$.pipe(startWith(undefined)),
    this.selectedLanguages$,
    this.searchQuery$.pipe(startWith('')),
  ]).pipe(
    switchMap(([userData, , selectedLanguages, searchQuery]) =>
      this.homeService.getProgramsList$('public').pipe(
        map((programList) =>
          programList.filter((program) => {
            const matchesUser = program.userId !== userData.userId;
            const matchesLanguage =
              selectedLanguages.length === 0 ||
              selectedLanguages.includes(program.programmingLanguage.toLowerCase());
            const matchesSearch = program?.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
            return matchesUser && matchesLanguage && matchesSearch;
          }),
        ),
      ),
    ),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    private readonly homeService: HomeService,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private socketService: SocketService,
  ) {}

  ngOnInit(): void {
    this.socketService.on(ReactionsEnum.LIKE, () => {
      this.refreshPrograms$.next();
    });

    this.socketService.on(ReactionsEnum.DISLIKE, () => {
      this.refreshPrograms$.next();
    });
  }

  ngOnDestroy(): void {
    this.componentDestroy$.next();
    this.componentDestroy$.complete();
  }

  likeProgram(event: any): void {
    this.userData$
      .pipe(
        takeUntil(this.componentDestroy$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.LIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => {
          this.refreshPrograms$.next();
        }),
      )
      .subscribe();
  }

  dislikeProgram(event: any): void {
    this.userData$
      .pipe(
        takeUntil(this.componentDestroy$),
        switchMap((user) =>
          this.homeService.likeOrDislikeProgram(
            ReactionsEnum.DISLIKE,
            event.programId,
            user.userId,
          ),
        ),
        tap(() => {
          this.refreshPrograms$.next();
        }),
      )
      .subscribe();
  }

  async deleteProgram(event: string) {
    const result = await this.modalService.getConfirmationModelResults(
      'delete program',
      'are you sur you want to delete this program?',
    );
    if (result) {
      this.homeService
        .deleteProgram(event)
        .pipe(
          takeUntil(this.componentDestroy$),
          tap(() => {
            this.refreshPrograms$.next();
          }),
        )
        .subscribe();
    }
  }

  onLanguageChange(event: any) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value.toLowerCase();
    const selectedLanguages = this.selectedLanguages$.value;

    if (checkbox.checked) {
      this.selectedLanguages$.next([...selectedLanguages, value]);
    } else {
      this.selectedLanguages$.next(selectedLanguages.filter((lang) => lang !== value));
    }
  }

  onSearchChange(event: any) {
    const searchQuery = (event.target as HTMLInputElement).value;
    this.searchQuery$.next(searchQuery);
  }
}
