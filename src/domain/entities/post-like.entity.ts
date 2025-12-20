export type PostLikeReport = { reason: string; at: Date; reporter?: string };

export class PostLikeDm {
  id?: string;
  userId!: string;
  postId?: string;
  commentId?: string;

  type: string = 'like'; // строго типизированные реакции
  source: string = 'web';
  weight: number = 1;
  metadata: Record<string, any> = {};

  ipAddress?: string;
  deviceId?: string;
  sessionId?: string;

  flagged = false;
  reportReasons: string[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<PostLikeDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): PostLikeDm {
    return new PostLikeDm({
      id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      postId: doc.postId?.toString(),
      commentId: doc.commentId?.toString(),
      type: doc.type ?? 'like',
      source: doc.source ?? 'web',
      weight: doc.weight ?? 1,
      metadata: doc.metadata ?? {},
      ipAddress: doc.ipAddress,
      deviceId: doc.deviceId,
      sessionId: doc.sessionId,
      flagged: !!doc.flagged,
      reportReasons: doc.reportReasons ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
