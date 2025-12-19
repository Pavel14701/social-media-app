export class PostDm {
  constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public edited: boolean = false,
    public likeCount: number = 0,
    public commentCount: number = 0,
    public posterId: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
