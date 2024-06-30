import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UserDataModel } from '../../../core/models/user-data.model';
import { ReactionsEnum } from '../../../shared/enums/reactions.enum';
import { ReactionModel } from '../../../core/models/reaction.model';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../../../core/Auth/service/auth.service';
import { ProgramModel } from '../../../core/models/program.model';
import { ReactionService } from './reaction.service';

@Component({
  selector: 'app-program-item-list',
  templateUrl: './program-item-list.component.html',
  styleUrls: ['./program-item-list.component.scss'],
})
export class ProgramItemListComponent implements OnInit, OnDestroy {
  readonly anonymousImageUrl =
    'http://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg';

  readonly bgImagesUrls = [
    'https://wallpapers.com/images/high/4k-programming-background-3oesubeugl2yu9yw.webp',
    'https://e0.pxfuel.com/wallpapers/11/889/desktop-wallpaper-the-poor-coder-json-thumbnail.jpg',
    'https://png.pngtree.com/background/20240115/original/pngtree-3d-rendered-image-illustrating-the-concept-of-coding-and-programming-picture-image_7283662.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpQOaaqiChNNuE4BdoPLuLGdEekoABPU8_ZQ&s',
    'https://i.pinimg.com/1200x/a2/be/77/a2be778cac94e9d39e705efb7f89d296.jpg',
  ];

  componentDestroyer$: Subject<void> = new Subject();

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
    this.selectedBgImageUrl = this.getRandomImage();
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

  getRandomImage(): string {
    return this.bgImagesUrls[Math.floor(Math.random() * this.bgImagesUrls.length)];
  }
}
