import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileTypesEnum } from '../../../shared/enums/FileTypesEnum';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-share-code-modal',
  templateUrl: './share-code-modal.component.html',
  styleUrls: ['./share-code-modal.component.scss'],
})
export class ShareCodeModalComponent {
  visibility!: string;
  description!: string;
  inputFileTypeOptions = Object.values(FileTypesEnum).map((value) => ({
    value,
    checked: false,
  }));

  outputFileTypeOptions = Object.values(FileTypesEnum).map((value) => ({
    value,
    checked: false,
  }));
  visibilityOptions = [
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' },
    { label: 'Follower Only', value: 'followerOnly' },
  ];
  constructor(
    public dialogRef: MatDialogRef<ShareCodeModalComponent>,
    private overlayContainer: OverlayContainer,
    private readonly notifier: NotifierService,
  ) {
    this.overlayContainer.getContainerElement().classList.add('app-dark-theme');
  }

  shareCode(): void {
    const missingInputType = !this.inputFileTypeOptions.some((type) => type.checked);
    const missingOutputType = !this.outputFileTypeOptions.some((type) => type.checked);
    if (!this.visibility || missingInputType || missingOutputType) {
      this.notifier.showWarning('input types, output types and visibility are mandatory');
      return;
    }

    const inputTypes = this.inputFileTypeOptions
      .filter((type) => type.checked)
      .map((type) => type.value);

    const outputTypes = this.outputFileTypeOptions
      .filter((type) => type.checked)
      .map((type) => type.value);

    const data = {
      description: this.description,
      inputTypes: inputTypes,
      outputTypes: outputTypes,
      visibility: this.visibility,
    };
    this.dialogRef.close(data);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
