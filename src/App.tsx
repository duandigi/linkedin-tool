import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Eye,
  FileText,
  LayoutDashboard,
  Link2,
  Menu,
  MousePointerClick,
  Plus,
  Search,
  Send,
  Settings,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { channels, contentPillars, funnel, getTrend, periodMultiplier, posts, type Period } from './dashboardData'
import './App.css'

const navItems = [
  { label: 'Tổng quan', icon: LayoutDashboard },
  { label: 'Nội dung', icon: FileText },
  { label: 'Lead & CV', icon: Users },
  { label: 'Chiến dịch', icon: Target },
  { label: 'Tạo UTM', icon: Link2 },
]

const metricBase = [
  { label: 'Lượt hiển thị', value: 48760, suffix: '', change: '+18,2%', icon: Eye, color: 'green', spark: [25, 32, 27, 40, 36, 52, 48, 64] },
  { label: 'Lượt click', value: 1842, suffix: '', change: '+14,3%', icon: MousePointerClick, color: 'teal', spark: [31, 27, 39, 34, 42, 45, 59, 46] },
  { label: 'Tỷ lệ tương tác', value: 4.82, suffix: '%', change: '+0,7%', icon: Activity, color: 'violet', spark: [22, 34, 28, 49, 30, 37, 32, 46] },
  { label: 'CV tiềm năng', value: 42, suffix: '', change: '+12', icon: UserCheck, color: 'gold', spark: [18, 24, 21, 34, 31, 42, 37, 52] },
  { label: 'Lead doanh nghiệp', value: 11, suffix: '', change: '+4', icon: BriefcaseBusiness, color: 'coral', spark: [17, 22, 19, 27, 24, 36, 33, 45] },
  { label: 'Tỷ lệ chuyển đổi', value: 4.45, suffix: '%', change: '+0,9%', icon: TrendingUp, color: 'blue', spark: [23, 20, 29, 25, 36, 31, 48, 41] },
]

type LinkedInPage = {
  id: string
  name: string
  vanityName?: string
}

function App() {
  const [period, setPeriod] = useState<Period>('30')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Tổng quan')
  const [showUtm, setShowUtm] = useState(false)
  const [campaign, setCampaign] = useState('executive_search')
  const [contentId, setContentId] = useState('post_hr_director_20260709')
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [pages, setPages] = useState<LinkedInPage[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  const [liveAnalytics, setLiveAnalytics] = useState<{ impressions: number; clicks: number; engagement: number } | null>(null)
  const trend = useMemo(() => getTrend(period), [period])
  const multiplier = periodMultiplier[period]

  const utmLink = useMemo(
    () => `https://cnk-consulting.com.vn/contact/?utm_source=linkedin&utm_medium=social&utm_campaign=${encodeURIComponent(campaign)}&utm_content=${encodeURIComponent(contentId)}`,
    [campaign, contentId],
  )

  useEffect(() => {
    fetch('/api/linkedin/status')
      .then((response) => response.json())
      .then((status) => {
        setLinkedinConnected(Boolean(status.connected))
        if (status.connected) {
          return fetch('/api/linkedin/organizations')
            .then((response) => response.ok ? response.json() : { organizations: [] })
            .then((data) => {
              const organizations = data.organizations as LinkedInPage[]
              setPages(organizations)
              setSelectedPageId(organizations[0]?.id || status.organizationId || '')
            })
        }
      })
      .catch(() => setLinkedinConnected(false))
  }, [])

  useEffect(() => {
    if (!linkedinConnected || !selectedPageId) return
    setLiveAnalytics(null)
    fetch(`/api/linkedin/analytics?organizationId=${encodeURIComponent(selectedPageId)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((analytics) => analytics && setLiveAnalytics(analytics))
      .catch(() => setLiveAnalytics(null))
  }, [linkedinConnected, selectedPageId])

  const selectedPage = pages.find((page) => page.id === selectedPageId)

  const selectNav = (label: string) => {
    setActiveNav(label)
    setSidebarOpen(false)
    if (label === 'Tạo UTM') setShowUtm(true)
  }

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand"><div className="brand-mark">LI</div><div><strong>Page Analytics</strong><span>Multi-Page workspace</span></div></div>
        <label className="page-switcher">
          <span>PAGE ĐANG XEM</span>
          <div><Building2 size={15} /><select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)} disabled={!linkedinConnected || !pages.length}>
            {!pages.length && <option value="">{linkedinConnected ? 'Không tìm thấy Page' : 'Chưa kết nối LinkedIn'}</option>}
            {pages.map((page) => <option value={page.id} key={page.id}>{page.name}</option>)}
          </select><ChevronDown size={14} /></div>
        </label>
        <nav aria-label="Điều hướng chính">
          <span className="nav-label">Không gian làm việc</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button className={activeNav === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => selectNav(label)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><CircleHelp size={18} />Trợ giúp</button>
          <button className="nav-item"><Settings size={18} />Cài đặt</button>
          <div className="profile"><div className="avatar">HA</div><div><strong>Hoàng Anh</strong><span>Marketing admin</span></div><ChevronDown size={15} /></div>
        </div>
      </aside>

      {sidebarOpen && <button className="scrim" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}

      <main>
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Mở menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="search"><Search size={17} /><input aria-label="Tìm kiếm" placeholder="Tìm bài viết, chiến dịch hoặc lead..." /><kbd>⌘ K</kbd></div>
          <button className="icon-button" aria-label="Thông báo"><Bell size={18} /><i /></button>
          <button className="primary-button" onClick={() => setShowUtm(true)}><Plus size={17} />Tạo chiến dịch</button>
        </header>

        <div className="content">
          <section className="page-heading">
            <div><h1>Marketing Dashboard</h1><p>Hiệu suất của {selectedPage?.name || 'tất cả LinkedIn Page trong workspace'}.</p></div>
            <label className="period-select"><CalendarDays size={16} /><select value={period} onChange={(event) => setPeriod(event.target.value as Period)}><option value="7">7 ngày qua</option><option value="30">30 ngày qua</option><option value="90">90 ngày qua</option></select></label>
          </section>

          <section className="metrics" aria-label="Chỉ số chính">
            {metricBase.map((metric) => {
              const liveValue = metric.label === 'Lượt hiển thị' ? liveAnalytics?.impressions : metric.label === 'Lượt click' ? liveAnalytics?.clicks : metric.label === 'Tỷ lệ tương tác' && liveAnalytics ? liveAnalytics.engagement * 100 : undefined
              return <Metric key={metric.label} {...metric} value={liveValue ?? metric.value} multiplier={liveValue === undefined ? multiplier : 1} />
            })}
          </section>

          <section className="chart-grid">
            <ChartPanel className="trend-panel" title="Xu hướng Traffic & Lead" subtitle="Dữ liệu LinkedIn theo thời gian">
              <div className="chart-legend"><span><i className="legend-line green" />Hiển thị</span><span><i className="legend-line teal" />Click</span><span><i className="legend-line coral" />Lead</span></div>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="impressionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#176b4a" stopOpacity={0.22}/><stop offset="100%" stopColor="#176b4a" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e9eeeb" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#78847d' }} />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#78847d' }} tickFormatter={(value) => `${value / 1000}k`} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#78847d' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="impressions" name="Hiển thị" stroke="#176b4a" strokeWidth={2.2} fill="url(#impressionFill)" activeDot={{ r: 4 }} />
                    <Area yAxisId="right" type="monotone" dataKey="clicks" name="Click" stroke="#2d9c84" strokeWidth={2} fill="transparent" />
                    <Area yAxisId="right" type="monotone" dataKey="leads" name="Lead" stroke="#e07a5f" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Lead theo nguồn" subtitle="Phân bổ chuyển đổi trong kỳ">
              <div className="chart-frame compact">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channels.map((item) => ({ ...item, leads: Math.round(item.leads * multiplier) }))} margin={{ top: 16, right: 4, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#e9eeeb" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#78847d' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#78847d' }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="leads" name="Lead" radius={[4, 4, 0, 0]}>{channels.map((item) => <Cell key={item.name} fill={item.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Nhóm nội dung" subtitle="Tỷ trọng impression theo content pillar">
              <div className="donut-layout">
                <div className="donut-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={contentPillars} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={2} stroke="none">{contentPillars.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart>
                  </ResponsiveContainer>
                  <div className="donut-total"><strong>{Math.round(48760 * multiplier).toLocaleString('vi-VN')}</strong><span>hiển thị</span></div>
                </div>
                <div className="donut-legend">{contentPillars.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div>
              </div>
            </ChartPanel>
          </section>

          <section className="lower-grid">
            <div className="panel campaign-panel">
              <div className="panel-title"><div><h2>Hiệu suất nội dung</h2><p>Bài viết đóng góp nhiều chuyển đổi nhất</p></div><button className="text-button">Xem tất cả</button></div>
              <div className="table-wrap"><table><thead><tr><th>Bài viết</th><th>Nhóm</th><th>Hiển thị</th><th>CTR</th><th>Lead</th><th>Trạng thái</th></tr></thead><tbody>{posts.map((post) => <tr key={post.title}><td><strong>{post.title}</strong></td><td>{post.pillar}</td><td>{Math.round(post.impressions * multiplier).toLocaleString('vi-VN')}</td><td>{post.ctr}</td><td><b>{Math.round(post.leads * multiplier)}</b></td><td><span className={post.status === 'Hoàn thành' ? 'status done' : 'status active'}>{post.status}</span></td></tr>)}</tbody></table></div>
            </div>

            <div className="panel funnel-panel">
              <div className="panel-title"><div><h2>Phễu Marketing</h2><p>Từ lượt xem đến cuộc hẹn</p></div></div>
              <div className="visual-funnel">{funnel.map((step, index) => <div className={`funnel-step step-${index + 1}`} key={step.label}><span>{step.label}</span><strong>{Math.round(step.value * multiplier).toLocaleString('vi-VN')}</strong><em>{step.rate}</em></div>)}</div>
            </div>
          </section>

          <section className={linkedinConnected ? 'connection-strip connected' : 'connection-strip'}><div className="connection-icon"><BriefcaseBusiness size={21} /></div><div><strong>{linkedinConnected ? `${pages.length} LinkedIn Page đã được đồng bộ` : 'Kết nối tài khoản quản trị Page'}</strong><span>{linkedinConnected ? 'Chọn Page ở thanh bên để xem riêng từng dashboard.' : 'Cấp quyền một lần để hệ thống đọc danh sách và analytics của mọi Page anh quản trị.'}</span></div><button className="secondary-button" onClick={() => { window.location.href = '/api/linkedin/auth' }}>{linkedinConnected ? 'Đồng bộ quyền' : 'Kết nối LinkedIn'}</button></section>
        </div>
      </main>

      {showUtm && <div className="modal-layer"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="utm-title"><div className="modal-heading"><div><span className="eyebrow">THEO DÕI CHUYỂN ĐỔI</span><h2 id="utm-title">Tạo liên kết UTM</h2></div><button className="icon-button" aria-label="Đóng" onClick={() => setShowUtm(false)}><X size={19} /></button></div><label>Tên chiến dịch<input value={campaign} onChange={(event) => setCampaign(event.target.value)} /></label><label>Mã nội dung<input value={contentId} onChange={(event) => setContentId(event.target.value)} /></label><div className="generated-link"><span>Liên kết được tạo</span><p>{utmLink}</p></div><button className="primary-button full" onClick={() => navigator.clipboard?.writeText(utmLink)}><Send size={17} />Sao chép liên kết</button></section></div>}
    </div>
  )
}

function ChartPanel({ title, subtitle, className = '', children }: { title: string; subtitle: string; className?: string; children: React.ReactNode }) {
  return <div className={`panel chart-panel ${className}`}><div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="mini-select">Trong kỳ<ChevronDown size={13} /></button></div>{children}</div>
}

function Metric({ label, value, suffix, change, icon: Icon, color, spark, multiplier }: (typeof metricBase)[number] & { multiplier: number }) {
  const displayValue = suffix ? `${(value * (multiplier === 1 ? 1 : 0.96)).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}${suffix}` : Math.round(value * multiplier).toLocaleString('vi-VN')
  const sparkData = spark.map((point, index) => ({ index, point }))
  return <article className={`metric metric-${color}`}><div className="metric-head"><div className="metric-icon"><Icon size={18} /></div><span>{label}</span></div><strong>{displayValue}</strong><div className="metric-bottom"><p><b>↑ {change}</b><span>so với kỳ trước</span></p><div className="sparkline"><ResponsiveContainer width="100%" height="100%"><AreaChart data={sparkData}><Area type="monotone" dataKey="point" stroke="currentColor" strokeWidth={1.8} fill="currentColor" fillOpacity={0.08} /></AreaChart></ResponsiveContainer></div></div></article>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip">{label && <strong>{label}</strong>}{payload.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}: <b>{item.value.toLocaleString('vi-VN')}</b></span>)}</div>
}

export default App
