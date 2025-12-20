import { MessageDm } from "../../domain/entities/message.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IMessageRepository extends IBaseRepository<MessageDm> {
  create(entity: MessageDm): Promise<MessageDm>;

  // выборка сообщений по диалогу
  findByConversation(conversationId: string, limit?: number, anchor?: string): Promise<MessageDm[]>;

  // пагинация назад (история вверх)
  paginateBackward(conversationId: string, anchor: string, limit: number): Promise<MessageDm[]>;

  // выборка сообщений по отправителю
  findBySender(userId: string): Promise<MessageDm[]>;

  // последние N сообщений диалога
  findRecent(conversationId: string, limit: number): Promise<MessageDm[]>;

  // последнее сообщение диалога
  findLastMessage(conversationId: string): Promise<MessageDm | null>;

  // количество сообщений в диалоге
  countByConversation(conversationId: string): Promise<number>;

  // количество непрочитанных сообщений
  countUnread(conversationId: string, userId: string): Promise<number>;

  // удалить все сообщения диалога
  deleteByConversation(conversationId: string): Promise<void>;

  // обновить текст сообщения
  updateContent(messageId: string, newContent: string): Promise<MessageDm | null>;

  // мягкое удаление сообщения
  softDelete(messageId: string): Promise<void>;

  // восстановить мягко удалённое сообщение
  restoreMessage(messageId: string): Promise<void>;

  // удалить одно сообщение
  deleteMessage(messageId: string): Promise<void>;

  // отметить сообщения как прочитанные
  markAsRead(conversationId: string, userId: string): Promise<void>;

  // поиск по ключевому слову в диалоге
  searchInConversation(conversationId: string, keyword: string): Promise<MessageDm[]>;

  // последние N сообщений от конкретного пользователя
  findRecentBySender(userId: string, limit: number): Promise<MessageDm[]>;

  // количество сообщений пользователя
  countBySender(userId: string): Promise<number>;

  // выборка ответов на сообщение
  findReplies(messageId: string): Promise<MessageDm[]>;

  // выборка сообщений по ветке
  findByThread(threadId: string): Promise<MessageDm[]>;

  // выборка пересланных сообщений
  findForwarded(fromMessageId: string): Promise<MessageDm[]>;

  // выборка сообщений с упоминанием пользователя
  findByMention(userId: string): Promise<MessageDm[]>;

  // выборка просроченных (expired) сообщений
  findExpired(): Promise<MessageDm[]>;
}
