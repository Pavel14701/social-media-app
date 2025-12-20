export type CommentReaction = { userId: string; type: string };

export class CommentDm {
  id?: string;
  commenterId!: string;
  postId!: string;
  content!: string;

  parent?: string;
  children: string[] = [];

  reactions: CommentReaction[] = [];
  edited = false;
  flagged = false;
  reportReasons: string[] = [];
  mentions: string[] = [];
  attachments: string[] = [];
  status: string = 'active';

  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<CommentDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): CommentDm {
    return new CommentDm({
      id: doc._id?.toString(),
      commenterId: doc.commenterId?.toString(),
      postId: doc.postId?.toString(),
      content: doc.content,
      parent: doc.parent?.toString(),
      children: (doc.children ?? []).map((c: any) => c.toString()),
      reactions: (doc.reactions ?? []).map((r: any) => ({
        userId: r.userId?.toString(),
        type: r.type,
      })),
      edited: !!doc.edited,
      flagged: !!doc.flagged,
      reportReasons: doc.reportReasons ?? [],
      mentions: (doc.mentions ?? []).map((m: any) => m.toString()),
      attachments: (doc.attachments ?? []).map((a: any) => a.toString()),
      status: doc.status ?? 'active',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
