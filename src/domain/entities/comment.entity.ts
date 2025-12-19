export class CommentDm {
  constructor(
    public readonly id: string,
    public commenterId: string,
    public postId: string,
    public content: string,
    public parentId?: string,
    public childrenIds: string[] = [],
    public edited: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
