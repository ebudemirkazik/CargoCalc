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

  // Sayfa title'ını güncelle
  React.useEffect(() => {
    document.title = "CargoCalc - Nakliye Hesaplama";

    // Favicon ekle (emoji as favicon)
    const favicon =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    favicon.type = "image/svg+xml";
    favicon.rel = "shortcut icon";
    favicon.href =
      "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚛</text></svg>";
    document.getElementsByTagName("head")[0].appendChild(favicon);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              <span className="text-5xl mr-3">🚛</span>
              CargoCalc
            </h1>
            <p className="text-gray-600">
              Nakliye Maliyet ve Hakediş Hesaplama Sistemi
            </p>
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
    </div>
  );
}