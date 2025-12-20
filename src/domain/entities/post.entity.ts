export type PostAudit = { action: string; at: Date; actor?: string };

export class PostDm {
  id?: string;
  title!: string;
  content!: string;
  edited = false;
  likeCount = 0;
  commentCount = 0;
  posterId!: string;
  views = 0;
  tags: string[] = [];
  isPublished = true;
  attachments: string[] = [];
  status = 'draft';
  category?: string;
  slug?: string;
  flagged = false;
  shareCount = 0;
  rating = 0;
  updatedBy?: string;
  auditLog: PostAudit[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<PostDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): PostDm {
    return new PostDm({
      id: doc._id?.toString(),
      title: doc.title,
      content: doc.content,
      edited: !!doc.edited,
      likeCount: doc.likeCount ?? 0,
      commentCount: doc.commentCount ?? 0,
      posterId: doc.posterId?.toString(),
      views: doc.views ?? 0,
      tags: doc.tags ?? [],
      isPublished: !!doc.isPublished,
      attachments: (doc.attachments ?? []).map((a: any) => a.toString()),
      status: doc.status ?? 'draft',
      category: doc.category,
      slug: doc.slug,
      flagged: !!doc.flagged,
      shareCount: doc.shareCount ?? 0,
      rating: doc.rating ?? 0,
      updatedBy: doc.updatedBy?.toString(),
      auditLog: (doc.auditLog ?? []).map((a: any) => ({
        action: a.action,
        at: a.at,
        actor: a.actor?.toString(),
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
