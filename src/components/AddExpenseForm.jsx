import React, { useState } from "react";
import { useToast } from "./ToastNotification";

function AddExpenseForm({ onAddExpense }) {
  const [expense, setExpense] = useState({
    name: "",
    amount: "",
    kdvRate: 20
  });
  
  const [errors, setErrors] = useState({});

  // Hızlı masraf şablonları
  const quickExpenses = [
    { name: "Yakıt", kdvRate: 20, icon: "⛽" },
    { name: "Yol", kdvRate: 20, icon: "🛣️" },
    { name: "Bakım", kdvRate: 20, icon: "🔧" },
    { name: "Yemek", kdvRate: 10, icon: "🍽️" },
    { name: "Sigorta", kdvRate: 20, icon: "🛡️" },
    { name: "Lastik", kdvRate: 20, icon: "🔘" }
  ];

  // Masraf adı validasyonu - sadece harfler, boşluk ve Türkçe karakterler
  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    if (!name.trim()) {
      return "Masraf adı boş olamaz";
    }
    if (name.trim().length < 2) {
      return "Masraf adı en az 2 karakter olmalı";
    }
    if (!nameRegex.test(name.trim())) {
      return "Masraf adında sadece harfler kullanılabilir";
    }
    return null;
  };

  // Tutar validasyonu - sadece sayılar ve ondalık
  const validateAmount = (amount) => {
    if (!amount) {
      return "Tutar boş olamaz";
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return "Geçerli bir sayı giriniz";
    }
    if (numAmount <= 0) {
      return "Tutar 0'dan büyük olmalı";
    }
    if (numAmount > 1000000) {
      return "Tutar çok büyük (max: 1.000.000₺)";
    }
    return null;
  };

  // Input değişiklikleri
  const handleNameChange = (e) => {
    const value = e.target.value;
    setExpense({ ...expense, name: value });
    
    // Gerçek zamanlı validasyon
    const error = validateName(value);
    setErrors({ ...errors, name: error });
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    // Sadece sayı, nokta ve virgül kabul et
    value = value.replace(/[^0-9.,]/g, '');
    // Virgülü noktaya çevir
    value = value.replace(',', '.');
    // Birden fazla nokta varsa sadece ilkini bırak
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    setExpense({ ...expense, amount: value });
    
    // Gerçek zamanlı validasyon
    const error = validateAmount(value);
    setErrors({ ...errors, amount: error });
  };

  // Hızlı masraf seçimi
  const handleQuickExpense = (quickExpense) => {
    setExpense({
      name: quickExpense.name,
      amount: expense.amount, // Mevcut tutarı koru
      kdvRate: quickExpense.kdvRate
    });
    
    // Name error'ını temizle
    setErrors({ ...errors, name: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Tüm alanları valide et
    const nameError = validateName(expense.name);
    const amountError = validateAmount(expense.amount);
    
    if (nameError || amountError) {
      setErrors({
        name: nameError,
        amount: amountError
      });
      return;
    }

    // Temiz veri oluştur
    const cleanExpense = {
      name: expense.name.trim(),
      amount: parseFloat(expense.amount),
      kdvRate: parseFloat(expense.kdvRate)
    };

    onAddExpense(cleanExpense);
    
    // Formu temizle
    setExpense({ name: "", amount: "", kdvRate: 20 });
    setErrors({});
  };

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <h2 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-4 text-gray-800 flex items-center">
        <span className="mr-2">➕</span>
        Yeni Masraf Ekle
      </h2>
      
      {/* Hızlı Masraf Seçimi - Mobilde daha büyük */}
      <div className="mb-6 sm:mb-4">
        <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-3 sm:mb-2">
          🚀 Hızlı Seçim:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-2">
          {quickExpenses.map((quick) => (
            <button
              key={quick.name}
              type="button"
              onClick={() => handleQuickExpense(quick)}
              className={`
                flex flex-col items-center p-3 sm:p-2 rounded-xl sm:rounded-lg border-2 transition-all transform active:scale-95 sm:active:scale-100
                ${expense.name === quick.name 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              <span className="text-2xl sm:text-xl mb-1">{quick.icon}</span>
              <span className="text-sm sm:text-xs font-medium">{quick.name}</span>
              <span className="text-xs text-gray-500">KDV %{quick.kdvRate}</span>
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-4">
        {/* Masraf Adı */}
        <div>
          <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
            📝 Masraf Adı
          </label>
          <input
            type="text"
            placeholder="Örn: Yakıt, Bakım, Yol"
            value={expense.name}
            onChange={handleNameChange}
            className={`
              w-full border rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm 
              focus:outline-none focus:ring-2 transition-colors
              ${errors.name 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
            maxLength={50}
          />
          {errors.name && (
            <p className="text-red-500 text-sm sm:text-xs mt-2 sm:mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Tutar */}
        <div>
          <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
            💰 Tutar (₺)
          </label>
          <input
            type="text"
            placeholder="Örn: 1500"
            value={expense.amount}
            onChange={handleAmountChange}
            className={`
              w-full border rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm 
              focus:outline-none focus:ring-2 transition-colors
              ${errors.amount 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm sm:text-xs mt-2 sm:mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.amount}
            </p>
          )}
        </div>

        {/* KDV Oranı */}
        <div>
          <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-2 sm:mb-1">
            📊 KDV Oranı
          </label>
          <select
            value={expense.kdvRate}
            onChange={(e) => setExpense({ ...expense, kdvRate: e.target.value })}
            className="w-full border border-gray-300 rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">KDV %0</option>
            <option value="1">KDV %1</option>
            <option value="10">KDV %10</option>
            <option value="20">KDV %20</option>
          </select>
        </div>

        {/* KDV Hesaplama Önizleme */}
        {expense.amount && !errors.amount && !isNaN(parseFloat(expense.amount)) && expense.kdvRate > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded p-4 sm:p-3">
            <p className="text-base sm:text-sm font-semibold sm:font-medium text-blue-800 mb-2 sm:mb-1 flex items-center">
              <span className="mr-2">🧮</span>
              KDV Hesaplaması:
            </p>
            <div className="space-y-1 text-sm sm:text-xs text-blue-700">
              <p>• KDV Tutarı: <span className="font-semibold">{format(parseFloat(expense.amount) * (expense.kdvRate / (100 + parseFloat(expense.kdvRate))))} ₺</span></p>
              <p>• Net Tutar: <span className="font-semibold">{format(parseFloat(expense.amount) - (parseFloat(expense.amount) * (expense.kdvRate / (100 + parseFloat(expense.kdvRate)))))} ₺</span></p>
            </div>
          </div>
        )}

        {/* Submit Button - Mobilde büyük */}
        <button
          type="submit"
          disabled={!expense.name || !expense.amount || errors.name || errors.amount}
          className={`
            w-full py-4 sm:py-2 px-6 sm:px-4 rounded-xl sm:rounded-lg text-lg sm:text-sm font-bold sm:font-medium 
            transition-all transform active:scale-95 sm:active:scale-100 shadow-lg sm:shadow-none
            ${!expense.name || !expense.amount || errors.name || errors.amount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          `}
        >
          {!expense.name || !expense.amount || errors.name || errors.amount ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">⚠️</span>
              Bilgileri Tamamlayın
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">➕</span>
              Masrafı Ekle
            </span>
          )}
        </button>
      </form>

      {/* Mobil ipucu */}
      <div className="block sm:hidden mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div className="flex items-start text-gray-600 text-sm">
          <span className="mr-2 mt-0.5">💡</span>
          <div>
            <p className="font-medium mb-1">İpucu:</p>
            <p>Hızlı seçim butonlarını kullanarak yaygın masrafları kolayca ekleyebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExpenseForm;