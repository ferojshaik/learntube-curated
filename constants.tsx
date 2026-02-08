
import { Course, Category, Difficulty } from './types';

/**
 * Owner access: only a SHA-256 hash is stored — the real password is never in the code or bundle.
 * To set your own password: run in terminal (Node.js):
 *   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
 * Then replace the value below with the printed hash. Never commit the plain password.
 */
export const OWNER_PASSWORD_HASH = '1b55e37fe874f69fe057063d9d9a7edb02bfa4e03dae5b3fad36605102c90e7d';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Web Development', icon: '🌐' },
  { id: '2', name: 'Data Science', icon: '📊' },
  { id: '3', name: 'Design', icon: '🎨' },
  { id: '4', name: 'Business', icon: '💼' },
  { id: '5', name: 'Marketing', icon: '📈' },
  { id: '6', name: 'Personal Development', icon: '🌱' },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'React.js Full Course 2024',
    channelName: 'FreeCodeCamp',
    channelUrl: 'https://www.youtube.com/@freecodecamp',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    thumbnailUrl: 'https://picsum.photos/seed/react/800/450',
    description: 'Master React.js from scratch. Learn components, hooks, and context API with hands-on projects.',
    skills: ['React', 'JavaScript', 'Frontend'],
    category: 'Web Development',
    difficulty: Difficulty.BEGINNER,
    rating: 4.9,
    dateAdded: '2024-01-15'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    channelName: 'Programming with Mosh',
    channelUrl: 'https://www.youtube.com/@programmingwithmosh',
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    thumbnailUrl: 'https://picsum.photos/seed/python/800/450',
    description: 'Learn Python programming for data analysis and visualization. Perfect for beginners entering AI.',
    skills: ['Python', 'Pandas', 'Data Analysis'],
    category: 'Data Science',
    difficulty: Difficulty.BEGINNER,
    rating: 4.8,
    dateAdded: '2024-02-10'
  }
];
