'use client'

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Users, Loader2, Clock } from 'lucide-react'

export default function BroadcastsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const supabase = createClient()

  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [subCount, setSubCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const loadCount = async () => {
    setLoadingCount(true)
    const { count } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('business_slug', slug)
    setSubCount(count || 0)
    setLoadingCount(false)
  }

  const loadHistory = async () => {
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('business_slug', slug)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
    setHistoryLoaded(true)
  }

  useEffect(() => { loadCount(); loadHistory() }, [slug])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessSlug: slug, message }),
      })
      const data = await res.json()
      if (data.sent !== undefined) {
        setResult({ sent: data.sent, total: data.total })
        setMessage('')
        loadHistory()
        loadCount()
      }
    } catch (e) {
      console.error(e)
    }
    setSending(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Рассылки</h1>
        <p className="text-gray-500 mt-1">Отправка сообщений через Telegram-бот</p>
      </div>

      {/* Инфо-блок */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Users size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Telegram-рассылка</p>
            <p className="text-sm text-blue-700 mb-3">
              Клиенты подписываются через бота. Ссылка для подписки:
            </p>
            <code className="block bg-white text-sm px-3 py-2 rounded-lg border border-blue-200 text-blue-800 break-all">
              https://t.me/linkalink_notify_bot?start={slug}
            </code>
            <button onClick={loadCount} disabled={loadingCount}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
              {loadingCount && <Loader2 size={12} className="animate-spin" />}
              Обновить число подписчиков
            </button>
            {subCount !== null && (
              <p className="mt-1.5 text-sm font-bold text-blue-900">
                👥 Подписчиков: {subCount}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Форма */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Сообщение</label>
        <p className="text-xs text-gray-400 mb-3">
          Поддерживается HTML: <code className="bg-gray-100 px-1 rounded">&lt;b&gt;</code> жирный,
          <code className="bg-gray-100 px-1 rounded ml-1">&lt;i&gt;</code> курсив,
          <code className="bg-gray-100 px-1 rounded ml-1">&lt;a href="..."&gt;</code> ссылка
        </p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          placeholder={`🔥 <b>Горячая акция!</b>\n\nСкидка 20% на все услуги до конца недели!\n\nЗаписывайтесь: ваш-сайт.ru`}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{message.length} символов</p>

        {/* Превью */}
        {message && (
          <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Превью</p>
            <div className="text-sm text-gray-800 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:shadow-lg"
        >
          {sending
            ? <><Loader2 size={16} className="animate-spin" />Отправляем...</>
            : <><Send size={16} />Отправить всем подписчикам</>
          }
        </button>

        {result && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-bold">✅ Рассылка отправлена!</p>
            <p className="text-green-600 text-sm mt-1">
              Доставлено: {result.sent} из {result.total} подписчиков
            </p>
          </div>
        )}
      </div>

      {/* История */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" /> История рассылок
        </h2>
        {!historyLoaded ? (
          <div className="text-center text-gray-400 text-sm py-4">Загрузка...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">Рассылок пока не было</div>
        ) : (
          <div className="space-y-3">
            {history.map(b => (
              <div key={b.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleString('ru-RU')}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                    Отправлено: {b.sent_count}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {b.message?.replace(/<[^>]+>/g, '') || ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}