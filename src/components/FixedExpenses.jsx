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
    addToast("Sabit gider başarıyla eklendi!", "success", 3000);
  };

  // Sabit gider sil
  const handleDeleteExpense = (id) => {
    const updated = fixedExpenses.filter(expense => expense.id !== id);
    setFixedExpenses(updated);
    localStorage.setItem("fixedExpenses", JSON.stringify(updated));
    calculateMonthlyExpenses(updated);
    addToast("Sabit gider silindi!", "success", 2000);
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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-3 text-gray-800">
        Yıllık Sabit Giderler
      </h2>
      
      {/* Yeni sabit gider ekleme formu */}
      <form onSubmit={handleAddExpense} className="mb-6 sm:mb-4">
        <div className="space-y-4 sm:space-y-3 mb-4 sm:mb-3">
          
          {/* Gider Adı */}
          <div>
            <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
              Gider Adı
            </label>
            <input
              type="text"
              placeholder="Örn: Sigorta, Bakım, Lastik"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Yıllık Tutar */}
          <div>
            <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
              Yıllık Tutar (₺)
            </label>
            <input
              type="number"
              placeholder="Örn: 12000"
              value={newExpense.yearlyAmount}
              onChange={(e) => setNewExpense({ ...newExpense, yearlyAmount: e.target.value })}
              className="w-full border border-gray-300 rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* KDV Oranı */}
          <div>
            <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
              KDV Oranı
            </label>
            <select
              value={newExpense.kdvRate}
              onChange={(e) => setNewExpense({ ...newExpense, kdvRate: e.target.value })}
              className="w-full border border-gray-300 rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">KDV %0 - Muaf</option>
              <option value="1">KDV %1 - Özel</option>
              <option value="10">KDV %10 - İndirimli</option>
              <option value="20">KDV %20 - Genel</option>
            </select>
          </div>
        </div>

        {/* Aylık tutar önizlemesi */}
        {newExpense.yearlyAmount && !isNaN(parseFloat(newExpense.yearlyAmount)) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-lg p-4 sm:p-3 mb-4 sm:mb-3">
            <p className="text-base sm:text-sm font-semibold text-blue-800 mb-2 sm:mb-1">
              Aylık Tutar Önizlemesi:
            </p>
            <div className="space-y-1 text-sm sm:text-xs text-blue-700">
              <p>• Aylık Tutar: <span className="font-semibold">{format(parseFloat(newExpense.yearlyAmount) / 12)} ₺</span></p>
              {newExpense.kdvRate > 0 && (
                <p>• Aylık KDV İndirimi: <span className="font-semibold">{format((parseFloat(newExpense.yearlyAmount) / 12) * (newExpense.kdvRate / (100 + parseFloat(newExpense.kdvRate))))} ₺</span></p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!newExpense.name || !newExpense.yearlyAmount}
          className={`
            w-full py-4 sm:py-2 px-6 sm:px-4 rounded-xl sm:rounded-lg text-lg sm:text-sm font-bold sm:font-medium 
            transition-all transform active:scale-95 sm:active:scale-100
            ${!newExpense.name || !newExpense.yearlyAmount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          Sabit Gider Ekle
        </button>
      </form>

      {/* Sabit giderler listesi */}
      {fixedExpenses.length > 0 && (
        <div className="space-y-4 sm:space-y-2 mb-6 sm:mb-4">
          <h3 className="font-semibold text-base sm:text-sm text-gray-700">
            Kayıtlı Sabit Giderler:
          </h3>
          
          <div className="space-y-3 sm:space-y-2">
            {fixedExpenses.map((expense) => {
              const yearlyKdv = expense.yearlyAmount * (expense.kdvRate / (100 + expense.kdvRate));
              const monthlyKdv = Math.round(yearlyKdv / 12);
              const monthlyAmount = Math.round(expense.yearlyAmount / 12);
              
              return (
                <div key={expense.id} className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-lg p-4 sm:p-3">
                  
                  {/* Başlık ve Butonlar */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-2">
                    <div className="flex-1 mb-3 sm:mb-0 sm:mr-3">
                      <h4 className="text-lg sm:text-base font-bold sm:font-semibold text-gray-800 mb-1">
                        {expense.name}
                      </h4>
                      
                      {/* Tutarlar */}
                      <div className="space-y-1">
                        <p className="text-base sm:text-sm text-gray-600">
                          Yıllık: <span className="font-semibold text-gray-800">{format(expense.yearlyAmount)} ₺</span>
                        </p>
                        <p className="text-base sm:text-sm text-blue-600">
                          Aylık: <span className="font-bold">{format(monthlyAmount)} ₺</span>
                        </p>
                        {expense.kdvRate > 0 && (
                          <p className="text-sm sm:text-xs text-green-600">
                            KDV %{expense.kdvRate} = {format(monthlyKdv)} ₺/ay
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex space-x-3 sm:space-x-2">
                      {/* Manuel masraflara ekle butonu */}
                      <button
                        onClick={() => handleAddToManual(expense)}
                        className="flex-1 sm:flex-none bg-green-500 hover:bg-green-700 text-white px-4 sm:px-2 py-3 sm:py-1.5 rounded-xl sm:rounded text-base sm:text-xs font-semibold sm:font-medium transition-all transform active:scale-95 sm:active:scale-100 min-h-[48px] sm:min-h-auto"
                        title={`${expense.name} masrafını manuel listeye ekle (${format(monthlyAmount)} ₺)`}
                      >
                        <span className="sm:hidden">Manuel Listeye Ekle</span>
                        <span className="hidden sm:inline">➕ Ekle</span>
                      </button>
                      
                      {/* Sil butonu */}
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 sm:px-2 py-3 sm:py-1.5 rounded-xl sm:rounded text-base sm:text-xs font-semibold sm:font-medium transition-all transform active:scale-95 sm:active:scale-100 min-h-[48px] sm:min-h-auto"
                        title="Sabit gideri sil"
                      >
                        
                        <span className="text-base sm:text-xs">🗑️Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Toplam */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-lg p-4 sm:p-3 mt-4 sm:mt-3">
            <div className="space-y-3 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-sm font-bold text-blue-800">
                  Toplam Sabit Giderler:
                </span>
                <div className="text-right">
                  <p className="text-sm sm:text-xs text-blue-600">
                    {format(totalYearlyAmount)} ₺/yıl
                  </p>
                  <p className="text-lg sm:text-base font-bold text-blue-800">
                    {format(totalMonthlyAmount)} ₺/ay
                  </p>
                </div>
              </div>
              
              {totalMonthlyKdv > 0 && (
                <div className="flex justify-between items-center pt-2 sm:pt-1 border-t border-blue-200">
                  <span className="text-base sm:text-sm font-semibold text-green-700">
                    Toplam İndirilecek KDV:
                  </span>
                  <div className="text-right">
                    <p className="text-sm sm:text-xs text-green-600">
                      {format(totalYearlyKdv)} ₺/yıl
                    </p>
                    <p className="text-lg sm:text-base font-bold text-green-600">
                      {format(totalMonthlyKdv)} ₺/ay
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Açıklama */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-lg p-4 sm:p-3">
        <p className="text-base sm:text-sm font-semibold text-blue-800 mb-3 sm:mb-2">
          Nasıl Çalışır:
        </p>
        <div className="space-y-2 sm:space-y-1 text-sm sm:text-xs text-blue-700">
          <p>• Yıllık sabit giderlerinizi buraya kaydedin (sigorta, rutin bakım, lastik vb.)</p>
          <p>• Bu giderler sadece burada görünür ve aylık tutarları hesaplanır</p>
          <p>• "Manuel Listeye Ekle" butonu ile aylık tutarları kolayca manuel masraflara ekleyebilirsiniz</p>
        </div>
      </div>

      {/* Mobil ipucu */}
      <div className="block sm:hidden mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div className="text-gray-600 text-sm">
          <p className="font-medium mb-1">İpucu:</p>
          <p>Sabit giderlerinizi kaydettikten sonra "Manuel Listeye Ekle" butonuna basarak aylık hesaplamalara dahil edebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}

export default FixedExpenses;