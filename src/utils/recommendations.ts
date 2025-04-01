import { useReactionsStore } from '../stores/reactionsStore';

interface ContentScore {
  contentId: string;
  score: number;
}

export function calculateRecommendationScore(contentId: string): number {
  const {
    getContentReactions,
    getContentComments,
    getContentRating,
  } = useReactionsStore.getState();

  const reactions = getContentReactions(contentId);
  const comments = getContentComments(contentId);
  const rating = getContentRating(contentId);

  let score = 0;

  // Pontuação baseada nas reações
  reactions.forEach((reaction) => {
    switch (reaction.type) {
      case 'like':
        score += 1;
        break;
      case 'love':
        score += 2;
        break;
      case 'wow':
        score += 1.5;
        break;
      case 'sad':
        score += 0.5;
        break;
    }
  });

  // Pontuação baseada nos comentários
  score += comments.length * 0.5;

  // Pontuação baseada na avaliação
  if (rating) {
    score += rating.score;
  }

  return score;
}

export function getRecommendedContent(
  contentIds: string[],
  limit: number = 10
): string[] {
  const scores: ContentScore[] = contentIds.map((id) => ({
    contentId: id,
    score: calculateRecommendationScore(id),
  }));

  // Ordena por pontuação e retorna os IDs dos top N conteúdos
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.contentId);
}
