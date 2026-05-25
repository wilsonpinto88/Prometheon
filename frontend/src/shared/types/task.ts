export interface Task {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  type: 'Coding' | 'System Design' | 'Problem Solving' | 'Research'
  points: number
  completed: boolean
}
