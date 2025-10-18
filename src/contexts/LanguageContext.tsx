import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

type Language = 'en' | 'fr';

type Translations = {
  [key: string]: {
    en: string;
    fr: string;
  };
};

const translations: Translations = {
  signIn: { en: 'Sign In', fr: 'Se connecter' },
  signUp: { en: 'Sign Up', fr: "S'inscrire" },
  signOut: { en: 'Sign Out', fr: 'Se déconnecter' },
  email: { en: 'Email', fr: 'E-mail' },
  password: { en: 'Password', fr: 'Mot de passe' },
  username: { en: 'Username', fr: "Nom d'utilisateur" },
  displayName: { en: 'Display Name', fr: 'Nom affiché' },
  welcome: { en: 'Welcome to PrivyMe', fr: 'Bienvenue sur PrivyMe' },
  ageGateTitle: { en: 'Age Verification Required', fr: 'Vérification d\'âge requise' },
  ageGateMessage: { en: 'You must be 18 years or older to use this platform.', fr: 'Vous devez avoir 18 ans ou plus pour utiliser cette plateforme.' },
  ageGateConfirm: { en: 'I am 18 or older', fr: 'J\'ai 18 ans ou plus' },
  ageGateDecline: { en: 'Exit', fr: 'Sortir' },
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  chats: { en: 'Chats', fr: 'Conversations' },
  profile: { en: 'Profile', fr: 'Profil' },
  wallet: { en: 'Wallet', fr: 'Portefeuille' },
  credits: { en: 'Credits', fr: 'Crédits' },
  addCredits: { en: 'Add Credits', fr: 'Ajouter des crédits' },
  earnings: { en: 'Earnings', fr: 'Revenus' },
  today: { en: 'Today', fr: "Aujourd'hui" },
  thisMonth: { en: 'This Month', fr: 'Ce mois' },
  total: { en: 'Total', fr: 'Total' },
  withdraw: { en: 'Withdraw', fr: 'Retirer' },
  messages: { en: 'Messages', fr: 'Messages' },
  sendMessage: { en: 'Send message', fr: 'Envoyer un message' },
  typeMessage: { en: 'Type a message...', fr: 'Tapez un message...' },
  becomeCreator: { en: 'Become a Creator', fr: 'Devenir créateur' },
  creatorSettings: { en: 'Creator Settings', fr: 'Paramètres créateur' },
  messagePrice: { en: 'Message Price', fr: 'Prix par message' },
  entryFee: { en: 'Entry Fee', fr: "Frais d'entrée" },
  payoutEmail: { en: 'PayPal Email', fr: 'E-mail PayPal' },
  save: { en: 'Save', fr: 'Enregistrer' },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  copyLink: { en: 'Copy Invite Link', fr: "Copier le lien d'invitation" },
  linkCopied: { en: 'Link copied!', fr: 'Lien copié !' },
  payEntryFee: { en: 'Pay Entry Fee to Chat', fr: "Payer les frais d'entrée pour discuter" },
  pay: { en: 'Pay', fr: 'Payer' },
  unlock: { en: 'Unlock', fr: 'Déverrouiller' },
  locked: { en: 'Locked Content', fr: 'Contenu verrouillé' },
  insufficientCredits: { en: 'Insufficient credits', fr: 'Crédits insuffisants' },
  admin: { en: 'Admin', fr: 'Admin' },
  users: { en: 'Users', fr: 'Utilisateurs' },
  transactions: { en: 'Transactions', fr: 'Transactions' },
  reports: { en: 'Reports', fr: 'Signalements' },
  block: { en: 'Block', fr: 'Bloquer' },
  report: { en: 'Report', fr: 'Signaler' },
  reportUser: { en: 'Report User', fr: 'Signaler l\'utilisateur' },
  reason: { en: 'Reason', fr: 'Raison' },
  description: { en: 'Description', fr: 'Description' },
  submit: { en: 'Submit', fr: 'Soumettre' },
  close: { en: 'Close', fr: 'Fermer' },
  noChats: { en: 'No conversations yet', fr: 'Aucune conversation' },
  purchaseCredits: { en: 'Purchase Credits', fr: 'Acheter des crédits' },
  selectPackage: { en: 'Select Package', fr: 'Sélectionner un forfait' },
  mediaUnlocked: { en: 'Media unlocked', fr: 'Média déverrouillé' },
  pendingPayout: { en: 'Pending Payout', fr: 'Retrait en attente' },
  minimumPayout: { en: 'Minimum €10 for withdrawal', fr: 'Minimum 10 € pour le retrait' },
  requestPayout: { en: 'Request Payout', fr: 'Demander un retrait' },
  payoutRequested: { en: 'Payout requested successfully', fr: 'Retrait demandé avec succès' },
  error: { en: 'Error', fr: 'Erreur' },
  success: { en: 'Success', fr: 'Succès' },
  loading: { en: 'Loading...', fr: 'Chargement...' },
  switchToFan: { en: 'Switch to Fan', fr: 'Passer en Fan' },
  switchToCreator: { en: 'Switch to Creator', fr: 'Passer en Créateur' },
  or: { en: 'or', fr: 'ou' },
  alreadyHaveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' },
  dontHaveAccount: { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?" },
  language: { en: 'Language', fr: 'Langue' },
  currency: { en: 'Currency', fr: 'Devise' },
  adminLogin: { en: 'Admin Login', fr: 'Connexion Admin' },
  adminDashboard: { en: 'Admin Dashboard', fr: 'Tableau de bord Admin' },
  creators: { en: 'Creators', fr: 'Créateurs' },
  fans: { en: 'Fans', fr: 'Fans' },
  adminSettings: { en: 'Settings', fr: 'Paramètres' },
  logout: { en: 'Logout', fr: 'Déconnexion' },
  name: { en: 'Name', fr: 'Nom' },
  numberOfFans: { en: 'Number of fans', fr: 'Nombre de fans' },
  creditBalance: { en: 'Credit balance', fr: 'Solde crédits' },
  registrationDate: { en: 'Registration date', fr: "Date d'inscription" },
  viewProfile: { en: 'View profile', fr: 'Voir profil' },
  remainingCredits: { en: 'Remaining credits', fr: 'Crédits restants' },
  lastCreatorContacted: { en: 'Last creator contacted', fr: 'Dernier créateur contacté' },
  user: { en: 'User', fr: 'Utilisateur' },
  type: { en: 'Type', fr: 'Type' },
  amount: { en: 'Amount', fr: 'Montant' },
  date: { en: 'Date', fr: 'Date' },
  purchase: { en: 'Purchase', fr: 'Achat' },
  withdrawal: { en: 'Withdrawal', fr: 'Retrait' },
  message: { en: 'Message', fr: 'Message' },
  currentCommission: { en: 'Current commission', fr: 'Commission actuelle' },
  modifyCommission: { en: 'Modify commission (%)', fr: 'Modifier la commission (%)' },
  giveFreeCredits: { en: 'Give free credits', fr: 'Donner des crédits gratuits' },
  userEmail: { en: 'User email', fr: "Email de l'utilisateur" },
  creditAmount: { en: 'Credit amount', fr: 'Montant de crédits' },
  addFreeCredits: { en: 'Add credits', fr: 'Ajouter des crédits' },
  invalidCredentials: { en: 'Invalid email or password', fr: 'Email ou mot de passe invalide' },
  creditsAdded: { en: 'Credits added successfully', fr: 'Crédits ajoutés avec succès' },
  commissionUpdated: { en: 'Commission updated successfully', fr: 'Commission mise à jour avec succès' },
  analytics: { en: 'Analytics', fr: 'Statistiques' },
  thisMonthTotal: { en: 'This month total', fr: 'Total du mois' },
  averagePerDay: { en: 'Average per day', fr: 'Moyenne par jour' },
  growth: { en: 'Growth', fr: 'Croissance' },
  period: { en: 'Period', fr: 'Période' },
  day: { en: 'Day', fr: 'Jour' },
  week: { en: 'Week', fr: 'Semaine' },
  month: { en: 'Month', fr: 'Mois' },
  dateRange: { en: 'Date range', fr: 'Plage de dates' },
  startDate: { en: 'Start date', fr: 'Date de début' },
  endDate: { en: 'End date', fr: 'Date de fin' },
  totalVolume: { en: 'Total volume', fr: 'Volume total' },
  commission: { en: 'Commission', fr: 'Commission' },
  earningsOverTime: { en: 'Earnings over time', fr: 'Revenus dans le temps' },
  vsPreviousPeriod: { en: 'vs previous period', fr: 'vs période précédente' },
  summary: { en: 'Summary', fr: 'Résumé' },
  yourBalance: { en: 'Credits (1 credit = €1)', fr: 'Crédits (1 crédit = 1 €)' },
  creditPacks: { en: 'Credit packs', fr: 'Packs de crédits' },
  buyCredits: { en: 'Buy credits', fr: 'Acheter des crédits' },
  buy: { en: 'Buy', fr: 'Acheter' },
  creditsAddedSuccess: { en: 'Credits added successfully', fr: 'Crédits ajoutés avec succès' },
  purchaseProcessing: { en: 'Processing purchase...', fr: 'Traitement de l\'achat...' },
  processingPayment: { en: 'Processing payment...', fr: 'Paiement en cours...' },
  paymentCanceled: { en: 'Payment canceled', fr: 'Paiement annulé' },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
