export class FollowDm {
  constructor(
    public readonly id: string,
    public userId: string,
    public followingId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
