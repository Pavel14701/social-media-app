import { PostDm } from "../../domain/entities/post.entity";
import { IBaseRepository } from "./base-repository.interface";

export interface IPostRepository extends IBaseRepository<PostDm> {
  create(entity: PostDm): Promise<PostDm>;
  findByAuthor(authorName: string): Promise<PostDm[]>;
  searchByTitle(query: string): Promise<PostDm[]>;
  findSorted(sortBy: string): Promise<PostDm[]>;
  paginate(page: number, pageSize: number): Promise<{ data: PostDm[]; count: number }>;
  incrementLikeCount(postId: string): Promise<void>;
  incrementCommentCount(postId: string): Promise<void>;
}
