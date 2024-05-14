import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import { Ace } from 'ace-builds';
import { RunCodeRequestDto } from './models/RunCodeRequestDto';
import { CodingProcessorService } from './coding-processor.service';
import { RunCodeResponseDto } from './models/RunCodeResponseDto';
import { NotifierService } from '../../core/services/notifier.service';
import { filter, Subscription, switchMap, tap } from 'rxjs';
import { ModalService } from '../../core/services/modal.service';
import { ShareCodeModalComponent } from '../../core/modals/share-code-modal/share-code-modal.component';
import { CreateProgramDto } from './models/CreateProgramDto';

@Component({
  selector: 'app-coding-page',
  templateUrl: './coding-page.component.html',
  styleUrls: ['./coding-page.component.scss'],
})
export class CodingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;

  aceEditor!: Ace.Editor;
  selectedLanguage = 'javascript';
  isLoading = false;
  codeOutput!: { output: string; status: number };
  private runCodeSubscription = new Subscription();

  constructor(
    private readonly codeProcessorService: CodingProcessorService,
    private readonly notifier: NotifierService,
    private readonly modalService: ModalService,
  ) {}

  ngAfterViewInit(): void {
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setTheme('ace/theme/github_dark');
    this.aceEditor.session.setMode('ace/mode/' + this.selectedLanguage);
    this.aceEditor.setOptions({
      fontSize: '15px',
      showLineNumbers: true,
      highlightActiveLine: true,
      readOnly: false,
      useWrapMode: true,
    });
    this.aceEditor.setValue(`function hello() {
        console.log("Hello, world!");
    }`);
  }

  ngOnDestroy() {
    this.runCodeSubscription.unsubscribe();
  }

  onSelectedLanguageUpdate(): void {
    if (this.selectedLanguage === 'python') {
      this.aceEditor.setValue(`def hello():
        print("hello world")
      `);
    } else if (this.selectedLanguage === 'javascript') {
      this.aceEditor.setValue(`function hello() {
        console.log("Hello, world!");
      }`);
    }
    this.aceEditor.session.setMode('ace/mode/' + this.selectedLanguage);
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
    const payload: RunCodeRequestDto = {
      programmingLanguage: this.selectedLanguage,
      sourceCode: this.aceEditor.getValue(),
    };

    this.runCodeSubscription = this.codeProcessorService
      .sendCodeToProcess(payload)
      .subscribe({
        next: (response: RunCodeResponseDto) => {
          if (response.result.returncode === 0) {
            this.codeOutput = {
              output: response.result.stdout,
              status: response.result.returncode,
            };
            this.notifier.showSuccess('code executed successfully');
          } else {
            this.codeOutput = {
              output: response.result.stderr,
              status: response.result.returncode,
            };
            this.notifier.showError('code returned with error');
          }
          this.isLoading = false;
        },
        error: () => {
          this.codeOutput = {
            status: 1,
            output: 'Request has reached timeout',
          };
          this.notifier.showWarning('request has reached timout');
          this.isLoading = false;
        },
      });
  }

  onShareClick(): void {
    this.modalService
      .openDialog(ShareCodeModalComponent, 700)
      .pipe(
        filter((result) => result !== undefined),
        switchMap((result) => {
          const programDto: CreateProgramDto = {
            ...result,
            programmingLanguage: this.selectedLanguage,
            sourceCode: this.aceEditor.getValue(),
            userId: '1234', // todo: get the real user id after authentication //
          };
          return this.codeProcessorService.shareProgram(programDto);
        }),
        tap(() => {
          this.notifier.showSuccess('your program has been published');
        }),
      )
      .subscribe();
  }
}
