import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Transaction = {
  id: string;
  user: string;
  type: 'purchase' | 'withdrawal' | 'message';
  amount: number;
  date: string;
};

const mockTransactions: Transaction[] = [
  { id: 'T001', user: 'Pierre Dubois', type: 'purchase', amount: 50.00, date: '2024-10-14 14:23' },
  { id: 'T002', user: 'Sophie Durand', type: 'withdrawal', amount: 150.00, date: '2024-10-14 13:45' },
  { id: 'T003', user: 'Jean Martin', type: 'message', amount: 2.50, date: '2024-10-14 12:10' },
  { id: 'T004', user: 'Marie Lefebvre', type: 'withdrawal', amount: 200.00, date: '2024-10-14 11:30' },
  { id: 'T005', user: 'Luc Petit', type: 'purchase', amount: 100.00, date: '2024-10-14 10:15' },
  { id: 'T006', user: 'Emma Garcia', type: 'message', amount: 5.00, date: '2024-10-14 09:50' },
  { id: 'T007', user: 'Marc Roux', type: 'purchase', amount: 25.00, date: '2024-10-13 18:40' },
  { id: 'T008', user: 'Laura Martinez', type: 'withdrawal', amount: 80.00, date: '2024-10-13 16:20' },
  { id: 'T009', user: 'Paul Simon', type: 'message', amount: 1.50, date: '2024-10-13 15:05' },
  { id: 'T010', user: 'Julie Bernard', type: 'withdrawal', amount: 300.00, date: '2024-10-13 14:30' },
];

export function AdminTransactions() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const { t } = useLanguage();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return t('purchase');
      case 'withdrawal':
        return t('withdrawal');
      case 'message':
        return t('message');
      default:
        return type;
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'type-purchase';
      case 'withdrawal':
        return 'type-withdrawal';
      case 'message':
        return 'type-message';
      default:
        return '';
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">{t('transactions')}</h1>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('user')}</th>
              <th>{t('type')}</th>
              <th>{t('amount')}</th>
              <th>{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.user}</td>
                <td>
                  <span className={`transaction-type ${getTypeClass(transaction.type)}`}>
                    {getTypeLabel(transaction.type)}
                  </span>
                </td>
                <td>€{transaction.amount.toFixed(2)}</td>
                <td>{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
