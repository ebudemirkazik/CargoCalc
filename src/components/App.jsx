import React, { useState } from "react";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";
import IncomeInput from "./IncomeInput";
import Summary from "./Summary";
import HistoryList from "./HistoryList";
import FixedExpenses from "./FixedExpenses";
import ExpenseDonutChart from "./ExpenseDonutChart";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0); // History'yi yenilemek için
  const [fixedExpenses, setFixedExpenses] = useState([]); // Sabit giderler

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
  };

  const handleDeleteExpense = (indexToDelete) => {
    setExpenses((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  // Summary'den çağrılacak - history'yi yenilemek için
  const handleHistoryUpdate = () => {
    setRefreshHistory((prev) => prev + 1);
  };

  // Sabit giderleri güncelle
  const handleFixedExpensesChange = (monthlyFixedExpenses) => {
    setFixedExpenses(monthlyFixedExpenses);
  };

  // Sabit gideri manuel masraflara ekle
  const handleAddToManualExpenses = (fixedExpense) => {
    setExpenses((prev) => [...prev, fixedExpense]);
  };

  // Toplam masraflar = Sadece elle eklenen masraflar
  const allExpenses = expenses; // Sabit giderler dahil değil

  // CargoCalc Logosu Component
  const CargoCalcLogo = () => (
    <svg viewBox="0 0 64 64" className="w-24 h-24 mr-3">
      <defs>
        <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#f59e0b", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#d97706", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="cargoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#10b981", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#059669", stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="calcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1d4ed8", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Ana kamyon gövdesi */}
      <rect x="8" y="32" width="32" height="16" rx="2" fill="url(#truckGradient)" />
      
      {/* Kamyon kabini */}
      <rect x="38" y="28" width="12" height="20" rx="2" fill="url(#truckGradient)" />
      
      {/* Cargo konteyneri */}
      <rect x="10" y="34" width="28" height="12" rx="1" fill="url(#cargoGradient)" stroke="#ffffff" strokeWidth="1"/>
      
      {/* Cargo kutusu detayları */}
      <rect x="12" y="36" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      <rect x="20" y="36" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      <rect x="28" y="36" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      <rect x="12" y="41" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      <rect x="20" y="41" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      <rect x="28" y="41" width="6" height="3" rx="0.5" fill="#ffffff" opacity="0.3"/>
      
      {/* Tekerlekler */}
      <circle cx="16" cy="50" r="4" fill="#374151"/>
      <circle cx="16" cy="50" r="2.5" fill="#6b7280"/>
      <circle cx="44" cy="50" r="4" fill="#374151"/>
      <circle cx="44" cy="50" r="2.5" fill="#6b7280"/>
      
      {/* Hesaplama simgesi */}
      <circle cx="50" cy="14" r="8" fill="url(#calcGradient)" stroke="#ffffff" strokeWidth="2"/>
      <circle cx="47" cy="11" r="1" fill="#ffffff"/>
      <circle cx="53" cy="11" r="1" fill="#ffffff"/>
      <circle cx="47" cy="17" r="1" fill="#ffffff"/>
      <circle cx="53" cy="17" r="1" fill="#ffffff"/>
      
      {/* Plus işareti */}
      <line x1="48" y1="14" x2="52" y2="14" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="12" x2="50" y2="16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Hareket çizgileri */}
      <line x1="2" y1="40" x2="6" y2="40" stroke="#9ca3af" strokeWidth="1" opacity="0.6"/>
      <line x1="2" y1="44" x2="4" y2="44" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
      <line x1="2" y1="36" x2="4" y2="36" stroke="#9ca3af" strokeWidth="1" opacity="0.4"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <CargoCalcLogo />
            <div>
              <h1 className="text-4xl font-bold text-blue-600 mb-2">
                CargoCalc
              </h1>
              <p className="text-gray-600">
                Nakliye Maliyet ve Hakediş Hesaplama Sistemi
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Section - Input Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sol: Hakediş Girişi */}
          <div className="lg:col-span-1">
            <IncomeInput income={income} setIncome={setIncome} />
          </div>

          {/* Orta: Masraf Ekle*/}
          <div className="lg:col-span-1">
            <AddExpenseForm onAddExpense={handleAddExpense} />
          </div>

          {/* Sağ: Masraf Dağılımı Grafiği */}
          <div className="lg:col-span-1">
            <ExpenseDonutChart expenses={expenses} />
          </div>
        </div>

        {/* Middle Section - Fixed Expenses */}
        <div className="mb-8">
          <FixedExpenses 
            onFixedExpensesChange={handleFixedExpensesChange}
            onAddToManualExpenses={handleAddToManualExpenses}
          />
        </div>

        {/* Bottom Section - Main Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sol: Masraf Listesi */}
          <div className="xl:col-span-1">
            <ExpenseList
              expenses={expenses}
              fixedExpenses={[]}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>

          {/* Orta: Detaylı Özet */}
          <div className="xl:col-span-1">
            <Summary
              income={income}
              expenses={expenses}
              onHistoryUpdate={handleHistoryUpdate}
            />
          </div>

          {/* Sağ: Geçmiş */}
          <div className="xl:col-span-1">
            <HistoryList refreshTrigger={refreshHistory} />
          </div>
        </div>
      </main>
      {/* Footer - Yasal Uyarı */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Önemli Uyarı ve Yasal Sorumluluk Reddi
                </h3>
                <div className="text-sm text-yellow-700 space-y-2">
                  <p>
                    <strong>Bu hesaplama aracı sadece genel bilgi ve fikir vermek amacıyla hazırlanmıştır.</strong> 
                    Hesaplamalar %100 kesin değildir ve resmi vergi beyannamesi veya muhasebe işlemleri için kullanılmamalıdır.
                  </p>
                  <p>
                    • Gerçek vergi hesaplamaları için <strong>muhasebeci</strong> veya <strong>mali müşaviriniz</strong> ile görüşüniz.
                  </p>
                  <p>
                    • Vergi oranları ve mevzuat değişiklikleri hesaplamaları etkileyebilir.
                  </p>
                  <p>
                    • Bu araçtan kaynaklanan herhangi bir mali kayıp veya yanlış hesaplamadan CargoCalc sorumlu değildir.
                  </p>
                  <p className="font-medium">
                    <strong>Tavsiye:</strong> Bu sonuçları muhasebe uzmanınıza danışarak doğrulatın.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2025 CargoCalc. Bu araç bilgilendirme amaçlıdır. Profesyonel mali danışmanlık yerine geçmez.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}