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
