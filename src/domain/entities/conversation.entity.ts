export class ConversationDm {
  constructor(
    public readonly id: string,
    public recipients: string[], // userIds
    public lastMessageAt?: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
