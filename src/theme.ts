export const colors = {
  background: '#F5F6F4',
  surface: '#FFFFFF',
  ink: '#18231E',
  inkSoft: '#3F4D46',
  muted: '#77817B',
  mutedLight: '#A0A8A3',
  border: '#E9ECE8',
  green: '#285943',
  greenDark: '#173E30',
  lime: '#D9F99D',
  limeSoft: '#F0F7E6',
  danger: '#B64C45',
};

export const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return currency.format(value).replace('₹', '₹');
}

export function formatShortDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const cardShadow = {
  shadowColor: '#1A2C22',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.035,
  shadowRadius: 12,
  elevation: 1,
};
