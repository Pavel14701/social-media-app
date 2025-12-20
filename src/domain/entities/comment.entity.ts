export type CommentReaction = { userId: string; type: string };

export class CommentDm {
  id?: string;
  commenterId!: string;

  // универсальная цель комментария
  targetType!: 'post' | 'message' | 'comment';
  targetId!: string;

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

  // новые поля
  source?: string; // web | mobile | api
  metadata: Record<string, any> = {};
  ipAddress?: string;
  deviceId?: string;
  expiresAt?: Date;
  priority: number = 0;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<CommentDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): CommentDm {
    return new CommentDm({
      id: doc._id?.toString(),
      commenterId: doc.commenter?.toString() ?? doc.commenterId?.toString(),
      targetType: doc.targetType ?? 'post',
      targetId: doc.targetId?.toString() ?? doc.post?.toString(),
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
      source: doc.source,
      metadata: doc.metadata ?? {},
      ipAddress: doc.ipAddress,
      deviceId: doc.deviceId,
      expiresAt: doc.expiresAt,
      priority: doc.priority ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
