// application/interfaces/conversation-repository.interface.ts
import { ConversationDm } from "../../domain/entities/conversation.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IConversationRepository extends IBaseRepository<ConversationDm> {
  create(entity: ConversationDm): Promise<ConversationDm>;
  findByParticipants(userIds: string[]): Promise<ConversationDm | null>;
  updateLastMessageAt(conversationId: string): Promise<void>;
  findByUser(userId: string): Promise<ConversationDm[]>;
  existsBetween(userIds: string[]): Promise<boolean>;
}
