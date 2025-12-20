import { ConversationDm } from "../../domain/entities/conversation.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IConversationRepository extends IBaseRepository<ConversationDm> {
  create(entity: ConversationDm): Promise<ConversationDm>;

  findByParticipants(userIds: string[]): Promise<ConversationDm | null>;
  findByUser(userId: string): Promise<ConversationDm[]>;
  existsBetween(userIds: string[]): Promise<boolean>;

  updateLastMessageAt(conversationId: string): Promise<void>;
  updateLastMessage(conversationId: string, messageId: string): Promise<void>;

  addRecipient(conversationId: string, userId: string): Promise<void>;
  removeRecipient(conversationId: string, userId: string): Promise<void>;

  setAdmin(conversationId: string, userId: string): Promise<void>;
  removeAdmin(conversationId: string, userId: string): Promise<void>;

  incrementUnread(conversationId: string, userId: string): Promise<void>;
  resetUnread(conversationId: string, userId: string): Promise<void>;

  muteConversation(conversationId: string, userId: string): Promise<void>;
  unmuteConversation(conversationId: string, userId: string): Promise<void>;

  pinMessage(conversationId: string, messageId: string): Promise<void>;
  archive(conversationId: string): Promise<void>;

  countByUser(userId: string): Promise<number>;
  deleteByUser(userId: string): Promise<void>;

  getTopActiveConversations(limit: number): Promise<{ id: string; count: number }[]>;
  getConversationStats(conversationId: string): Promise<any>;
}
