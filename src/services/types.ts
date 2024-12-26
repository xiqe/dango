export interface IWord {
  id: string;
  japanese: string;
  chinese: string;
  createdAt: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  stage: number;
  groupId?: string;
}

export interface IGroup {
  id: string;
  name: string;
  order: number;
  created_at: number;
}
