import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import { Ace } from 'ace-builds';

@Component({
  selector: 'app-coding-page',
  templateUrl: './coding-page.component.html',
  styleUrls: ['./coding-page.component.scss'],
})
export class CodingPageComponent implements AfterViewInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;

  aceEditor!: Ace.Editor;
  selectedLanguage = 'javascript';
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
}
