export type MessageReaction = { userId: string; emoji: string };
export type MessageLocation = { lat: number; lng: number };

export class MessageDm {
  id?: string;
  conversationId!: string;
  senderId!: string;
  content!: string;

  // новые поля
  read = false;
  attachments: string[] = [];
  edited = false;
  deleted = false;
  replyTo?: string;
  type = 'text';
  reactions: MessageReaction[] = [];
  delivered = false;
  seenBy: string[] = [];
  threadId?: string;
  forwardedFrom?: string;
  mentions: string[] = [];
  priority = 0;
  expiresAt?: Date;
  location?: MessageLocation;
  language?: string;
  encrypted = false;
  metadata: Record<string, any> = {};

  // системные даты
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<MessageDm> = {}) {
    Object.assign(this, props);
  }

  static fromDoc(doc: any): MessageDm { 
    const props: Partial<MessageDm> = { 
      id: doc._id?.toString(), 
      conversationId: doc.conversation?.toString(), 
      senderId: doc.sender?.toString(), 
      content: doc.content, 
      read: !!doc.read, attachments: doc.attachments ?? [], 
      edited: !!doc.edited, 
      deleted: !!doc.deleted, 
      replyTo: doc.replyTo?.toString(), 
      type: doc.type ?? 'text', 
      reactions: (doc.reactions ?? []).map((r: any) => ({ userId: r.userId?.toString(), emoji: r.emoji })), 
      delivered: !!doc.delivered, 
      seenBy: (doc.seenBy ?? []).map((s: any) => s.toString()), 
      threadId: doc.threadId?.toString(), 
      forwardedFrom: doc.forwardedFrom?.toString(), 
      mentions: doc.mentions ?? [], 
      priority: doc.priority ?? 0, 
      expiresAt: doc.expiresAt, 
      language: doc.language, 
      encrypted: !!doc.encrypted, 
      metadata: doc.metadata ?? {}, 
      createdAt: doc.createdAt, 
      updatedAt: doc.updatedAt, 
    }; 
    if (doc.location) { 
      props.location = { lat: doc.location.lat, lng: doc.location.lng }; 
    } 
    return new MessageDm(props); 
  }
}
