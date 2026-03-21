import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Leaf, TrendingUp, Recycle, TreePine, Droplets } from "lucide-react"

export default function Carbon() {
  const listings = useQuery(api.listings.list)

  const totalCarbon = listings?.reduce((sum, l) => sum + l.carbonSaved, 0) ?? 0
  const totalListings = listings?.length ?? 0
  const totalSaved = listings?.reduce(
    (sum, l) => sum + (l.originalPrice - l.price),
    0
  ) ?? 0

  const stats = [
    {
      icon: Leaf,
      label: "CO2 Prevented",
      value: `${totalCarbon} kg`,
      color: "text-primary",
      bg: "bg-green-bg",
    },
    {
      icon: Recycle,
      label: "Materials Reused",
      value: `${totalListings}`,
      color: "text-primary",
      bg: "bg-green-bg",
    },
    {
      icon: TrendingUp,
      label: "Money Saved",
      value: `$${totalSaved.toLocaleString()}`,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: TreePine,
      label: "Trees Equivalent",
      value: `${Math.round(totalCarbon / 22)}`,
      color: "text-primary",
      bg: "bg-green-bg",
    },
  ]

  const equivalents = [
    {
      icon: "\u{1F697}",
      label: "km of driving offset",
      value: Math.round(totalCarbon * 6.2),
    },
    {
      icon: "\u{1F4A1}",
      label: "hours of energy saved",
      value: Math.round(totalCarbon * 2.8),
    },
    {
      icon: "\u{1F4A7}",
      label: "liters of water saved",
      value: Math.round(totalCarbon * 42),
    },
  ]

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <h1 className="text-lg font-bold tracking-tight">Carbon Impact</h1>
      </div>

      <div className="space-y-6 px-5 pb-8">
        {/* Hero stat */}
        <div className="animate-fade-up rounded-3xl border border-green-bg-dark bg-gradient-to-br from-green-bg to-green-bg-dark p-6 text-center">
          <Leaf size={28} className="mx-auto mb-2 text-primary" />
          <div className="text-4xl font-extrabold text-primary">
            {totalCarbon} kg
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-green-dark">
            Total CO2 Emissions Prevented
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map(({ icon: Icon, label, value, color, bg }, i) => (
            <div
              key={label}
              className={`animate-fade-up stagger-${i + 1} rounded-2xl border border-border bg-card p-4`}
            >
              <div
                className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={18} className={color} />
              </div>
              <div className="text-lg font-extrabold">{value}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Equivalents */}
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            That&apos;s equivalent to
          </h2>
          <div className="space-y-2">
            {equivalents.map(({ icon, label, value }, i) => (
              <div
                key={label}
                className={`animate-fade-up stagger-${i + 1} flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5`}
              >
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <span className="text-base font-extrabold">
                    {value.toLocaleString()}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community message */}
        <div className="rounded-2xl bg-muted/50 p-4 text-center">
          <Droplets size={20} className="mx-auto mb-1.5 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Every material reused is one less in a landfill. Together, our
            community is building a more sustainable future.
          </p>
        </div>
      </div>
    </>
  )
}
