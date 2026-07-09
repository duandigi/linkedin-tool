# LinkedIn Marketing Tool

Dashboard theo dõi hiệu suất nội dung, lead, CV và chiến dịch UTM cho nhiều LinkedIn Page trong một workspace.

## Chạy dự án

```bash
npm install
npm run dev
```

## Tính năng MVP

- Dashboard KPI LinkedIn và chuyển đổi
- Tự tải các Page mà tài khoản OAuth có quyền quản trị
- Chuyển dashboard theo từng LinkedIn Page
- Bảng nội dung nổi bật
- Phễu click → lead → qualified → meeting
- Trình tạo liên kết UTM
- Responsive cho desktop và mobile
- Trạng thái tích hợp minh bạch: dữ liệu hiện tại là dữ liệu minh họa

## Hướng phát triển

1. Kết nối form website và lưu lead vào database.
2. Tích hợp GA4 để ghi nhận UTM.
3. Xin quyền LinkedIn Community Management API: `r_organization_social` và `rw_organization_admin`.
4. Thêm đăng nhập, phân quyền và báo cáo tuần tự động.
