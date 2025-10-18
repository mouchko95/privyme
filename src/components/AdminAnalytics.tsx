import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import {
  type Currency,
  type Period,
  formatCurrency,
  generateMockAnalyticsData,
  aggregateDataByPeriod,
  filterDataByDateRange,
  calculateKPIs,
  getPreviousPeriodData,
} from '../utils/analytics';

export function AdminAnalytics() {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState<Period>('day');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const allData = useMemo(() => generateMockAnalyticsData(90), []);

  const filteredData = useMemo(() => {
    const filtered = filterDataByDateRange(allData, startDate, endDate);
    return aggregateDataByPeriod(filtered, period);
  }, [allData, startDate, endDate, period]);

  const previousData = useMemo(() => {
    const prev = getPreviousPeriodData(allData, startDate, endDate);
    return aggregateDataByPeriod(prev, period);
  }, [allData, startDate, endDate, period]);

  const kpis = useMemo(() => {
    return calculateKPIs(filteredData, previousData);
  }, [filteredData, previousData]);

  const formatAmount = (amount: number) => formatCurrency(amount, currency, language);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{payload[0].payload.date}</p>
          <p className="tooltip-value">
            {t('commission')}: {formatAmount(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{t('analytics')}</h1>

      <div className="analytics-controls">
        <div className="control-group">
          <label>{t('period')}</label>
          <div className="period-buttons">
            <button
              className={period === 'day' ? 'active' : ''}
              onClick={() => setPeriod('day')}
            >
              {t('day')}
            </button>
            <button
              className={period === 'week' ? 'active' : ''}
              onClick={() => setPeriod('week')}
            >
              {t('week')}
            </button>
            <button
              className={period === 'month' ? 'active' : ''}
              onClick={() => setPeriod('month')}
            >
              {t('month')}
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>{t('dateRange')}</label>
          <div className="date-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
            <span>→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="control-group">
          <label>{t('currency')}</label>
          <div className="period-buttons">
            <button
              className={currency === 'EUR' ? 'active' : ''}
              onClick={() => setCurrency('EUR')}
            >
              EUR (€)
            </button>
            <button
              className={currency === 'USD' ? 'active' : ''}
              onClick={() => setCurrency('USD')}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">{t('thisMonthTotal')}</div>
          <div className="kpi-value">{formatAmount(kpis.total)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">{t('averagePerDay')}</div>
          <div className="kpi-value">{formatAmount(kpis.average)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            {t('growth')} <span className="kpi-sublabel">({t('vsPreviousPeriod')})</span>
          </div>
          <div className={`kpi-value ${kpis.growth >= 0 ? 'positive' : 'negative'}`}>
            {kpis.growth >= 0 ? '+' : ''}{kpis.growth.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>{t('earningsOverTime')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fill: '#888' }}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: '#888' }}
              tickFormatter={(value) => formatAmount(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="commission"
              stroke="#6A1B9A"
              strokeWidth={3}
              dot={{ fill: '#6A1B9A', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="summary-section">
        <h3>{t('summary')}</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('totalVolume')}</th>
                <th>{t('commission')} (10%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(-10).reverse().map((point, index) => (
                <tr key={index}>
                  <td>{point.date}</td>
                  <td>{formatAmount(point.volume)}</td>
                  <td>{formatAmount(point.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
