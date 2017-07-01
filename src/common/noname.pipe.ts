import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'noname', pure: false })
//transforms "" into "Unnamed"
export class NonamePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(content) {
    if(content && content.length) return content;
    else return 'Unnamed';
  }
}