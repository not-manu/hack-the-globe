import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Leaf, TrendingUp, Recycle, TreePine, Droplets } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useMemo } from "react"

// --- Chart configs ---

const areaConfig = {
  carbon: { label: "CO2 Saved (kg)", color: "var(--green)" },
} satisfies ChartConfig

const barConfig = {
  carbon: { label: "CO2 (kg)", color: "var(--green)" },
} satisfies ChartConfig

const pieConfig = {
  lumber: { label: "Lumber", color: "#16a34a" },
  steel: { label: "Steel", color: "#0d9488" },
  concrete: { label: "Concrete", color: "#6366f1" },
  brick: { label: "Brick", color: "#ea580c" },
  glass: { label: "Glass", color: "#0ea5e9" },
  pipe: { label: "Piping", color: "#8b5cf6" },
  electrical: { label: "Electrical", color: "#eab308" },
  fixtures: { label: "Fixtures", color: "#ec4899" },
} satisfies ChartConfig

const PIE_COLORS = [
  "#16a34a", "#0d9488", "#6366f1", "#ea580c",
  "#0ea5e9", "#8b5cf6", "#eab308", "#ec4899",
]

export default function Carbon() {
  const listings = useQuery(api.listings.list)

  const totalCarbon = listings?.reduce((sum, l) => sum + l.carbonSaved, 0) ?? 0
  const totalListings = listings?.length ?? 0
  const totalSaved =
    listings?.reduce((sum, l) => sum + (l.originalPrice - l.price), 0) ?? 0

  // Simulated monthly trend (cumulative from listings)
  const monthlyData = useMemo(() => {
    if (!listings || listings.length === 0) return []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    // Deterministic growth curve (roughly exponential ramp-up)
    const weights = [0.08, 0.15, 0.18, 0.2, 0.22, 0.17]
    let cumulative = 0
    return months.map((month, i) => {
      cumulative += Math.round(totalCarbon * weights[i])
      return { month, carbon: Math.min(cumulative, totalCarbon) }
    })
  }, [listings, totalCarbon])

  // Carbon by category (from actual listings)
  const categoryData = useMemo(() => {
    if (!listings) return []
    const map: Record<string, number> = {}
    for (const l of listings) {
      map[l.category] = (map[l.category] ?? 0) + l.carbonSaved
    }
    return Object.entries(map)
      .map(([category, carbon]) => ({ category, carbon }))
      .sort((a, b) => b.carbon - a.carbon)
  }, [listings])

  // Pie data from categories
  const pieData = useMemo(() => {
    if (!listings) return []
    const map: Record<string, number> = {}
    for (const l of listings) {
      map[l.category] = (map[l.category] ?? 0) + 1
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [listings])

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
    { icon: "\u{1F697}", label: "km of driving offset", value: Math.round(totalCarbon * 6.2) },
    { icon: "\u{1F4A1}", label: "hours of energy saved", value: Math.round(totalCarbon * 2.8) },
    { icon: "\u{1F4A7}", label: "liters of water saved", value: Math.round(totalCarbon * 42) },
  ]

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 px-5 pb-3 pt-4 backdrop-blur-lg">
        <h1 className="text-lg font-bold tracking-tight">Carbon Impact</h1>
      </div>

      <div className="space-y-5 px-5 pb-8">
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
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <div className="text-lg font-extrabold">{value}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Carbon over time — area chart */}
        {monthlyData.length > 0 && (
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-bold">Savings Over Time</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Cumulative CO2 prevented (kg)
            </p>
            <ChartContainer config={areaConfig} className="h-[180px] w-full">
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--green)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="carbon"
                  stroke="var(--green)"
                  strokeWidth={2.5}
                  fill="url(#carbonGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}

        {/* Carbon by category — bar chart */}
        {categoryData.length > 0 && (
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-bold">By Category</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">
              CO2 saved per material type (kg)
            </p>
            <ChartContainer config={barConfig} className="h-[180px] w-full">
              <BarChart data={categoryData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  width={35}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="carbon" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {/* Material breakdown — donut */}
        {pieData.length > 0 && (
          <div className="animate-fade-up rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-bold">Material Breakdown</h2>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Listings by category
            </p>
            <ChartContainer config={pieConfig} className="mx-auto h-[200px] w-full max-w-[260px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 6}
                              className="fill-foreground text-2xl font-extrabold"
                            >
                              {totalListings}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 14}
                              className="fill-muted-foreground text-[10px]"
                            >
                              listings
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* Legend */}
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
