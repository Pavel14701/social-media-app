import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './infrastructure/mogoose/models/user.schema';
import { Comment, CommentSchema } from './infrastructure/mogoose/models/comment.schema';
import { Conversation, ConversationSchema } from './infrastructure/mogoose/models/conversation.schema';
import { Follow, FollowSchema } from './infrastructure/mogoose/models/follow.schema';
import { Message, MessageSchema } from './infrastructure/mogoose/models/message.schema';
import { PostLike, PostLikeSchema } from './infrastructure/mogoose/models/post-like.schema';
import { Post, PostSchema } from './infrastructure/mogoose/models/post.schema';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('MONGO_HOST', 'localhost');
        const port = config.get<string>('MONGO_PORT', '27017');
        const db   = config.get<string>('MONGO_DB', 'myapp');
        const user = config.get<string>('MONGO_USER');
        const pass = config.get<string>('MONGO_PASS');
        let authPart = '';
        if (user && pass) {
          authPart = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`;
        }
        const uri = `mongodb://${authPart}${host}:${port}/${db}`;
        return { uri };
      },
    }),
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
  exports: [MongooseModule],
})
export class DatabaseModule {}
