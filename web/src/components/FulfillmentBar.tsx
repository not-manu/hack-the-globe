interface FulfillmentBarProps {
  fulfilled: number
  total: number
  unit: string
  /** compact = inline on cards, full = large on detail page */
  size?: 'compact' | 'full'
  /** Show the text label */
  showLabel?: boolean
}

export function FulfillmentBar({
  fulfilled,
  total,
  unit,
  size = 'compact',
  showLabel = true,
}: FulfillmentBarProps) {
  const pct = total > 0 ? Math.min((fulfilled / total) * 100, 100) : 0
  const isFull = pct >= 100
  const isHigh = pct >= 75
  const isMid = pct >= 40

  // Color stops: low = gray-ish green, mid = green, high = vibrant green, full = gold
  const barColor = isFull
    ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
    : isHigh
      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
      : isMid
        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
        : 'bg-gradient-to-r from-green-600 to-green-500'

  const barGlow = isFull
    ? 'shadow-[0_0_12px_rgba(251,191,36,0.5)]'
    : isHigh
      ? 'shadow-[0_0_8px_rgba(34,197,94,0.4)]'
      : ''

  const isCompact = size === 'compact'

  return (
    <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
      {showLabel && (
        <div className={`flex items-center justify-between ${isCompact ? 'text-[10px]' : 'text-sm'}`}>
          <span className="font-semibold text-foreground">
            {fulfilled}/{total} {unit}
          </span>
          <span
            className={`font-bold ${
              isFull
                ? 'text-amber-500'
                : isHigh
                  ? 'text-emerald-500'
                  : 'text-muted-foreground'
            }`}
          >
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        className={`relative overflow-hidden rounded-full bg-muted ${
          isCompact ? 'h-2' : 'h-4'
        }`}
      >
        {/* Track marks for game-like feel */}
        {!isCompact && (
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-full flex-1 border-r border-background/20 last:border-r-0"
              />
            ))}
          </div>
        )}

        {/* Fill bar */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${barColor} ${barGlow} ${
            isFull ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
        >
          {/* Shine effect */}
          {!isCompact && pct > 10 && (
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-b from-white/30 to-transparent" style={{ height: '50%' }} />
            </div>
          )}
        </div>
      </div>
      {isFull && !isCompact && (
        <p className="text-center text-xs font-bold text-amber-500">
          Fully Fulfilled!
        </p>
      )}
    </div>
  )
}
