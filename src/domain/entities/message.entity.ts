export class MessageDm {
  constructor(
    public readonly id: string,
    public conversationId: string,
    public senderId: string,
    public content: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
