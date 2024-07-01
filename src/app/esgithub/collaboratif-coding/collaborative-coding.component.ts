import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-nord_dark';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-php';
import { Ace } from 'ace-builds';
import { RunCodeRequestDto } from '../coding-page/models/RunCodeRequestDto';
import { CodingProcessorService } from '../coding-page/coding-processor.service';
import { RunCodeResponseDto } from '../coding-page/models/RunCodeResponseDto';
import { NotifierService } from '../../core/services/notifier.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environment/environment';
import { io, Socket } from 'socket.io-client';
import { debounceTime, Subject } from 'rxjs';

interface CodeChangePayload {
  code: string;
}

interface CursorChangePayload {
  cursor: Ace.Point;
}

@Component({
  selector: 'app-collaboratif-coding',
  templateUrl: './collaborative-coding.component.html',
  styleUrls: ['./collaborative-coding.component.scss'],
})
export class CollaborativeCodingComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  @ViewChild('inputSelect', { static: false }) inputSelect!: ElementRef<HTMLInputElement>;

  aceEditor!: Ace.Editor;
  selectedLanguage = 'javascript';
  isLoading = false;
  codeOutput!: { output: string; status: number };
  fileTypes = ['md', 'txt', 'csv', 'json', 'xlsx', 'yml', 'pdf', 'png', 'jpg', 'jpeg'];
  protected selectedInputFiles: File[] = [];
  private selectedOutputFormats: string[] = [];
  private sessionId!: string;
  protected sessionUrl!: string;
  private socket!: Socket;
  private codeChange$ = new Subject<CodeChangePayload>();
  private cursorChange$ = new Subject<CursorChangePayload>();
  private isInternalChange: boolean = false;

  constructor(
    private readonly codeProcessorService: CodingProcessorService,
    private readonly notifier: NotifierService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.params['sessionId'];
    this.sessionUrl = `${environment.baseUrl}/api/v1/${this.sessionId}`;
    this.initializeWebSocketConnection();
    this.setupDebouncedCodeChange();
    this.setupDebouncedCursorChange();
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.setTheme('ace/theme/nord_dark');
    this.aceEditor.session.setMode('ace/mode/javascript');
    this.aceEditor.setOptions({
      fontSize: '15px',
      showLineNumbers: true,
      highlightActiveLine: true,
      readOnly: false,
      useWrapMode: true,
    });

    this.isInternalChange = false;

    this.aceEditor.on('change', () => {
      if (!this.isInternalChange) {
        const code = this.aceEditor.getValue();
        this.codeChange$.next({ code });
      }
    });

    this.aceEditor.getSession().selection.on('changeCursor', () => {
      if (!this.isInternalChange) {
        const cursor = this.aceEditor.getCursorPosition();
        this.cursorChange$.next({ cursor });
      }
    });

    this.cdr.detectChanges();

    this.socket.on('loadCode', (payload: CodeChangePayload) => {
      this.updateEditorContent(payload);
    });

    this.socket.on('codeUpdate', (payload: CodeChangePayload) => {
      this.updateEditorContent(payload);
    });

    this.socket.on('cursorUpdate', (payload: CursorChangePayload) => {
      this.updateCursor(payload);
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
    this.codeChange$.unsubscribe();
    this.cursorChange$.unsubscribe();
  }

  onSelectedLanguageUpdate(): void {
    this.setDefaultCode(this.selectedLanguage);
    this.aceEditor.session.setMode('ace/mode/' + this.getAceMode(this.selectedLanguage));
  }

  onRunCodeClick(): void {
    this.isLoading = true;
    if (this.selectedInputFiles.length > 0 || this.selectedOutputFormats.length > 0) {
      const formData = this.buildFormData();
      this.codeProcessorService.sendCodeWithFilesToProcess(formData).subscribe({
        next: (response: any) => this.handleResponse(response),
        error: () => this.handleError(),
      });
    } else {
      const payload = this.buildPayload();
      this.codeProcessorService.sendCodeToProcess(payload).subscribe({
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

  private initializeWebSocketConnection(): void {
    this.socket = io('http://localhost:3000/collaboratif-coding', {
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      this.socket.emit('joinSession', this.sessionId);
    });

    this.socket.on('loadCode', (payload: CodeChangePayload) => {
      this.updateEditorContent(payload);
    });

    this.socket.on('codeUpdate', (payload: CodeChangePayload) => {
      this.updateEditorContent(payload);
    });

    this.socket.on('cursorUpdate', (payload: CursorChangePayload) => {
      this.updateCursor(payload);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  private setupDebouncedCodeChange(): void {
    this.codeChange$
      .pipe(debounceTime(500)) // Adjust the debounce time as needed
      .subscribe((payload: CodeChangePayload) => {
        this.socket.emit('codeChange', { sessionId: this.sessionId, ...payload });
      });
  }

  private setupDebouncedCursorChange(): void {
    this.cursorChange$
      .pipe(debounceTime(300)) // Adjust the debounce time as needed
      .subscribe((payload: CursorChangePayload) => {
        this.socket.emit('cursorChange', { sessionId: this.sessionId, ...payload });
      });
  }

  private updateEditorContent(payload: CodeChangePayload): void {
    const currentCursor = this.aceEditor.getCursorPosition();
    this.isInternalChange = true;
    this.aceEditor.session.setValue(payload.code);
    this.aceEditor.moveCursorToPosition(currentCursor);
    this.isInternalChange = false;
    this.cdr.detectChanges();
  }

  private updateCursor(payload: CursorChangePayload): void {
    if (!payload.cursor) {
      console.error('Cursor is undefined:', payload);
      return;
    }

    this.isInternalChange = true;
    const scrollTop = this.aceEditor.session.getScrollTop();
    const scrollLeft = this.aceEditor.session.getScrollLeft();
    this.aceEditor.moveCursorToPosition(payload.cursor);
    this.aceEditor.session.setScrollTop(scrollTop);
    this.aceEditor.session.setScrollLeft(scrollLeft);
    this.isInternalChange = false;
    this.cdr.detectChanges();
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
