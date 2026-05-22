import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './shared/layout/Layout'
import ErrorBoundary from './shared/components/ErrorBoundary'

const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SacredTextsPage = lazy(() => import('./pages/SacredTextsPage'))
const SacredTextDetailPage = lazy(() => import('./pages/SacredTextDetailPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const TaskDetailPage = lazy(() => import('./pages/TaskDetailPage'))

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
      <p className="text-gray-400 text-lg">Page not found</p>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-primary-500 text-lg animate-pulse">Loading...</div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sacred-texts" element={<SacredTextsPage />} />
              <Route path="/sacred-texts/:id" element={<SacredTextDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
