import { useState, useEffect } from 'react'
import axios from 'axios'

interface Connected {
  claude: boolean
  openai: boolean
  gemini: boolean
}

const PROVIDERS = [
  { id: 'claude', label: 'Claude (Anthropic)', placeholder: 'sk-ant-...' },
  { id: 'openai', label: 'OpenAI (GPT)', placeholder: 'sk-...' },
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
] as const

type Provider = 'claude' | 'openai' | 'gemini'

export default function SettingsPage() {
  const [connected, setConnected] = useState<Connected>({ claude: false, openai: false, gemini: false })
  const [preferred, setPreferred] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<Provider, string>>({ claude: '', openai: '', gemini: '' })
  const [status, setStatus] = useState<Record<Provider, string>>({ claude: '', openai: '', gemini: '' })

  const token = localStorage.getItem('auth_token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('/api/user/ai-keys', { headers }).then(({ data }) => {
      setConnected(data.connected)
      setPreferred(data.preferred)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (provider: Provider) => {
    const key = inputs[provider].trim()
    if (!key) return
    try {
      await axios.put(`/api/user/ai-keys/${provider}`, { key }, { headers })
      setConnected((c) => ({ ...c, [provider]: true }))
      setStatus((s) => ({ ...s, [provider]: 'Saved' }))
      setInputs((i) => ({ ...i, [provider]: '' }))
    } catch {
      setStatus((s) => ({ ...s, [provider]: 'Error saving key' }))
    }
    setTimeout(() => setStatus((s) => ({ ...s, [provider]: '' })), 3000)
  }

  const remove = async (provider: Provider) => {
    await axios.delete(`/api/user/ai-keys/${provider}`, { headers })
    setConnected((c) => ({ ...c, [provider]: false }))
    if (preferred === provider) setPreferred(null)
  }

  const makePreferred = async (provider: Provider) => {
    await axios.patch(`/api/user/ai-keys/${provider}/preferred`, {}, { headers })
    setPreferred(provider)
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">
        Connect your AI provider keys. Keys are encrypted and stored securely — they never leave the server after saving.
      </p>

      <h2 className="text-lg font-semibold text-white mb-4">AI Providers</h2>

      <div className="space-y-4">
        {PROVIDERS.map(({ id, label, placeholder }) => (
          <div key={id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{label}</span>
                {connected[id] && (
                  <span className="text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                )}
                {preferred === id && (
                  <span className="text-xs bg-orange-800 text-orange-300 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              {connected[id] && (
                <div className="flex gap-2">
                  {preferred !== id && (
                    <button
                      onClick={() => makePreferred(id)}
                      className="text-xs text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => remove(id)}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={inputs[id]}
                onChange={(e) => setInputs((i) => ({ ...i, [id]: e.target.value }))}
                placeholder={connected[id] ? '••••••••••••••• (update key)' : placeholder}
                className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500"
                aria-label={`${label} API key`}
              />
              <button
                onClick={() => save(id)}
                disabled={!inputs[id].trim()}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>

            {status[id] && (
              <p className="text-xs mt-2 text-green-400">{status[id]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
