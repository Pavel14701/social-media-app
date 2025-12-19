import { Injectable } from '@nestjs/common';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { Post } from '../../posts/schemas/post.schema';

@Injectable()
export class PostService {
  constructor(private readonly postRepo: PostRepository) {}

  async getUserPosts(userId: string): Promise<{ posts: Post[]; likeCount: number }> {
    const posts = await this.postRepo.findByPoster(userId);
    const likeCount = posts.reduce((sum, post) => sum + post.likeCount, 0);
    return { posts, likeCount };
  }
}
