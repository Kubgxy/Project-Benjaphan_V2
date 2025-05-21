
import React, { createContext, useContext, useState } from 'react';
import { th } from 'date-fns/locale/th';
import { enUS } from 'date-fns/locale';

type LanguageContextType = {
  language: 'th' | 'en';
  setLanguage: (lang: 'th' | 'en') => void;
  locale: typeof th | typeof enUS;
  t: (key: string) => string;
};

const translations = {
  th: {
    dashboard: 'แดชบอร์ด',
    products: 'สินค้า',
    orders: 'ออเดอร์',
    customers: 'ลูกค้า',
    articles: 'บทความ',
    messages: 'ข้อความ',
    notifications: 'การแจ้งเตือน',
    settings: 'ตั้งค่า',
    logout: 'ออกจากระบบ',
    selectDateRange: 'เลือกช่วงวันที่',
    search: 'ค้นหา...',
    searchMessages: 'ค้นหาข้อความ...',
    filterByStatus: 'กรองตามสถานะ',
    allMessages: 'ข้อความทั้งหมด',
    readMessages: 'อ่านแล้ว',
    unreadMessages: 'ยังไม่ได้อ่าน',
    totalMessages: 'จำนวนข้อความทั้งหมด',
    unreadMessagesCount: 'ข้อความที่ยังไม่ได้อ่าน',
    readMessagesCount: 'ข้อความที่อ่านแล้ว',
    view: 'ดู',
    delete: 'ลบ',
    close: 'ปิด',
    from: 'จาก',
    phone: 'โทรศัพท์',
    language: 'ภาษา',
    theme: 'ธีม',
    light: 'สว่าง',
    dark: 'มืด',
  },
  en: {
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    articles: 'Articles',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    selectDateRange: 'Select date range',
    search: 'Search...',
    searchMessages: 'Search messages...',
    filterByStatus: 'Filter by status',
    allMessages: 'All Messages',
    readMessages: 'Read',
    unreadMessages: 'Unread',
    totalMessages: 'Total Messages',
    unreadMessagesCount: 'Unread Messages',
    readMessagesCount: 'Read Messages',
    view: 'View',
    delete: 'Delete',
    close: 'Close',
    from: 'From',
    phone: 'Phone',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  const value = {
    language,
    setLanguage,
    locale: language === 'th' ? th : enUS,
    t: (key: string) => translations[language][key as keyof typeof translations.th] || key,
  };

  return (
    <LanguageContext.Provider value={value}>
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
