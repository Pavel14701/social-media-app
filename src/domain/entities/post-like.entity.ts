export class PostLikeDm {
  constructor(
    public readonly id: string,
    public postId: string,
    public userId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
