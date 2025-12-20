import { PostDm } from "../../domain/entities/post.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IPostRepository extends IBaseRepository<PostDm> {
  create(entity: PostDm): Promise<PostDm>;

  // выборка по автору (по имени)
  findByAuthor(authorName: string): Promise<PostDm[]>;

  // поиск по заголовку
  searchByTitle(query: string): Promise<PostDm[]>;

  // поиск по содержимому
  searchInContent(keyword: string): Promise<PostDm[]>;

  // сортировка по полю
  findSorted(sortBy: string): Promise<PostDm[]>;

  // пагинация
  paginate(page: number, pageSize: number): Promise<{ data: PostDm[]; count: number }>;

  // инкременты
  incrementLikeCount(postId: string): Promise<void>;
  incrementCommentCount(postId: string): Promise<void>;
  incrementViewCount(postId: string): Promise<void>;

  // обновление контента
  updateContent(postId: string, newTitle: string, newContent: string): Promise<PostDm | null>;

  // удаление
  deletePost(postId: string): Promise<void>;
  deleteByAuthor(authorId: string): Promise<void>;

  // подсчёты
  countByAuthor(authorId: string): Promise<number>;

  // выборки
  findRecentByAuthor(authorId: string, limit: number): Promise<PostDm[]>;
  findByTags(tags: string[]): Promise<PostDm[]>;
  findPublished(): Promise<PostDm[]>;
  findDrafts(): Promise<PostDm[]>;
  findByCategory(category: string): Promise<PostDm[]>;

  // топы
  findMostLiked(limit: number): Promise<PostDm[]>;
  findLeastLiked(limit: number): Promise<PostDm[]>;
  findMostViewed(limit: number): Promise<PostDm[]>;
  findLeastViewed(limit: number): Promise<PostDm[]>;
  findWithoutComments(limit: number): Promise<PostDm[]>;

  // агрегаты
  getTopAuthors(limit: number): Promise<{ authorId: string; count: number }[]>;
  getTrendingTags(limit: number): Promise<{ tag: string; count: number }[]>;
}
