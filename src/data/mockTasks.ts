export interface Task {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'Coding' | 'System Design' | 'Problem Solving' | 'Research'
  points: number
  completed: boolean
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Build a Todo App',
    description: 'Create a fully functional todo application with add, edit, delete, and mark as complete features using React.',
    difficulty: 'Easy',
    type: 'Coding',
    points: 100,
    completed: true
  },
  {
    id: '2',
    title: 'Implement React Hooks',
    description: 'Build a component using useState, useEffect, and custom hooks. Demonstrate proper hook usage patterns.',
    difficulty: 'Medium',
    type: 'Coding',
    points: 200,
    completed: false
  },
  {
    id: '3',
    title: 'Design a URL Shortener',
    description: 'Design a scalable URL shortening service like bit.ly. Consider storage, caching, and rate limiting.',
    difficulty: 'Hard',
    type: 'System Design',
    points: 500,
    completed: false
  },
  {
    id: '4',
    title: 'Two Sum Problem',
    description: 'Solve the classic two sum problem with optimal time complexity. Implement multiple approaches.',
    difficulty: 'Easy',
    type: 'Problem Solving',
    points: 150,
    completed: true
  },
  {
    id: '5',
    title: 'Research: Microservices vs Monolith',
    description: 'Research and write a comprehensive comparison of microservices and monolithic architectures.',
    difficulty: 'Medium',
    type: 'Research',
    points: 250,
    completed: false
  },
  {
    id: '6',
    title: 'Build a Weather App',
    description: 'Create a weather application that fetches data from an API and displays it with a beautiful UI.',
    difficulty: 'Easy',
    type: 'Coding',
    points: 120,
    completed: false
  },
  {
    id: '7',
    title: 'Design a Chat System',
    description: 'Design a real-time chat system supporting millions of users. Consider WebSockets, message delivery, and scaling.',
    difficulty: 'Hard',
    type: 'System Design',
    points: 600,
    completed: false
  },
  {
    id: '8',
    title: 'Binary Tree Traversal',
    description: 'Implement all three binary tree traversal methods: inorder, preorder, and postorder.',
    difficulty: 'Medium',
    type: 'Problem Solving',
    points: 300,
    completed: false
  },
  {
    id: '9',
    title: 'Research: GraphQL vs REST',
    description: 'Compare GraphQL and REST APIs. When to use each? Write a detailed analysis with examples.',
    difficulty: 'Medium',
    type: 'Research',
    points: 200,
    completed: false
  }
]

