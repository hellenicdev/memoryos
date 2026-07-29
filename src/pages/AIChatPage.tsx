import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, MessageSquare, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import api from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  _id: string
  title: string
  messages: Message[]
  createdAt: string
}

const AIChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/ai/conversations')
      setConversations(res.data.conversations || [])
    } catch {}
  }

  const startNewConversation = async () => {
    try {
      const res = await api.post('/ai/conversations', { title: 'New conversation' })
      setActiveConversation(res.data.conversation._id)
      setMessages([])
      fetchConversations()
    } catch {}
  }

  const loadConversation = async (conv: Conversation) => {
    setActiveConversation(conv._id)
    setMessages(conv.messages || [])
  }

  const deleteConversation = async (id: string) => {
    try {
      await api.delete(`/ai/conversations/${id}`)
      if (activeConversation === id) {
        setActiveConversation(null)
        setMessages([])
      }
      fetchConversations()
    } catch {}
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', {
        message: userMessage.content,
        conversationId: activeConversation,
      })

      const aiMessage: Message = { role: 'assistant', content: res.data.answer }
      setMessages((prev) => [...prev, aiMessage])
      if (!activeConversation) {
        fetchConversations()
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, AI service is currently unavailable.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    'Summarize my recent documents',
    'What did I buy recently?',
    'Show me important dates',
    'What projects am I working on?',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: 260, borderRight: '1px solid var(--border)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
          overflow: 'auto',
        }}>
          <button className="button button-primary" onClick={startNewConversation} style={{ justifyContent: 'center', marginBottom: 8 }}>
            <MessageSquare size={14} /> New chat
          </button>

          {conversations.map((conv) => (
            <div
              key={conv._id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
                background: activeConversation === conv._id ? 'var(--bg-card)' : 'transparent',
              }}
              onClick={() => loadConversation(conv)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseLeave={(e) => {
                if (activeConversation !== conv._id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <MessageSquare size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.title}
              </span>
              <button
                className="button-ghost"
                onClick={(e) => { e.stopPropagation(); deleteConversation(conv._id) }}
                style={{ padding: 2, color: 'var(--danger)', opacity: 0.6 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <div className="ai-chat-messages" style={{ flex: 1, padding: '24px 24px 0' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <Bot size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <h2 style={{ marginBottom: 8 }}>Ask your MemoryOS anything</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                  I can answer questions based on your stored memories and documents
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      className="suggested-question"
                      onClick={() => { setInput(q); setTimeout(() => handleSend(), 100) }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                <div className="ai-message-avatar" style={msg.role === 'user' ? { background: 'var(--primary)' } : {}}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="ai-message-content">
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message">
                <div className="ai-message-avatar"><Bot size={16} /></div>
                <div className="ai-message-content">
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input" style={{ padding: '16px 24px' }}>
            <input
              placeholder="Ask a question about your memories..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
            <button className="button button-primary" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AIChatPage
