export type MandateCategory = 'Entertainment' | 'Utilities' | 'Finance' | 'Health' | 'Software';
export type MandateStatus = 'active' | 'cancelled';

export type Mandate = {
  id: string;
  name: string;
  category: MandateCategory;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  nextDebit: string;
  lastDebit: string;
  status: MandateStatus;
  color: string;
  initials: string;
  reference: string;
  paymentMethod: string;
  appScheme?: string;
  manageUrl: string;
};

export const initialMandates: Mandate[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Entertainment',
    amount: 649,
    frequency: 'Monthly',
    nextDebit: '2026-11-12',
    lastDebit: '2026-10-12',
    status: 'active',
    color: '#E50914',
    initials: 'N',
    reference: 'MND-8249-1024',
    paymentMethod: 'HDFC Bank •• 4242',
    appScheme: 'netflix://',
    manageUrl: 'https://www.netflix.com/youraccount',
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    category: 'Entertainment',
    amount: 119,
    frequency: 'Monthly',
    nextDebit: '2026-11-15',
    lastDebit: '2026-10-15',
    status: 'active',
    color: '#1DB954',
    initials: 'S',
    reference: 'MND-8249-1078',
    paymentMethod: 'HDFC Bank •• 4242',
    appScheme: 'spotify://',
    manageUrl: 'https://www.spotify.com/in-en/account/subscription/',
  },
  {
    id: 'electricity',
    name: 'Adani Electricity',
    category: 'Utilities',
    amount: 1840,
    frequency: 'Monthly',
    nextDebit: '2026-11-18',
    lastDebit: '2026-10-18',
    status: 'active',
    color: '#2563EB',
    initials: 'A',
    reference: 'MND-8249-1142',
    paymentMethod: 'ICICI Bank •• 9031',
    manageUrl: 'https://www.adanielectricity.com/',
  },
  {
    id: 'hdfc-life',
    name: 'HDFC Life Insurance',
    category: 'Finance',
    amount: 2400,
    frequency: 'Monthly',
    nextDebit: '2026-11-21',
    lastDebit: '2026-10-21',
    status: 'active',
    color: '#1D4ED8',
    initials: 'H',
    reference: 'MND-8249-1281',
    paymentMethod: 'HDFC Bank •• 4242',
    manageUrl: 'https://www.hdfclife.com/',
  },
  {
    id: 'cultfit',
    name: 'cult.fit',
    category: 'Health',
    amount: 1499,
    frequency: 'Monthly',
    nextDebit: '2026-11-24',
    lastDebit: '2026-10-24',
    status: 'active',
    color: '#111827',
    initials: 'c.',
    reference: 'MND-8249-1320',
    paymentMethod: 'ICICI Bank •• 9031',
    appScheme: 'cultfit://',
    manageUrl: 'https://www.cult.fit/',
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    category: 'Software',
    amount: 1675,
    frequency: 'Monthly',
    nextDebit: '2026-12-02',
    lastDebit: '2026-11-02',
    status: 'active',
    color: '#DA291C',
    initials: 'Ai',
    reference: 'MND-8249-1497',
    paymentMethod: 'HDFC Bank •• 4242',
    manageUrl: 'https://account.adobe.com/plans',
  },
];
