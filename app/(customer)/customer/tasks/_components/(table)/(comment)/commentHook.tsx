"use client";

import { useState, useEffect, useCallback } from "react";
import { getTaskComments } from "./comment-actions";

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
};

export function useTaskComments(taskId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetchComments function
  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const fetchedComments = await getTaskComments(taskId);

      // Debug log to verify avatarUrl is present in the fetched data
      console.log("[Debug] Fetched comments with authors:", {
        commentCount: fetchedComments.length,
        sampleComment: fetchedComments.length > 0 ? fetchedComments[0] : null,
        hasAvatarUrls: fetchedComments.map((c) => !!c.author?.avatarUrl),
        authorSample:
          fetchedComments.length > 0
            ? {
                displayName: fetchedComments[0].author.displayName,
                hasAvatarUrl: !!fetchedComments[0].author.avatarUrl,
                avatarUrl: fetchedComments[0].author.avatarUrl,
              }
            : null,
      });

      setComments(fetchedComments);
      setError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [taskId]); // Only depends on taskId

  // Effect will re-run when fetchComments changes (which happens when taskId changes)
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refreshComments: fetchComments,
  };
}

export default useTaskComments;
