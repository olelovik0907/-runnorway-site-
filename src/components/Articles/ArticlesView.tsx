import React, { useState } from 'react';
import { ArticleList } from './ArticleList';
import { ArticleDetail } from './ArticleDetail';

export function ArticlesView() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  if (selectedArticleId) {
    return (
      <ArticleDetail
        articleId={selectedArticleId}
        onBack={() => setSelectedArticleId(null)}
      />
    );
  }

  return <ArticleList onArticleClick={setSelectedArticleId} />;
}
