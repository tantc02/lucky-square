'use client'

import React, { useEffect, useState } from 'react'

interface EggItem {
  eggIndex: number
  isOpened: boolean
  prizeName: string | null
}

interface EggSmashGameProps {
  playerName: string
  onBusyChange: (busy: boolean) => void
  onPrizeAwarded: () => void
}

export default function EggSmashGame({ playerName, onBusyChange, onPrizeAwarded }: EggSmashGameProps) {
  const [eggs, setEggs] = useState<EggItem[]>([])
  const [loading, setLoading] = useState(true)
  const [smashingIndex, setSmashingIndex] = useState<number | null>(null)
  const [prizeResult, setPrizeResult] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [error, setError] = useState('')

  const fetchEggs = async () => {
    try {
      const response = await fetch('/api/eggs')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Không thể tải trứng.')
      setEggs(data.eggs || [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải trứng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEggs() }, [])

  const handleEggClick = async (egg: EggItem) => {
    if (egg.isOpened) {
      setFlash(true)
      window.setTimeout(() => setFlash(false), 700)
      return
    }
    if (smashingIndex !== null) return

    setSmashingIndex(egg.eggIndex)
    onBusyChange(true)
    setError('')
    const animationDelay = new Promise((resolve) => window.setTimeout(resolve, 1250))

    try {
      const responsePromise = fetch('/api/eggs/smash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eggIndex: egg.eggIndex, playerName }),
      })
      const [response] = await Promise.all([responsePromise, animationDelay])
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 409) await fetchEggs()
        throw new Error(data.error || 'Không thể đập trứng.')
      }

      setEggs((current) => current.map((item) => item.eggIndex === egg.eggIndex
        ? { ...item, isOpened: true, prizeName: data.prizeName }
        : item))
      setPrizeResult(data.prizeName)
      onPrizeAwarded()
    } catch (smashError) {
      setError(smashError instanceof Error ? smashError.message : 'Không thể đập trứng.')
    } finally {
      setSmashingIndex(null)
      onBusyChange(false)
    }
  }

  const openedCount = eggs.filter((egg) => egg.isOpened).length

  return (
    <section className="w-full max-w-4xl py-4 text-center">
      {flash && <div aria-hidden="true" className="egg-screen-flash fixed inset-0 z-[60] pointer-events-none" />}
      <div className="mb-6">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-4xl shadow-sm">🥚</div>
        <h2 className="text-2xl font-black text-slate-900">ĐẬP TRỨNG NHẬN QUÀ</h2>
        <p className="mt-1 text-sm text-slate-500">Chọn một quả trứng còn nguyên để khám phá phần quà bên trong.</p>
        {!loading && <p className="mt-2 text-xs font-semibold text-amber-700">Đã đập {openedCount}/{eggs.length} quả</p>}
      </div>

      {loading ? <p className="py-10 text-sm text-slate-400">Đang tải trứng…</p> : eggs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-sm text-slate-500">
          Admin chưa cấu hình lượt đập trứng. Vui lòng quay lại sau.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {eggs.map((egg) => {
            const isSmashing = smashingIndex === egg.eggIndex
            return (
              <button
                key={egg.eggIndex}
                type="button"
                onClick={() => handleEggClick(egg)}
                disabled={smashingIndex !== null && !isSmashing}
                aria-label={egg.isOpened ? `Trứng ${egg.eggIndex + 1} đã đập` : `Đập trứng ${egg.eggIndex + 1}`}
                className={`relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-2xl border p-3 transition-all ${
                  egg.isOpened
                    ? 'cursor-pointer border-amber-200 bg-amber-50/70'
                    : isSmashing
                      ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-200'
                      : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg'
                } disabled:cursor-wait`}
              >
                <span className={`relative flex h-16 items-center justify-center text-5xl ${isSmashing ? 'egg-shake' : ''}`}>
                  {!egg.isOpened && !isSmashing && '🥚'}
                  {(egg.isOpened || isSmashing) && (
                    <>
                      <span className={`egg-half-left ${egg.isOpened ? 'egg-half-open' : ''}`} aria-hidden="true">🥚</span>
                      <span className={`egg-half-right ${egg.isOpened ? 'egg-half-open' : ''}`} aria-hidden="true">🥚</span>
                    </>
                  )}
                </span>
                <span className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Trứng #{String(egg.eggIndex + 1).padStart(2, '0')}</span>
                {egg.isOpened && egg.prizeName && <span className="mt-1 line-clamp-2 text-xs font-bold text-amber-800">{egg.prizeName}</span>}
                {isSmashing && <span className="mt-1 text-xs font-bold text-amber-700">Đang rung lắc…</span>}
              </button>
            )
          })}
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}

      {prizeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="egg-prize-title">
          <div className="egg-prize-popup w-full max-w-sm rounded-3xl border-2 border-amber-300 bg-white p-7 text-center shadow-2xl">
            <div className="mb-3 text-6xl">🎉</div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Bạn đã đập vỡ trứng!</p>
            <h3 id="egg-prize-title" className="mt-2 text-2xl font-black text-slate-900">{prizeResult}</h3>
            <p className="mt-2 text-sm text-slate-500">Phần quà đã được ghi nhận cho {playerName}.</p>
            <button onClick={() => setPrizeResult(null)} className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-amber-500/20">ĐÓNG</button>
          </div>
        </div>
      )}
    </section>
  )
}
