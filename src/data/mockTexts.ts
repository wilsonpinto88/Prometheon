export interface SacredText {
  id: string
  title: string
  author: string
  realm: string
  description: string
  pages: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  completed: boolean
}

/**
 * Sacred Texts - The 10 Books for 10x Software Engineers
 * 
 * These are the canonical books that form the foundation of the Prometheon learning platform.
 * This list is based on the "10 Books for Software Engineers" standard and should not be modified
 * without updating the convention documentation.
 * 
 * Reference: Docs/01-Technology-Stack.md - Sacred Texts Convention
 */
export const mockTexts: SacredText[] = [
  {
    id: '1',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    realm: 'Tartarus',
    description: 'It\'ll teach you the core software development process.',
    pages: 352,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '2',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    realm: 'Asgard',
    description: 'It\'ll teach you distributed systems.',
    pages: 616,
    difficulty: 'Advanced',
    completed: false
  },
  {
    id: '3',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    realm: 'Valhalla',
    description: 'It\'ll give you advice on managing large-scale projects.',
    pages: 336,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '4',
    title: 'Refactoring',
    author: 'Martin Fowler',
    realm: 'Midgard',
    description: 'It\'ll give you techniques to restructure code to enhance its maintainability.',
    pages: 448,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '5',
    title: 'Software Architecture: The Hard Parts',
    author: 'Neal Ford, Mark Richards, Pramod Sadalage, Zhamak Dehghani',
    realm: 'Elysium',
    description: 'It\'ll teach you how to make better architectural decisions with tradeoffs.',
    pages: 400,
    difficulty: 'Advanced',
    completed: false
  },
  {
    id: '6',
    title: 'Working Effectively with Legacy Code',
    author: 'Michael C. Feathers',
    realm: 'Gaia',
    description: 'It\'ll teach you techniques to refactor legacy code.',
    pages: 464,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '7',
    title: 'Database Internals',
    author: 'Alex Petrov',
    realm: 'Prometheon',
    description: 'It\'ll teach you how databases work: storage engines and distributed systems.',
    pages: 376,
    difficulty: 'Advanced',
    completed: false
  },
  {
    id: '8',
    title: 'A Philosophy of Software Design',
    author: 'John Ousterhout',
    realm: 'Midgard',
    description: 'It\'ll teach you how to write clean and maintainable code.',
    pages: 190,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '9',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    realm: 'Midgard',
    description: 'It\'ll teach you practices to write easy-to-understand code and refactor.',
    pages: 464,
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: '10',
    title: 'Why Programs Fail',
    author: 'Andreas Zeller',
    realm: 'Asgard',
    description: 'It\'ll teach you systematic debugging.',
    pages: 480,
    difficulty: 'Advanced',
    completed: false
  }
]

