export interface IWord {
  id: string;
  japanese: string; // 日文
  chinese: string; // 中文
  pronunciation?: string; // 注音
  example?: string; // 例句
  createdAt: number; // 创建时间
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
