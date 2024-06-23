import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-nord_dark';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-php';
import { Ace } from 'ace-builds';
import { RunCodeRequestDto } from './models/RunCodeRequestDto';
import { CodingProcessorService } from './coding-processor.service';
import { RunCodeResponseDto } from './models/RunCodeResponseDto';
import { NotifierService } from '../../core/services/notifier.service';
import { filter, Observable, Subscription, switchMap, tap } from 'rxjs';
import { ModalService } from '../../core/services/modal.service';
import { ShareCodeModalComponent } from '../../core/modals/share-code-modal/share-code-modal.component';
import { CreateProgramDto } from './models/CreateProgramDto';
import { Router } from '@angular/router';
import { AuthService } from '../../core/Auth/service/auth.service';
import { UserDataModel } from '../../core/models/user-data.model';
import { CodePageUseGuidModalComponent } from '../../core/modals/code-page-use-guid-modal/code-page-use-guid-modal.component';

@Component({
  selector: 'app-coding-page',
  templateUrl: './coding-page.component.html',
  styleUrls: ['./coding-page.component.scss'],
})
export class CodingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  @ViewChild('inputSelect', { static: false }) inputSelect!: ElementRef<HTMLInputElement>;

  aceEditor!: Ace.Editor;
  selectedLanguage = 'javascript';
  isLoading = false;
  codeOutput!: { output: string; status: number };
  private userId!: string;
  fileTypes = ['md', 'txt', 'csv', 'json', 'xlsx', 'yml', 'pdf', 'png', 'jpg', 'jpeg'];
  protected selectedInputFiles: File[] = [];
  private selectedOutputFormats: string[] = [];
  readonly userData$: Observable<UserDataModel> = this.authService.getUserData();
  private runCodeSubscription = new Subscription();
  private getUserDataSubscription = new Subscription();

  constructor(
    private readonly codeProcessorService: CodingProcessorService,
    private readonly notifier: NotifierService,
    private readonly modalService: ModalService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngAfterViewInit(): void {
    this.modalService.openDialog(CodePageUseGuidModalComponent, 700).subscribe();
    this.getUserDataSubscription = this.authService
      .getUserData()
      .subscribe((user: UserDataModel) => {
        this.userId = user.userId;
      });
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setTheme('ace/theme/nord_dark');
    this.aceEditor.session.setMode('ace/mode/' + this.getAceMode(this.selectedLanguage));
    this.aceEditor.setOptions({
      fontSize: '15px',
      showLineNumbers: true,
      highlightActiveLine: true,
      readOnly: false,
      useWrapMode: true,
    });
    this.setDefaultCode(this.selectedLanguage);
  }

  ngOnDestroy() {
    this.runCodeSubscription.unsubscribe();
    this.getUserDataSubscription.unsubscribe();
  }

  onSelectedLanguageUpdate(): void {
    this.setDefaultCode(this.selectedLanguage);
    this.aceEditor.session.setMode('ace/mode/' + this.getAceMode(this.selectedLanguage));
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file: File | null = target.files ? target.files[0] : null;

    if (file) {
      this.readFile(file);
    }
  }

  private readFile(file: File): void {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.aceEditor.setValue(fileReader.result as string);
    };
    fileReader.readAsText(file);
  }

  onRunCodeClick(): void {
    this.isLoading = true;
    if (this.selectedInputFiles.length > 0 || this.selectedOutputFormats.length > 0) {
      const formData = this.buildFormData();
      this.runCodeSubscription = this.codeProcessorService
        .sendCodeWithFilesToProcess(formData)
        .subscribe({
          next: (response: any) => this.handleResponse(response),
          error: () => this.handleError(),
        });
    } else {
      const payload = this.buildPayload();
      this.runCodeSubscription = this.codeProcessorService
        .sendCodeToProcess(payload)
        .subscribe({
          next: (response: RunCodeResponseDto) => this.handleResponse(response),
          error: () => this.handleError(),
        });
    }
  }

  onClearFilesClick(): void {
    if (this.selectedInputFiles.length === 0) {
      this.notifier.showWarning('no files have been selected');
      return;
    }
    this.selectedInputFiles = [];
    this.notifier.showSuccess('files cleared.');
  }

  onShareClick(): void {
    this.modalService
      .openDialog(ShareCodeModalComponent, 900, { isGroupProgram: false })
      .pipe(
        filter((result: any) => result !== undefined),
        switchMap((result) => {
          const programDto: CreateProgramDto = {
            ...result,
            programmingLanguage: this.selectedLanguage,
            sourceCode: this.aceEditor.getValue(),
            userId: this.userId,
          };
          return this.codeProcessorService.shareProgram(programDto);
        }),
        tap(() => {
          this.notifier.showSuccess('your program has been published');
          this.router.navigate(['home']);
        }),
      )
      .subscribe();
  }

  onShowGuideClick(): void {
    this.modalService.openDialog(CodePageUseGuidModalComponent, 700).subscribe();
  }

  onAddFormatClick(format: string): void {
    this.selectedOutputFormats.push(format);
  }

  getSelectedOutputFilesNumbers(value: string): number {
    return this.selectedOutputFormats.filter((format) => format === value).length;
  }

  onInputFilesSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.selectedInputFiles.push(file);
      });
      this.inputSelect.nativeElement.value = '';
    }
  }

  private buildFormData(): FormData {
    const formData = new FormData();

    this.selectedInputFiles.forEach((file) => formData.append('files', file));
    const outputFormats =
      this.selectedOutputFormats.length === 1
        ? [this.selectedOutputFormats[0]]
        : this.selectedOutputFormats;

    outputFormats.forEach((format) => formData.append('outputFilesFormats', format));
    formData.append('programmingLanguage', this.selectedLanguage);
    formData.append('sourceCode', this.aceEditor.getValue());

    return formData;
  }

  private buildPayload(): RunCodeRequestDto {
    return {
      programmingLanguage: this.selectedLanguage,
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
          this.codeProcessorService.downloadOutputFile(files[0]);
        } else {
          this.codeProcessorService.downloadFilesAsZip(files);
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
    this.cleanAll();
  }

  private handleError(): void {
    this.codeOutput = {
      status: 1,
      output: 'Request has reached timeout',
    };
    this.notifier.showWarning('request has reached timeout');
    this.isLoading = false;
  }

  private cleanAll(): void {
    this.selectedOutputFormats = [];
    this.selectedInputFiles = [];
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

  private setDefaultCode(language: string): void {
    if (language === 'python') {
      this.aceEditor.setValue(`def hello():
  print("hello world")
`);
    } else if (language === 'javascript') {
      this.aceEditor.setValue(`function hello() {
  console.log("Hello, world!");
}`);
    } else if (language === 'c++') {
      this.aceEditor.setValue(`#include <iostream>
using namespace std;

int main() {
  cout << "Hello, world!" << endl;
  return 0;
}`);
    } else if (language === 'php') {
      this.aceEditor.setValue(`<?php
echo "Hello, world!";
?>`);
    }
  }
}
