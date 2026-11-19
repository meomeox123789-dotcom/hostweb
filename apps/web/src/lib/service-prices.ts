export type PriceAmount = number | readonly [number, number];

export type ServicePriceItem = {
  name: string;
  price: PriceAmount;
  duration?: string;
  confirmationNote?: string;
};

export type ServicePriceGroup = {
  label: string;
  items: readonly ServicePriceItem[];
};

const spaPriceGroups: readonly ServicePriceGroup[] = [
  {
    label: 'Gội đầu',
    items: [
      { name: 'Gội đầu dưỡng sinh', duration: '35–40 phút', price: 129_000 },
      { name: 'Gội đầu thư giãn', duration: '60 phút', price: 249_000 },
    ],
  },
  {
    label: 'Liệu trình Spa',
    items: [
      { name: 'Combo thư giãn toàn diện', duration: '90 phút', price: 399_000 },
      { name: 'Cổ vai gáy chuyên sâu', duration: '60 phút', price: 349_000 },
      { name: 'Dinh dưỡng toàn diện', duration: '90 phút', price: 499_000 },
      { name: 'HALANA Signature', duration: '130 phút', price: 799_000 },
      { name: 'HALANA VIP', duration: '180 phút', price: 990_000 },
    ],
  },
  {
    label: 'Chăm sóc cơ thể',
    items: [
      { name: 'Thanh lọc thảo mộc', duration: '30–40 phút', price: 199_000 },
      { name: 'Body thư giãn', duration: '60 phút', price: 399_000 },
      { name: 'Body chuyên sâu', duration: '90 phút', price: 599_000 },
    ],
  },
];

const nailPriceGroups: readonly ServicePriceGroup[] = [
  {
    label: 'Sơn gel & kỹ thuật móng',
    items: [
      { name: 'Sơn gel cơ bản', price: 120_000 },
      { name: 'Sơn gel thạch', price: 169_000, confirmationNote: 'Ảnh ghi chú “ckd móng”; cần xác nhận phần ghi chú.' },
      { name: 'Sơn mắt mèo', price: 159_000 },
      { name: 'Sơn nhũ/mắt mèo (có nền)', price: 200_000 },
      { name: 'Sơn cứng móng (base cứng)', price: 40_000 },
      { name: 'Đắp cứng móng cầu (móng ngắn)', price: 60_000 },
      { name: 'Đắp cứng móng cầu (móng dài)', price: 89_000 },
    ],
  },
  {
    label: 'Trang trí & thiết kế móng',
    items: [
      { name: 'Tráng gương (tính theo ngón/bộ)', price: [10_000, 150_000] },
      { name: 'Foil, sticker, kim tuyến', price: [15_000, 50_000] },
      { name: 'Ombre, loang, vân đá', price: [10_000, 70_000] },
      { name: 'Vẽ gel nghệ thuật (line art/hoạ tiết)', price: [20_000, 60_000] },
      { name: 'Design nổi (gel nổi 3D)', price: [30_000, 100_000] },
      { name: 'Charm/đá (tuỳ mẫu)', price: [5_000, 100_000] },
    ],
  },
  {
    label: 'Chăm sóc móng',
    items: [
      { name: 'Cắt da, tạo form', price: [30_000, 70_000] },
      { name: 'Chăm sóc tay cơ bản (cắt da, massage)', price: 120_000 },
      { name: 'Chăm sóc chân cơ bản (cắt da, massage)', price: 120_000 },
      { name: 'Chà gót chuyên sâu', price: 120_000 },
      { name: 'Combo chăm sóc móng + chà gót', price: 220_000 },
    ],
  },
  {
    label: 'Úp móng & nối móng',
    items: [
      { name: 'Úp móng gel', price: [120_000, 150_000] },
      { name: 'Nối móng đắp gel, dũa form', price: 220_000 },
      { name: 'Đắp gel móng thật', price: 180_000 },
      { name: 'Fill cứng móng/fill chân móng', price: [100_000, 150_000] },
      { name: 'Úp móng lẻ (ngón)', price: 12_000 },
      { name: 'Pha sơn gel', price: [30_000, 50_000] },
      { name: 'Pha bột đắp', price: 70_000, confirmationNote: 'Ảnh ghi chú “nối cũ”; cần xác nhận phần ghi chú.' },
    ],
  },
];

export function formatServicePrice(price: PriceAmount): string {
  const format = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
  return typeof price === 'number' ? format(price) : `${format(price[0])} – ${format(price[1])}`;
}

export { nailPriceGroups, spaPriceGroups };
