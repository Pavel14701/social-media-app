export class PostDm {
  constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public edited: boolean = false,
    public likeCount: number = 0,
    public commentCount: number = 0,
    public posterId: string,
    public views: number = 0,
    public tags: string[] = [],
    public isPublished: boolean = true,
    public attachments: string[] = [],
    public status: string = 'draft',
    public category?: string,
    public slug?: string,
    public flagged: boolean = false,
    public shareCount: number = 0,
    public rating: number = 0,
    public updatedBy?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
