import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/Auth/service/auth.service';
import { ProgramModel } from '../../core/models/program.model';
import { PipelinesService } from './pipelines.service';
import { NotifierService } from '../../core/services/notifier.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-piplines',
  templateUrl: './pipelines.component.html',
  styleUrls: ['./pipelines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelinesComponent implements OnInit, OnDestroy {
  @ViewChild('fileSelector', { static: false })
  inputSelect!: ElementRef<HTMLInputElement>;
  @ViewChild('dropZone', { static: false }) dropZone!: ElementRef<HTMLElement>;

  private componentDestroyer$ = new Subject<void>();
  private refreshPrograms$ = new Subject<void>();
  private selectedLanguages$ = new BehaviorSubject<string[]>([]);
  private searchQuery$ = new BehaviorSubject<string>('');
  private inputFilesFormats$ = new BehaviorSubject<string[]>([]);
  private latestOutputFilesFormats$ = new BehaviorSubject<string[]>([]);

  protected selectedInputFiles: File[] = [];
  protected droppedPrograms: ProgramModel[] = [];

  protected readonly programsList$: Observable<ProgramModel[]> = combineLatest([
    this.refreshPrograms$.pipe(startWith(undefined)),
    this.selectedLanguages$,
    this.searchQuery$.pipe(startWith('')),
    this.inputFilesFormats$,
    this.latestOutputFilesFormats$,
  ]).pipe(
    switchMap(
      ([, selectedLanguages, searchQuery, inputFilesFormats, latestOutputFilesFormats]) =>
        this.pipelinesService.getAllPrograms$().pipe(
          map((programList) =>
            programList.filter((program) => {
              const matchesLanguage =
                selectedLanguages.length === 0 ||
                selectedLanguages.includes(program.programmingLanguage.toLowerCase());
              const matchesSearch = program.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
              const matchesInputFormat =
                inputFilesFormats.length === 0 ||
                inputFilesFormats.every((format) =>
                  program.inputTypes.some(
                    (inputType) => inputType.toLowerCase() === format,
                  ),
                );
              const matchesLatestOutputFormat =
                latestOutputFilesFormats.length === 0 ||
                program.inputTypes.some((inputType) =>
                  latestOutputFilesFormats.includes(inputType.toLowerCase()),
                );
              return (
                matchesLanguage &&
                matchesSearch &&
                matchesInputFormat &&
                matchesLatestOutputFormat
              );
            }),
          ),
        ),
    ),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    private readonly authService: AuthService,
    private readonly pipelinesService: PipelinesService,
    private readonly notifierService: NotifierService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.refreshPrograms$.next();
  }

  ngOnDestroy(): void {
    this.componentDestroyer$.next();
    this.componentDestroyer$.complete();
  }

  onSelectStartFiles(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.selectedInputFiles.push(file);
        const fileFormat = file.name.split('.').pop()?.toLowerCase() || '';
        if (fileFormat && !this.inputFilesFormats$.value.includes(fileFormat)) {
          this.inputFilesFormats$.next([...this.inputFilesFormats$.value, fileFormat]);
        }
      });
      this.inputSelect.nativeElement.value = '';
      this.refreshPrograms$.next();
    }
  }

  onLanguageChange(event: any): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value.toLowerCase();
    const selectedLanguages = this.selectedLanguages$.value;

    if (checkbox.checked) {
      this.selectedLanguages$.next([...selectedLanguages, value]);
    } else {
      this.selectedLanguages$.next(selectedLanguages.filter((lang) => lang !== value));
    }
    this.refreshPrograms$.next();
  }

  onSearchChange(event: any): void {
    const searchQuery = (event.target as HTMLInputElement).value;
    this.searchQuery$.next(searchQuery);
    this.refreshPrograms$.next();
  }

  onDragStart(event: DragEvent, program: ProgramModel): void {
    event.dataTransfer?.setData('application/json', JSON.stringify(program));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      const program = JSON.parse(data) as ProgramModel;
      if (
        this.selectedInputFiles.length === 0 &&
        program.inputTypes.length > 0 &&
        this.droppedPrograms.length === 0
      ) {
        this.notifierService.showWarning(
          'you must select the start input file first or a program that do not have input files',
        );
        return;
      }
      this.droppedPrograms.push(program);
      this.latestOutputFilesFormats$.next(
        program.outputTypes.map((type) => type.toLowerCase()),
      );
      this.refreshPrograms$.next();
      this.cdr.markForCheck();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }
}
