export class PostLikeDm {
  constructor(
    public readonly id: string,
    public postId: string,
    public userId: string,

    // новые поля для реакций и аналитики
    public type: string = 'like', // like | love | haha | angry
    public source: string = 'web', // web | mobile | api
    public weight: number = 1,
    public metadata: Record<string, any> = {},

    // антиспам / аналитика
    public ipAddress?: string,
    public deviceId?: string,
    public sessionId?: string,

    // системные даты
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
