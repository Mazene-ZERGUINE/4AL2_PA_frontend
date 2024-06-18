import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-create-group-modal',
  templateUrl: './create-group-modal.component.html',
  styleUrls: ['./create-group-modal.component.scss'],
})
export class CreateGroupModalComponent {
  private readonly _createGroupForm: FormGroup = new FormGroup({
    groupName: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.min(6), Validators.max(250)]),
    image: new FormControl(null),
    visibility: new FormControl('public'),
  });

  get createGroupForm(): FormGroup {
    return this._createGroupForm as FormGroup;
  }

  private selectedImage?: File;

  constructor(
    public dialogRef: MatDialogRef<CreateGroupModalComponent>,
    private readonly notifier: NotifierService,
  ) {}

  onCreateButtonClick(): void {
    if (this.createGroupForm.valid) {
      const data = this.createGroupForm.value;
      data.image = this.selectedImage;
      this.dialogRef.close(data);
      return;
    }
    this.notifier.showWarning(`group name can't be empty`);
  }

  onCloseBtnClick(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
    } else this.selectedImage = undefined;
  }
}
