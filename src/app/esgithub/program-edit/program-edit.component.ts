import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { filter, forkJoin, Observable, Subscription, switchMap, tap } from 'rxjs';
import { UserDataModel } from '../../core/models/user-data.model';
import { AuthService } from '../../core/Auth/service/auth.service';
import { EditProgramService } from './edit-program.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { ProgramModel } from '../../core/models/program.model';
import * as ace from 'ace-builds';
import { Ace } from 'ace-builds';
import { ReactionsEnum } from '../../shared/enums/reactions.enum';
import { NotifierService } from '../../core/services/notifier.service';
import { ModalService } from '../../core/services/modal.service';
import { LineCommentsModalComponent } from '../../core/modals/line-comments-modal/line-comments-modal.component';

@Component({
  selector: 'app-program-edit',
  templateUrl: './program-edit.component.html',
  styleUrls: ['./program-edit.component.scss'],
})
export class ProgramEditComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;

  readonly userData$: Observable<UserDataModel> = this.authService.getUserData();
  private getProgramDetailsSubscription: Subscription = new Subscription();
  private likeOrDislikeSubscription: Subscription = new Subscription();
  private loadCommentsSubscription: Subscription = new Subscription();
  private dialogSubscription: Subscription = new Subscription();
  private commentsSubscription: Subscription = new Subscription();

  programComments!: any[];
  aceEditor!: Ace.Editor;
  program!: ProgramModel;
  userReaction: ReactionsEnum | undefined = undefined;
  likes!: number;
  dislikes!: number;
  commentFieldText!: string;
  replyingToCommentId: string | null = null;
  commentReplyFieldText!: string;
  highlightedLines: number[] = [];

  readonly anonymousImageUrl =
    'http://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  constructor(
    private readonly authService: AuthService,
    private readonly editProgramService: EditProgramService,
    private readonly route: ActivatedRoute,
    private readonly notifier: NotifierService,
    private readonly modalService: ModalService,
  ) {}

  ngAfterViewInit(): void {
    this.loadProgramDetails();
  }

  ngOnDestroy(): void {
    this.getProgramDetailsSubscription.unsubscribe();
    this.getProgramDetailsSubscription.unsubscribe();
    this.loadCommentsSubscription.unsubscribe();
    this.likeOrDislikeSubscription.unsubscribe();
    this.dialogSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
  }

  loadProgramDetails(): void {
    this.getProgramDetailsSubscription = this.route.params
      .pipe(
        map((routeParams) => routeParams['programId']),
        filter((programId) => programId !== undefined),
        switchMap((programId: string) =>
          forkJoin({
            programDetails: this.editProgramService.getProgram(programId),
            programComments: this.editProgramService.getProgramComments(programId),
            userData: this.userData$,
          }),
        ),
        tap(({ programDetails, programComments, userData }) => {
          this.program = programDetails;
          this.userReaction = this.program.reactions.find(
            (reaction) => reaction.user.userId === userData.userId,
          )?.type;
          this.likes = this.program.reactions.filter(
            (reaction) => reaction.type === ReactionsEnum.LIKE,
          ).length;
          this.dislikes = this.program.reactions.filter(
            (reaction) => reaction.type === ReactionsEnum.DISLIKE,
          ).length;
          this.aceEditor = ace.edit(this.editor.nativeElement);
          this.aceEditor.setTheme('ace/theme/nord_dark');
          this.aceEditor.session.setMode('ace/mode/' + this.program.programmingLanguage);
          this.aceEditor.setOptions({
            fontSize: '15px',
            showLineNumbers: true,
            highlightActiveLine: true,
            readOnly: true,
            useWrapMode: true,
          });
          this.aceEditor.setValue(this.program.sourceCode);
          this.aceEditor.on('guttermousedown', (e: any) => this.onGutterClick(e));
          this.programComments = this.filterComments(programComments);
          this.highlightedLines = this.getHighlightedLines(programComments);
          this.addCommentAnnotations(this.highlightedLines);
        }),
      )
      .subscribe();
  }

  private onGutterClick(e: any): void {
    const target = e.domEvent.target;
    if (target.className.indexOf('ace_gutter-cell') === -1) {
      return;
    }
    const row = e.getDocumentPosition().row;
    const dialogRef = this.modalService.openDialog(LineCommentsModalComponent, 900, {
      lineNumber: row,
      programId: this.program.programId,
    });
    this.dialogSubscription = dialogRef.subscribe(() => this.reloadProgramComments());
  }

  private reloadProgramComments(): void {
    this.loadCommentsSubscription = this.editProgramService
      .getProgramComments(this.program.programId)
      .subscribe((comments) => {
        this.programComments = this.filterComments(comments);
        this.highlightedLines = this.getHighlightedLines(comments);
        this.addCommentAnnotations(this.highlightedLines);
      });
  }

  private filterComments(comments: any[]): any[] {
    const replyCommentIds = this.getReplyCommentIds(comments);
    return comments.filter(
      (comment) =>
        !replyCommentIds.has(comment.commentId) && comment.codeLineNumber === null,
    );
  }

  private getReplyCommentIds(comments: any[]): Set<string> {
    const replyCommentIds = new Set<string>();

    const collectReplyCommentIds = (commentArray: any[]): void => {
      for (const comment of commentArray) {
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            replyCommentIds.add(reply.commentId);
          }
          collectReplyCommentIds(comment.replies);
        }
      }
    };

    collectReplyCommentIds(comments);
    return replyCommentIds;
  }

  private getHighlightedLines(comments: any[]): number[] {
    return comments
      .filter((comment) => comment.codeLineNumber !== null)
      .map((comment) => comment.codeLineNumber);
  }

  private addCommentAnnotations(lines: number[]): void {
    const session = this.aceEditor.getSession();
    const annotations = lines.map((line) => ({
      row: line,
      column: 0,
      text: 'Comment',
      type: 'warning',
    }));
    session.setAnnotations(annotations);
  }

  onLikeClick(): void {
    this.likeOrDislikeSubscription = this.userData$
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.likeOrDislikeProgram(
            ReactionsEnum.LIKE,
            this.program.programId,
            userId,
          ),
        ),
        tap(() => this.loadProgramDetails()),
      )
      .subscribe();
  }

  onDislikeClick(): void {
    this.likeOrDislikeSubscription = this.userData$
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.likeOrDislikeProgram(
            ReactionsEnum.DISLIKE,
            this.program.programId,
            userId,
          ),
        ),
        tap(() => this.loadProgramDetails()),
      )
      .subscribe();
  }

  onCommentClick(): void {
    this.commentsSubscription = this.userData$
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.submitComment(
            this.program.programId,
            userId,
            this.commentFieldText,
          ),
        ),
        tap(() => {
          this.reloadProgramComments();
          this.notifier.showSuccess('Comment submitted successfully.');
          this.commentFieldText = '';
        }),
      )
      .subscribe();
  }

  onReplyClick(commentId: string): void {
    this.replyingToCommentId = this.replyingToCommentId === commentId ? null : commentId;
  }

  onSubmitReply(commentId: string): void {
    this.commentsSubscription = this.userData$
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.replyToComment(
            commentId,
            userId,
            this.program.programId,
            this.commentReplyFieldText,
          ),
        ),
      )
      .subscribe(() => {
        this.reloadProgramComments();
        this.notifier.showSuccess('Comment submitted successfully.');
        this.commentReplyFieldText = '';
        this.replyingToCommentId = null;
      });
  }
  protected readonly ReactionsEnum = ReactionsEnum;
}
