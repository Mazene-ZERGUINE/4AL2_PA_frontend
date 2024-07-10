import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, combineLatest, interval } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ProgramModel } from '../../core/models/program.model';
import { UserDataModel } from '../../core/models/user-data.model';
import { ModalService } from '../../core/services/modal.service';
import { ReactionsEnum } from '../../shared/enums/reactions.enum';
import { SocketService } from '../socket.service';
import { HomeService } from './home.service';

export enum AvailableLangages {
  JAVASCRIPT = 'javascript',
  CPLUSPLUS = 'c++',
  PHP = 'php',
  PYTHON = 'python',
}

export const INTERVAL_REFRESH_TIME = 5000;
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

  readonly filtersOptionsForm = new FormGroup({
    searchQuery: new FormControl<string>('', { nonNullable: true }),
    availableLangages: new FormControl<AvailableLangages[]>([]),
  });

  readonly availableLangages$: Observable<AvailableLangages[] | null> =
    this.filtersOptionsForm.controls.availableLangages.valueChanges.pipe(
      startWith(this.filtersOptionsForm.controls.availableLangages.value),
    );

  readonly AvailableLangagesE = Object.values(AvailableLangages);

  private refreshPrograms$ = new Subject<void>();

  readonly componentDestroy$ = new Subject<void>();

  readonly programsList$: Observable<ProgramModel[]> = combineLatest([
    interval(INTERVAL_REFRESH_TIME).pipe(startWith(0)),
    this.userData$,
    this.refreshPrograms$.pipe(startWith(undefined)),
    this.availableLangages$,
    this.filtersOptionsForm.controls.searchQuery.valueChanges.pipe(startWith('')),
  ]).pipe(
    switchMap(([, userData, , selectedLanguages, searchQuery]) =>
      this.homeService.getProgramsList$('public').pipe(
        map((programList) =>
          programList.filter((program) => {
            const matchesUser = program.userId !== userData.userId;

            if (!selectedLanguages) return;

            const matchesLanguage =
              selectedLanguages.length === 0 ||
              selectedLanguages.includes(program.programmingLanguage);

            const matchesSearch = program.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
            return matchesUser && matchesLanguage && matchesSearch;
          }),
        ),
      ),
    ),
    distinctUntilChanged(),
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

  likeProgram(event: { programId: string; userId: string }): void {
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

  dislikeProgram(event: { programId: string; userId: string }): void {
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

  async deleteProgram(event: string): Promise<void> {
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

  handleAvailableLangage(selectedLangage: AvailableLangages): void {
    const currentLangages =
      this.filtersOptionsForm.controls.availableLangages.value || [];

    if (currentLangages.includes(selectedLangage)) {
      this.filtersOptionsForm.controls.availableLangages.setValue(
        currentLangages.filter((lang) => lang !== selectedLangage),
      );
    } else {
      this.filtersOptionsForm.controls.availableLangages.setValue([
        ...currentLangages,
        selectedLangage,
      ]);
    }
  }
}
