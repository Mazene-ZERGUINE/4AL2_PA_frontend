import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { filter, lastValueFrom, Subject, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/Auth/service/auth.service';
import { EditProgramService } from '../program-edit/edit-program.service';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Ace } from 'ace-builds';
import { CodingProcessorService } from '../coding-page/coding-processor.service';
import { NotifierService } from '../../core/services/notifier.service';
import { ModalService } from '../../core/services/modal.service';
import { ProgramModel } from '../../core/models/program.model';
import * as ace from 'ace-builds';
import { CodePageUseGuidModalComponent } from '../../core/modals/code-page-use-guid-modal/code-page-use-guid-modal.component';
import { RunCodeResponseDto } from '../coding-page/models/RunCodeResponseDto';
import { RunCodeRequestDto } from '../coding-page/models/RunCodeRequestDto';
import { ConfirmationModalComponent } from '../../core/modals/conifrmatio-modal/confirmation-modal.component';
import { ShareCodeModalComponent } from '../../core/modals/share-code-modal/share-code-modal.component';
import { CreateProgramDto } from '../coding-page/models/CreateProgramDto';

@Component({
  selector: 'app-edit-user-program',
  templateUrl: './edit-user-program.component.html',
  styleUrls: ['./edit-user-program.component.scss'],
})
export class EditUserProgramComponent implements OnInit, OnDestroy, AfterViewChecked {
  componentDestroyer$ = new Subject<void>();

  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  @ViewChild('inputSelect', { static: false }) inputSelect!: ElementRef<HTMLInputElement>;

  aceEditor!: Ace.Editor;
  isLoading = false;
  codeOutput!: { output: string; status: number };
  fileTypes = ['md', 'txt', 'csv', 'json', 'xlsx', 'yml', 'pdf', 'png', 'jpg', 'jpeg'];
  protected selectedInputFiles: File[] = [];
  private selectedOutputFormats: string[] = [];
  private programmingLanguage!: string; // Add this property

  private readonly programId: string = this.route.snapshot.params['programId'];
  readonly userData$ = this.authService.getUserData().pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    }),
  );
  readonly programData$ = this.programEditService.getProgram(this.programId).pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    }),
    map((program: ProgramModel) => program),
  );

  private aceEditorInitialized = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly programEditService: EditProgramService,
    private readonly codeProcessor: CodingProcessorService,
    private readonly notifier: NotifierService,
    private readonly modalService: ModalService,
  ) {}

  ngOnInit(): void {
    // Other initialization code, if any
  }

  ngAfterViewChecked(): void {
    if (!this.aceEditorInitialized && this.editor) {
      this.initializeAceEditor();
      this.aceEditorInitialized = true;
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyer$.next();
    this.componentDestroyer$.complete();
  }

  private initializeAceEditor(): void {
    this.programData$
      .pipe(
        takeUntil(this.componentDestroyer$),
        tap((program: ProgramModel) => {
          this.programmingLanguage = program.programmingLanguage; // Set the programming language
          this.aceEditor = ace.edit(this.editor.nativeElement);
          this.aceEditor.setTheme('ace/theme/nord_dark');
          this.aceEditor.session.setMode(
            'ace/mode/' + this.getAceMode(program.programmingLanguage),
          );
          this.aceEditor.setOptions({
            fontSize: '15px',
            showLineNumbers: true,
            highlightActiveLine: true,
            readOnly: false,
            useWrapMode: true,
          });
          this.aceEditor.setValue(program.sourceCode);
        }),
      )
      .subscribe();
  }

  onRunCodeClick(): void {
    this.isLoading = true;
    if (this.selectedInputFiles.length > 0 || this.selectedOutputFormats.length > 0) {
      const formData = this.buildFormData();
      this.codeProcessor.sendCodeWithFilesToProcess(formData).subscribe({
        next: (response: any) => this.handleResponse(response),
        error: () => this.handleError(),
      });
    } else {
      const payload = this.buildPayload();
      this.codeProcessor.sendCodeToProcess(payload).subscribe({
        next: (response: RunCodeResponseDto) => this.handleResponse(response),
        error: () => this.handleError(),
      });
    }
  }

  onShowGuidClick(): void {
    this.modalService
      .openDialog(CodePageUseGuidModalComponent, 700)
      .pipe(takeUntil(this.componentDestroyer$))
      .subscribe();
  }

  onClearSelectedFilesClick(): void {
    this.clearAll();
  }

  onAddFormatClick(format: string): void {
    this.selectedOutputFormats.push(format);
  }

  getSelectedOutputFilesNumbers(value: string): number {
    return this.selectedOutputFormats.filter((format) => format === value).length;
  }

  async onSaveChangesClick(): Promise<void> {
    const result = await this.getConfirmationModelResults();
    if (result) {
      const dialog = this.modalService.openDialog(ShareCodeModalComponent, 700, {
        isGroupProgram: false,
      });
      dialog
        .pipe(
          takeUntil(this.componentDestroyer$),
          filter((result: any) => result !== undefined),
          switchMap((result) => {
            const programDto: CreateProgramDto = {
              ...result,
              sourceCode: this.aceEditor.getValue(),
            };
            console.log(programDto);
            return this.programEditService.updateProgram(this.programId, programDto);
          }),
          tap(() => this.notifier.showSuccess('Your program has been updated')),
        )
        .subscribe();
    } else {
      const payload = {
        sourceCode: this.aceEditor.getValue(),
      };
      this.programEditService
        .updateProgram(this.programId, payload)
        .pipe(
          takeUntil(this.componentDestroyer$),
          tap(() => this.notifier.showSuccess('your program has been updated')),
        )
        .subscribe();
    }
  }

  private async getConfirmationModelResults(): Promise<boolean> {
    const dialogRef = this.modalService.openDialog(ConfirmationModalComponent, 400, {
      title: 'save changes',
      message: 'want to update program description visibility or files ?',
    });

    const result = await lastValueFrom(
      dialogRef.pipe(
        takeUntil(this.componentDestroyer$),
        filter((result: any) => result === true || result === false), // Ensure that only true or false results are returned
      ),
    );

    return result;
  }

  private buildFormData(): FormData {
    const formData = new FormData();

    this.selectedInputFiles.forEach((file) => formData.append('files', file));
    const outputFormats =
      this.selectedOutputFormats.length === 1
        ? [this.selectedOutputFormats[0]]
        : this.selectedOutputFormats;

    outputFormats.forEach((format) => formData.append('outputFilesFormats', format));
    formData.append('programmingLanguage', this.programmingLanguage); // Use the property here
    formData.append('sourceCode', this.aceEditor.getValue());

    return formData;
  }

  private buildPayload(): RunCodeRequestDto {
    return {
      programmingLanguage: this.programmingLanguage,
      sourceCode: this.aceEditor.getValue(),
    };
  }

  private handleResponse(response: RunCodeResponseDto): void {
    if (response.result.returncode === 0) {
      this.codeOutput = {
        output: response.result.stdout,
        status: response.result.returncode,
      };
      const files = response.result.output_file_paths;
      if (files && files.length > 0) {
        if (files.length === 1) {
          this.codeProcessor.downloadOutputFile(files[0]);
        } else {
          this.codeProcessor.downloadFilesAsZip(files);
        }
      }
      this.notifier.showSuccess('code executed successfully');
    } else {
      this.codeOutput = {
        output: response.result.stderr,
        status: response.result.returncode,
      };
      this.notifier.showError('code returned with error');
    }
    this.isLoading = false;
    this.clearAll();
  }

  private handleError(): void {
    this.codeOutput = {
      status: 1,
      output: 'Request has reached timeout',
    };
    this.notifier.showWarning('request has reached timeout');
    this.isLoading = false;
  }

  private clearAll(): void {
    this.selectedInputFiles = [];
    this.selectedOutputFormats = [];
  }

  private getAceMode(language: string): string {
    const modes: { [key: string]: string } = {
      javascript: 'javascript',
      python: 'python',
      'c++': 'c_cpp',
      php: 'php',
    };
    return modes[language] || 'text';
  }
}
