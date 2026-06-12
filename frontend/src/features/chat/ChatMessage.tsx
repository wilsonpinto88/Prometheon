import ReactMarkdown from 'react-markdown'

interface Props {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export default function ChatMessage({ role, content, streaming }: Props) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] min-w-0 break-words rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-gray-700 text-gray-100 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          content
        ) : content ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              code: ({ children }) => (
                <code className="bg-gray-800 text-orange-300 rounded px-1 py-0.5 text-xs break-all">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-800 rounded-lg p-2 mb-2 overflow-x-auto text-xs">
                  {children}
                </pre>
              ),
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noreferrer" className="text-orange-300 underline">
                  {children}
                </a>
              ),
              h1: ({ children }) => <p className="font-bold text-white mb-2">{children}</p>,
              h2: ({ children }) => <p className="font-bold text-white mb-2">{children}</p>,
              h3: ({ children }) => <p className="font-semibold text-white mb-2">{children}</p>,
            }}
          >
            {content}
          </ReactMarkdown>
        ) : streaming ? (
          <span className="animate-pulse">▍</span>
        ) : null}
      </div>
    </div>
  )
}
