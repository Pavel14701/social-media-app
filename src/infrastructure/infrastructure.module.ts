import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './mogoose/models/user.schema';
import { Post, PostSchema } from './mogoose/models/post.schema';
import { UserRepository } from './mogoose/repositories/user.repository';
import { PostRepository } from './mogoose/repositories/post.repository';
import { JwtAdapter } from './adapters/jwt.adapter';
import { PasswordAdapter } from './adapters/password.adapter';
import { Conversation, ConversationSchema } from './mogoose/models/conversation.schema';
import { CommentSchema } from './mogoose/models/comment.schema';
import { Follow, FollowSchema } from './mogoose/models/follow.schema';
import { Message, MessageSchema } from './mogoose/models/message.schema';
import { PostLike, PostLikeSchema } from './mogoose/models/post-like.schema';
import { CommentRepository } from './mogoose/repositories/comment.repository';
import { ConversationRepository } from './mogoose/repositories/conversation.repository';
import { FollowRepository } from './mogoose/repositories/follow.repository';
import { MessageRepository } from './mogoose/repositories/message.repository';
import { PostLikeRepository } from './mogoose/repositories/post-like.repository';
import { BadWordsFilterAdapter } from './adapters/content-filter.adapter';
import { AuthenticatedSocketIoAdapter } from './adapters/socket-io.adapter';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Message.name, schema: MessageSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Post.name, schema: PostSchema},
    ]),
  ],
  providers: [
    {
        provide: 'ICommentRepository',
        useClass: CommentRepository, 
    },
    {
        provide: 'IConversationRepository',
        useClass: ConversationRepository, 
    },
    {
        provide: 'IFollowRepository',
        useClass: FollowRepository, 
    },
    {
        provide: 'IMessageRepository',
        useClass: MessageRepository, 
    },
    {
        provide: 'IPostLikeRepository',
        useClass: PostLikeRepository, 
    },
    {
      provide: 'IPostRepository',
      useClass: PostRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
        provide: 'IContentFilter',
        useClass: BadWordsFilterAdapter, 
    },
    {
      provide: 'IJwtAdapter',
      useClass: JwtAdapter,
    },
    {
      provide: 'IPasswordAdapter',
      useClass: PasswordAdapter,
    },
    {
        provide: 'ISocketIoAdapter',
        useClass: AuthenticatedSocketIoAdapter, 
    },
  ],
  exports: [
    'ICommentRepository',
    'IConversationRepository',
    'IFollowRepository',
    'IMessageRepository',
    'IPostLikeRepository',
    'IPostRepository',
    'IUserRepository',
    'IContentFilter',
    'IJwtAdapter',
    'IPasswordAdapter',
    'ISocketIoAdapter'
  ],
})
export class InfrastructureModule {}
