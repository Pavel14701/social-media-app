export class MessageDm {
  constructor(
    public readonly id: string,
    public conversationId: string,
    public senderId: string,
    public content: string,

    // новые поля
    public read: boolean = false,
    public attachments: string[] = [],
    public edited: boolean = false,
    public deleted: boolean = false,
    public replyTo?: string,
    public type: string = 'text',
    public reactions: { userId: string; emoji: string }[] = [],
    public delivered: boolean = false,
    public seenBy: string[] = [],
    public threadId?: string,
    public forwardedFrom?: string,
    public mentions: string[] = [],
    public priority: number = 0,
    public expiresAt?: Date,
    public location?: { lat: number; lng: number },
    public language?: string,
    public encrypted: boolean = false,
    public metadata: Record<string, any> = {},

    // системные даты
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
