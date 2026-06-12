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
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-gray-700 text-gray-100 rounded-bl-sm'
        }`}
      >
        {content || (streaming ? <span className="animate-pulse">▍</span> : null)}
      </div>
    </div>
  )
}
