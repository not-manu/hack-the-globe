import { Leaf, TreePine, DollarSign, ArrowDownRight, FileText, TrendingUp, Recycle } from 'lucide-react'
import { CARBON_STATS } from '../data/listings'

function StatCard({ icon: Icon, label, value, unit, color, index }) {
  return (
    <div className={`fade-up stagger-${index + 1}`} style={{
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--text-muted)',
        }}>{label}</span>
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        color,
        lineHeight: 1,
      }}>
        {value}
      </div>
      {unit && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{unit}</div>
      )}
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value))

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      height: 120,
    }}>
      {data.map((d, i) => {
        const height = (d.value / max) * 100
        return (
          <div key={d.month} className={`fade-up stagger-${i + 1}`} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)' }}>
              {d.value}
            </span>
            <div style={{
              width: '100%',
              height: `${height}%`,
              background: i === data.length - 1
                ? 'var(--green)'
                : 'var(--green-bg-dark)',
              borderRadius: '6px 6px 3px 3px',
              minHeight: 8,
              transition: 'height 0.5s ease-out',
            }} />
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}>
              {d.month}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Carbon() {
  return (
    <>
      <div className="page-header">
        <h1>Carbon <span className="accent">Impact</span></h1>
        <div className="badge badge-green">
          <TrendingUp size={10} />
          +23% this month
        </div>
      </div>

      <div style={{ padding: '12px 20px 20px' }}>
        {/* Hero stat */}
        <div className="fade-up" style={{
          background: 'var(--green-bg)',
          border: '1.5px solid var(--green-bg-dark)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          textAlign: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--green)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Leaf size={22} color="white" />
          </div>
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'var(--green)',
            lineHeight: 1,
          }}>
            {CARBON_STATS.totalSaved}
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--green-dark)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginTop: 6,
          }}>
            KG CO2 Prevented
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 8,
          }}>
            Across {CARBON_STATS.transactions} transactions this season
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}>
          <StatCard icon={TreePine} label="Equivalent" value={CARBON_STATS.treesEquivalent} unit="Trees planted" color="#16a34a" index={0} />
          <StatCard icon={DollarSign} label="Money Saved" value={`$${CARBON_STATS.moneySaved.toLocaleString()}`} unit="vs. retail" color="#d97706" index={1} />
          <StatCard icon={ArrowDownRight} label="Diverted" value="2.1T" unit="from landfill" color="#16a34a" index={2} />
          <StatCard icon={Recycle} label="Reuse Rate" value="94%" unit="materials reused" color="#059669" index={3} />
        </div>

        {/* Monthly chart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Monthly Impact</span>
            <span className="badge badge-gray">6 months</span>
          </div>
          <BarChart data={CARBON_STATS.monthlyData} />
        </div>

        {/* Export reports */}
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Compliance Reports</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {[
            { name: 'Buy Clean Act Report', status: 'Ready', type: 'PDF' },
            { name: 'Carbon Credits Summary', status: 'Ready', type: 'CSV' },
            { name: 'Tax Credit Documentation', status: 'Pending', type: 'PDF' },
          ].map((report, i) => (
            <button key={report.name} className={`fade-up stagger-${i + 1}`} style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={16} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{report.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.type}</div>
                </div>
              </div>
              <span className={`badge ${report.status === 'Ready' ? 'badge-green' : 'badge-warm'}`}>
                {report.status}
              </span>
            </button>
          ))}
        </div>

        <button className="btn btn-primary" style={{ marginBottom: 20 }}>
          <FileText size={16} />
          Export All Reports
        </button>
      </div>
    </>
  )
}
