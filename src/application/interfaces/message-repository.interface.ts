// application/interfaces/message-repository.interface.ts
import { MessageDm } from "../../domain/entities/message.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IMessageRepository extends IBaseRepository<MessageDm> {
  create(entity: MessageDm): Promise<MessageDm>;

  // выборка сообщений по диалогу
  findByConversation(conversationId: string, limit?: number, anchor?: string): Promise<MessageDm[]>;

  // выборка сообщений по отправителю
  findBySender(userId: string): Promise<MessageDm[]>;

  // последние N сообщений диалога
  findRecent(conversationId: string, limit: number): Promise<MessageDm[]>;

  // количество сообщений в диалоге
  countByConversation(conversationId: string): Promise<number>;

  // удалить все сообщения диалога
  deleteByConversation(conversationId: string): Promise<void>;

  // обновить текст сообщения
  updateContent(messageId: string, newContent: string): Promise<MessageDm | null>;

  // удалить одно сообщение
  deleteMessage(messageId: string): Promise<void>;

  // поиск по ключевому слову в диалоге
  searchInConversation(conversationId: string, keyword: string): Promise<MessageDm[]>;

  // последние N сообщений от конкретного пользователя
  findRecentBySender(userId: string, limit: number): Promise<MessageDm[]>;

  // количество сообщений пользователя
  countBySender(userId: string): Promise<number>;
}
