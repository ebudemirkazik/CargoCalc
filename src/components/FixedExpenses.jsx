import React, { useState, useEffect } from "react";
import { useToast } from "./ToastNotification";

function FixedExpenses({ onFixedExpensesChange, onAddToManualExpenses }) {
  const { addToast } = useToast();
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    name: "",
    yearlyAmount: "",
    kdvRate: 20
  });

  // localStorage'dan yükle
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("fixedExpenses")) || [];
    setFixedExpenses(stored);
    calculateMonthlyExpenses(stored);
  }, []);

  // Aylık masrafları hesapla ve parent'a gönder
  const calculateMonthlyExpenses = (expenses) => {
    const monthlyExpenses = expenses.map(expense => ({
      ...expense,
      amount: Math.round(expense.yearlyAmount / 12), // Aylık tutar
      isFixed: true // Sabit gider olduğunu belirt
    }));
    
    // Parent'a sadece hesaplama için gönder, otomatik ekleme yapmayacağız
    if (onFixedExpensesChange) {
      onFixedExpensesChange(monthlyExpenses);
    }
  };

  // Yeni sabit gider ekle
  const handleAddExpense = (e) => {
    e.preventDefault();
    
    if (!newExpense.name || !newExpense.yearlyAmount) {
      addToast("Lütfen tüm alanları doldurun!", "warning", 3000);
      return;
    }

    const expense = {
      id: Date.now(),
      name: newExpense.name,
      yearlyAmount: parseFloat(newExpense.yearlyAmount),
      kdvRate: parseFloat(newExpense.kdvRate)
    };

    const updated = [...fixedExpenses, expense];
    setFixedExpenses(updated);
    localStorage.setItem("fixedExpenses", JSON.stringify(updated));
    calculateMonthlyExpenses(updated);

    // Form'u temizle
    setNewExpense({ name: "", yearlyAmount: "", kdvRate: 20 });
  };

  // Sabit gider sil
  const handleDeleteExpense = (id) => {
    const updated = fixedExpenses.filter(expense => expense.id !== id);
    setFixedExpenses(updated);
    localStorage.setItem("fixedExpenses", JSON.stringify(updated));
    calculateMonthlyExpenses(updated);
  };

  // Sabit gideri manuel masraflara ekle
  const handleAddToManual = (expense) => {
    const monthlyAmount = Math.round(expense.yearlyAmount / 12);
    const manualExpense = {
      name: expense.name,
      amount: monthlyAmount,
      kdvRate: expense.kdvRate
    };

    if (onAddToManualExpenses) {
      onAddToManualExpenses(manualExpense);
      addToast(`${expense.name} manuel masraflara eklendi! (${format(monthlyAmount)} ₺)`, "success", 3000);
    }
  };

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  const totalYearlyAmount = fixedExpenses.reduce((sum, expense) => sum + expense.yearlyAmount, 0);
  const totalMonthlyAmount = Math.round(totalYearlyAmount / 12);
  
  // Toplam KDV hesapla
  const totalYearlyKdv = fixedExpenses.reduce((sum, expense) => {
    const kdv = expense.yearlyAmount * (expense.kdvRate / (100 + expense.kdvRate));
    return sum + (isNaN(kdv) ? 0 : kdv);
  }, 0);
  const totalMonthlyKdv = Math.round(totalYearlyKdv / 12);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Yıllık Sabit Giderler</h2>
      
      {/* Yeni sabit gider ekleme formu */}
      <form onSubmit={handleAddExpense} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Gider adı (örn: Sigorta)"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Yıllık tutar"
            value={newExpense.yearlyAmount}
            onChange={(e) => setNewExpense({ ...newExpense, yearlyAmount: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={newExpense.kdvRate}
            onChange={(e) => setNewExpense({ ...newExpense, kdvRate: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="0">KDV %0</option>
            <option value="1">KDV %1</option>
            <option value="10">KDV %10</option>
            <option value="20">KDV %20</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            ➕ Ekle
          </button>
        </div>
      </form>

      {/* Sabit giderler listesi */}
      {fixedExpenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">Kayıtlı Sabit Giderler:</h3>
          {fixedExpenses.map((expense) => {
            const yearlyKdv = expense.yearlyAmount * (expense.kdvRate / (100 + expense.kdvRate));
            const monthlyKdv = Math.round(yearlyKdv / 12);
            const monthlyAmount = Math.round(expense.yearlyAmount / 12);
            
            return (
              <div key={expense.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                <div className="flex-1">
                  <span className="font-medium">{expense.name}</span>
                  <span className="text-gray-600 ml-2">
                    {format(expense.yearlyAmount)} ₺/yıl 
                    → <strong className="text-blue-600">{format(monthlyAmount)} ₺/ay</strong>
                  </span>
                  {expense.kdvRate > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      (KDV %{expense.kdvRate} = {format(monthlyKdv)} ₺/ay)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {/* Manuel masraflara ekle butonu */}
                  <button
                    onClick={() => handleAddToManual(expense)}
                    className="bg-green-500 text-white hover:bg-green-600 px-2 py-1 rounded text-xs transition-colors"
                    title={`${expense.name} masrafını manuel listeye ekle (${format(monthlyAmount)} ₺)`}
                  >
                    ➕
                  </button>
                  {/* Sil butonu */}
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
                    title="Sabit gideri sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Toplam */}
          <div className="border-t pt-2 mt-3 space-y-1">
            <div className="flex justify-between font-semibold text-sm">
              <span>Toplam Sabit Giderler:</span>
              <span>
                {format(totalYearlyAmount)} ₺/yıl 
                → <span className="text-blue-600">{format(totalMonthlyAmount)} ₺/ay</span>
              </span>
            </div>
            {totalMonthlyKdv > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>💰 Toplam İndirilecek KDV:</span>
                <span>
                  {format(totalYearlyKdv)} ₺/yıl 
                  → <strong>{format(totalMonthlyKdv)} ₺/ay</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Açıklama */}
      <div className="bg-blue-50 p-3 rounded mt-4 text-xs text-blue-800">
        <p><strong>💡 Nasıl çalışır:</strong></p>
        <p>• Yıllık sabit giderlerinizi buraya kaydedin (sigorta, rutin bakım, lastik vb.)</p>
        <p>• Bu giderler sadece burada görünür ve aylık tutarları hesaplanır</p>
        <p>• <strong>➕ butonu</strong> ile aylık tutarları manuel masraflara kolayca ekleyebilirsiniz</p>
      </div>
    </div>
  );
}

export default FixedExpenses;