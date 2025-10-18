export type Currency = 'EUR' | 'USD';
export type Period = 'day' | 'week' | 'month';

export type AnalyticsDataPoint = {
  date: string;
  volume: number;
  commission: number;
};

export function formatCurrency(amount: number, currency: Currency, locale: 'en' | 'fr'): string {
  const currencySymbol = currency === 'EUR' ? '€' : '$';
  const formattedAmount = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === 'EUR' ? `${formattedAmount}${currencySymbol}` : `${currencySymbol}${formattedAmount}`;
}

export function generateMockAnalyticsData(days: number = 90): AnalyticsDataPoint[] {
  const data: AnalyticsDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const baseVolume = 1000 + Math.random() * 2000;
    const trend = Math.sin((days - i) / 10) * 500;
    const noise = (Math.random() - 0.5) * 400;
    const volume = Math.max(500, baseVolume + trend + noise);

    data.push({
      date: date.toISOString().split('T')[0],
      volume: parseFloat(volume.toFixed(2)),
      commission: parseFloat((volume * 0.1).toFixed(2)),
    });
  }

  return data;
}

export function aggregateDataByPeriod(
  data: AnalyticsDataPoint[],
  period: Period
): AnalyticsDataPoint[] {
  if (period === 'day') {
    return data;
  }

  const aggregated: { [key: string]: { volume: number; commission: number; count: number } } = {};

  data.forEach(point => {
    const date = new Date(point.date);
    let key: string;

    if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }

    if (!aggregated[key]) {
      aggregated[key] = { volume: 0, commission: 0, count: 0 };
    }

    aggregated[key].volume += point.volume;
    aggregated[key].commission += point.commission;
    aggregated[key].count += 1;
  });

  return Object.entries(aggregated)
    .map(([date, data]) => ({
      date,
      volume: parseFloat(data.volume.toFixed(2)),
      commission: parseFloat(data.commission.toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function filterDataByDateRange(
  data: AnalyticsDataPoint[],
  startDate: string,
  endDate: string
): AnalyticsDataPoint[] {
  return data.filter(point => point.date >= startDate && point.date <= endDate);
}

export function calculateKPIs(data: AnalyticsDataPoint[], previousData: AnalyticsDataPoint[]) {
  const total = data.reduce((sum, point) => sum + point.commission, 0);
  const average = data.length > 0 ? total / data.length : 0;

  const previousTotal = previousData.reduce((sum, point) => sum + point.commission, 0);
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total: parseFloat(total.toFixed(2)),
    average: parseFloat(average.toFixed(2)),
    growth: parseFloat(growth.toFixed(2)),
  };
}

export function getPreviousPeriodData(
  allData: AnalyticsDataPoint[],
  currentStartDate: string,
  currentEndDate: string
): AnalyticsDataPoint[] {
  const start = new Date(currentStartDate);
  const end = new Date(currentEndDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - duration);

  return filterDataByDateRange(
    allData,
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0]
  );
}
