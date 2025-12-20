import { INestApplication } from '@nestjs/common';

export interface ISocketIoAdapter {
  attach(app: INestApplication): void;
}
