export interface IWord {
  id: string;
  japanese: string;
  chinese: string;
  createdAt: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  stage: number;
}
