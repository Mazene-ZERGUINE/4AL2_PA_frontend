import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../../core/Auth/service/auth.service';
import { ProgramModel } from '../../../core/models/program.model';
import { ReactionModel } from '../../../core/models/reaction.model';
import { UserDataModel } from '../../../core/models/user-data.model';
import { ReactionsEnum } from '../../../shared/enums/reactions.enum';
import { ReactionService } from './reaction.service';

@Component({
  selector: 'app-program-item-list',
  templateUrl: './program-item-list.component.html',
  styleUrls: ['./program-item-list.component.scss'],
})
export class ProgramItemListComponent implements OnInit, OnDestroy {
  readonly componentDestroyer$: Subject<void> = new Subject();

  @Input() program!: ProgramModel;
  @Input() currentUser!: UserDataModel;
  @Input() homePage!: boolean;
  @Input() imageUrl!: string;
  @Input() isGroupOwner!: boolean;
  @Input() isProfileOwner?: boolean;

  @Output() likeClickEvent = new EventEmitter<{ programId: string; userId: string }>();
  @Output() dislikeClickEvent = new EventEmitter<{ programId: string; userId: string }>();
  @Output() removeClickEvent = new EventEmitter<string>();

  isProgramOwner: boolean = false;
  userReaction?: ReactionModel;
  likes$!: Observable<number>;
  dislikes$!: Observable<number>;
  protected readonly ReactionsEnum = ReactionsEnum;

  selectedBgImageUrl!: string;

  constructor(
    private readonly authService: AuthService,
    private reactionService: ReactionService,
  ) {}

  ngOnInit(): void {
    if (this.currentUser && this.program) {
      this.userReaction = this.getUserReaction(this.currentUser);
      this.isProgramOwner = this.checkOwner(this.currentUser);

      this.reactionService.updateLikes(this.program.programId, this.getLikes());
      this.reactionService.updateDislikes(this.program.programId, this.getDislikes());

      this.likes$ = this.reactionService.getLikes$(this.program.programId);
      this.dislikes$ = this.reactionService.getDislikes$(this.program.programId);
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyer$.next();
    this.componentDestroyer$.complete();
  }

  private getUserReaction(user: UserDataModel): ReactionModel | undefined {
    return this.program.reactions.find(
      (reaction) => reaction?.user?.userId === user.userId,
    );
  }

  private getLikes(): number {
    return this.program.reactions.filter(
      (reaction) => reaction.type === ReactionsEnum.LIKE,
    ).length;
  }

  private getDislikes(): number {
    return this.program.reactions.filter(
      (reaction) => reaction.type === ReactionsEnum.DISLIKE,
    ).length;
  }

  private checkOwner(user: UserDataModel): boolean {
    return this.program.user.userId === user.userId;
  }

  onLikeBtnClick(): void {
    this.likeClickEvent.emit({
      userId: this.currentUser.userId,
      programId: this.program.programId,
    });
  }

  onDislikeBtnClick(): void {
    this.dislikeClickEvent.emit({
      userId: this.currentUser.userId,
      programId: this.program.programId,
    });
  }

  onDeleteBtnClick(): void {
    this.removeClickEvent.emit(this.program.programId);
  }
}
