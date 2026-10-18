import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchUnits, unitLabel, useAsync } from '../lib/api'
import { AM_SUBTYPE_LABELS, UNIT_KIND_LABELS, type UnitKind } from '../lib/types'
import { Loading } from '../components/ui'

export function UnitsPage({ kind }: { kind: UnitKind }) {
  const { data, loading, error } = useAsync(() => fetchUnits(kind), [kind])
  const [sub, setSub] = useState<string>('chinh')
  if (loading) return <Loading />
  if (error) return <p className="text-coral">Lỗi: {error}</p>
  const units = (data ?? []).filter((u) => kind !== 'am' || u.subtype === sub)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold">Đảo {UNIT_KIND_LABELS[kind]}</h1>
      {kind === 'am' && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(AM_SUBTYPE_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setSub(k)}
              className={`rounded-2xl px-5 py-3 font-display text-xl font-bold ${sub === k ? 'bg-ocean text-white' : 'bg-white/80 text-ocean-deep'}`}>{v}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {units.map((u, i) => (
          <Link key={u.id} to={`/unit/${u.id}`}
            className="flex aspect-square animate-pop items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-white to-aqua text-center font-display text-4xl font-extrabold text-ocean-deep shadow-lg transition hover:scale-110"
            style={{ animationDelay: `${i * 30}ms` }}>
            <span className={unitLabel(u).length > 4 ? 'px-2 text-lg' : ''}>{unitLabel(u)}</span>
          </Link>
        ))}
      </div>
      {units.length === 0 && <p>Chưa có nội dung.</p>}
    </div>
  )
}
