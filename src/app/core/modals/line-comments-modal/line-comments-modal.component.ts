import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditProgramService } from '../../../esgithub/program-edit/edit-program.service';
import { Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../Auth/service/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-line-comments-modal',
  templateUrl: './line-comments-modal.component.html',
  styleUrls: ['./line-comments-modal.component.scss'],
})
export class LineCommentsModalComponent implements OnInit, OnDestroy {
  getLinesCommentsSubscription!: Subscription;
  lineNumber: number;
  programId: string;

  commentFieldText!: string;
  replyingToCommentId: string | null = null;
  commentReplyFieldText!: string;
  programComments!: any[];
  readonly anonymousImageUrl =
    'http://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly editProgramService: EditProgramService,
    private readonly authService: AuthService,
  ) {
    this.lineNumber = data.lineNumber;
    this.programId = data.programId;
  }

  ngOnInit() {
    this.loadComments();
  }

  ngOnDestroy() {
    this.getLinesCommentsSubscription.unsubscribe();
  }

  private loadComments(): void {
    this.editProgramService
      .getLinesComments(this.lineNumber, this.programId)
      .subscribe((comments) => {
        this.programComments = this.filterComments(comments);
      });
  }

  private filterComments(comments: any[]): any[] {
    const replyCommentIds = this.getReplyCommentIds(comments);
    return comments.filter((comment) => !replyCommentIds.has(comment.commentId));
  }

  private getReplyCommentIds(comments: any[]): Set<string> {
    const replyCommentIds = new Set<string>();

    const collectReplyCommentIds = (commentArray: any[]) => {
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

  onReplyClick(commentId: string): void {
    this.replyingToCommentId = this.replyingToCommentId === commentId ? null : commentId;
  }

  onSubmitReply(commentId: string): void {
    this.authService
      .getUserData()
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.replyToComment(
            commentId,
            userId,
            this.programId,
            this.commentReplyFieldText,
            this.lineNumber,
          ),
        ),
      )
      .subscribe(() => this.loadComments());
  }

  onCommentClick(): void {
    this.authService
      .getUserData()
      .pipe(
        map((userData) => userData.userId),
        switchMap((userId) =>
          this.editProgramService.submitComment(
            this.programId,
            userId,
            this.commentFieldText,
            this.lineNumber,
          ),
        ),
      )
      .subscribe(() => this.loadComments());
  }
}
