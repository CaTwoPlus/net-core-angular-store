import { Component } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-visitor-page',
  templateUrl: './visitor-page.component.html',
  styleUrls: ['./visitor-page.component.css']
})

export class VisitorPageComponent {
  title = 'ford';
  sequenceValidator(sequence: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      
      if (!value) {
        // If the control value is empty, consider it as valid
        return null;
      }
      
      if (!value.toLowerCase().includes(sequence.toLowerCase())) {
        // If the sequence is not found in the value, return the validation error
        return { noMatch: true };
      }
      
      // Valid input
      return null;
    };
  }
  
  // Usage in the component
  searchFormControl = new FormControl('', [
    this.sequenceValidator('apple')
  ]);
}
