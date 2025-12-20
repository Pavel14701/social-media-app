import { Injectable } from '@nestjs/common';
import { Filter } from 'bad-words';
import { IContentFilter } from '../../application/interfaces/content-filter.interface';

@Injectable()
export class BadWordsFilterAdapter implements IContentFilter {
  private readonly filter: Filter;

  constructor() {
    this.filter = new Filter({ placeHolder: 'X' });
  }

  isProfane(text: string): boolean {
    return this.filter.isProfane(text);
  }
}
's'