
export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Course {
  id: string;
  title: string;
  channelName: string;
  channelUrl: string;
  channelThumbnailUrl?: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  skills: string[];
  category: string;
  difficulty: Difficulty;
  rating: number;
  dateAdded: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
