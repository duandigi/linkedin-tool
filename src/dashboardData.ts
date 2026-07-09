export type Period = '7' | '30' | '90'

export type DashboardPoint = {
  label: string
  impressions: number
  clicks: number
  leads: number
}

const baseTrend: DashboardPoint[] = [
  { label: '10/06', impressions: 8200, clicks: 310, leads: 12 },
  { label: '13/06', impressions: 7600, clicks: 288, leads: 10 },
  { label: '16/06', impressions: 9100, clicks: 344, leads: 14 },
  { label: '19/06', impressions: 10500, clicks: 398, leads: 17 },
  { label: '22/06', impressions: 9400, clicks: 371, leads: 15 },
  { label: '25/06', impressions: 11900, clicks: 446, leads: 19 },
  { label: '28/06', impressions: 11300, clicks: 432, leads: 18 },
  { label: '01/07', impressions: 12700, clicks: 481, leads: 22 },
  { label: '04/07', impressions: 12100, clicks: 458, leads: 20 },
  { label: '07/07', impressions: 14900, clicks: 537, leads: 26 },
  { label: '09/07', impressions: 16400, clicks: 612, leads: 31 },
]

export const periodMultiplier: Record<Period, number> = {
  '7': 0.34,
  '30': 1,
  '90': 2.74,
}

export function getTrend(period: Period) {
  const size = period === '7' ? 4 : period === '30' ? 11 : 11
  const multiplier = period === '90' ? 2.4 : 1
  return baseTrend.slice(-size).map((point) => ({
    ...point,
    impressions: Math.round(point.impressions * multiplier),
    clicks: Math.round(point.clicks * multiplier),
    leads: Math.round(point.leads * multiplier),
  }))
}

export const channels = [
  { name: 'Ứng viên', leads: 42, color: '#176b4a' },
  { name: 'Doanh nghiệp', leads: 18, color: '#2d9c84' },
  { name: 'Đặt lịch', leads: 11, color: '#e0a04b' },
  { name: 'Giới thiệu', leads: 7, color: '#7a6fb2' },
  { name: 'Khác', leads: 4, color: '#b9c4be' },
]

export const contentPillars = [
  { name: 'Candidate', value: 38, color: '#176b4a' },
  { name: 'B2B', value: 27, color: '#2d9c84' },
  { name: 'Market insight', value: 19, color: '#e0a04b' },
  { name: 'Employer brand', value: 11, color: '#7a6fb2' },
  { name: 'Job post', value: 5, color: '#b9c4be' },
]

export const posts = [
  { title: '5 lỗi khiến ứng viên senior mất cơ hội phỏng vấn', pillar: 'Candidate', impressions: 6842, ctr: '5,8%', leads: 18, status: 'Đang chạy' },
  { title: 'Vì sao doanh nghiệp FDI khó tuyển middle manager?', pillar: 'B2B', impressions: 4219, ctr: '4,1%', leads: 7, status: 'Đang chạy' },
  { title: 'Cập nhật thị trường tuyển dụng quý 3/2026', pillar: 'Market insight', impressions: 3587, ctr: '3,7%', leads: 4, status: 'Hoàn thành' },
  { title: 'CNK Executive Search: quy trình tìm lãnh đạo', pillar: 'B2B', impressions: 2941, ctr: '3,4%', leads: 3, status: 'Đang chạy' },
]

export const funnel = [
  { label: 'Lượt hiển thị', value: 48760, rate: '100%' },
  { label: 'Lượt click', value: 1842, rate: '3,78%' },
  { label: 'CV & lead', value: 82, rate: '4,45%' },
  { label: 'Đạt chuẩn', value: 27, rate: '32,9%' },
  { label: 'Hẹn gặp', value: 11, rate: '40,7%' },
]
