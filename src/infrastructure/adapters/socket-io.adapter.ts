import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { ISocketIoAdapter } from '../../application/interfaces/socket-io-adapter.interface';


export class AuthenticatedSocketIoAdapter extends IoAdapter implements ISocketIoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  attach(app: INestApplication): void {
    app.useWebSocketAdapter(this);
  }

  override createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    server.use((socket: Socket, next: (err?: Error) => void) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY!);
        (socket as any).decoded = decoded;
        next();
      } catch {
        next(new Error('Authentication error'));
      }
    });

    return server;
  }
}
