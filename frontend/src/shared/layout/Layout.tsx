import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatPanel from '../../features/chat/ChatPanel'
import { useChatStore } from '../store/chatStore'
import { useAuthContext } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { openChat } = useChatStore()
  const { isAuthenticated } = useAuthContext()

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-grow">{children}</main>
      <Footer />
      {isAuthenticated && (
        <>
          <button
            onClick={() => openChat()}
            className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-colors"
            aria-label="Open AI study assistant"
            title="AI Study Assistant"
          >
            ⚡
          </button>
          <ChatPanel />
        </>
      )}
    </div>
  )
}

export default Layout
