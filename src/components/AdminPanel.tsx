import { useEffect, useState } from 'react';
import { supabase, type Profile, type Transaction } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
};

export function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'reports'>('users');
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchReports();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setTransactions(data || []);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data || []);
  };

  const calculatePlatformRevenue = () => {
    return transactions
      .filter((tx) => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.platform_fee, 0);
  };

  return (
    <div className="admin-panel">
      <h2>{t('admin')}</h2>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Revenue</div>
          <div className="stat-value">€{calculatePlatformRevenue().toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Reports</div>
          <div className="stat-value">
            {reports.filter((r) => r.status === 'pending').length}
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t('users')}
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          {t('transactions')}
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          {t('reports')}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Display Name</th>
                <th>Role</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>@{user.username}</td>
                  <td>{user.display_name}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Platform Fee</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.type}</td>
                  <td>
                    {tx.currency} {tx.amount.toFixed(2)}
                  </td>
                  <td>{tx.currency} {tx.platform_fee.toFixed(2)}</td>
                  <td>{tx.status}</td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Reason</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.reason}</td>
                  <td>{report.description}</td>
                  <td>{report.status}</td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
