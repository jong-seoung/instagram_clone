package com.jong.backend.service;

import com.jong.backend.dto.PostRequest;
import com.jong.backend.dto.PostResponse;
import com.jong.backend.entity.Post;
import com.jong.backend.entity.User;
import com.jong.backend.exception.ResourceNotFoundException;
import com.jong.backend.exception.UnauthorizedException;
import com.jong.backend.repository.CommentRepository;
import com.jong.backend.repository.LikeRepository;
import com.jong.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final AuthenticationService authenticationService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostResponse createPost(PostRequest request) {
        User currentUser = authenticationService.getCurrentUser();

        Post post = Post.builder()
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .user(currentUser)
                .deleted(false)
                .build();

        post = postRepository.save(post);
        return PostResponse.fromEntity(post);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        User currentUser = authenticationService.getCurrentUser();
        Page<Post> posts = postRepository.findAllActive(pageable);
        return posts.map(post -> {
            PostResponse response = PostResponse.fromEntity(post);
            Long likeCount = likeRepository.countByPostId(post.getId());
            boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);
            Long commentCount = commentRepository.countByPostId(post.getId());

            response.setLikeCount(likeCount);
            response.setLiked(isLiked);
            response.setCommentCount(commentCount);

            return response;
        });
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getUserPosts(Long userId, Pageable pageable) {
        User currentUser = authenticationService.getCurrentUser();
        Page<Post> posts = postRepository.findByUserIdAndNotDeleted(userId, pageable);
        return posts.map(post -> {
            PostResponse response = PostResponse.fromEntity(post);
            Long likeCount = likeRepository.countByPostId(post.getId());
            boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);
            Long commentCount = commentRepository.countByPostId(post.getId());

            response.setLikeCount(likeCount);
            response.setLiked(isLiked);
            response.setCommentCount(commentCount);

            return response;
        });
    }

    @Transactional(readOnly = true)
    public Long getUserPostCount(Long userId) {
        authenticationService.getCurrentUser();
        return postRepository.countByUserIdAndNotDeleted(userId);
    }

    public PostResponse updatePost(Long postId, PostRequest request) {
        User currentUser = authenticationService.getCurrentUser();
        Post post = postRepository.findByIdAndNotDeleted(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this post");
        }

        post.setContent(request.getContent());

        post = postRepository.save(post);
        return PostResponse.fromEntity(post);
    }

    public void deletePost(Long postId) {
        User currentUser = authenticationService.getCurrentUser();
        Post post = postRepository.findByIdAndNotDeleted(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this post");
        }

        post.setDeleted(true);
        postRepository.save(post);
    }
}