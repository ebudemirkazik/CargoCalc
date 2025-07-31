import React, { useState } from "react";
import { useToast } from "./ToastNotification";

function AddExpenseForm({ onAddExpense }) {
  const [expense, setExpense] = useState({
    name: "",
    amount: "",
    kdvRate: 20
  });
  
  const [errors, setErrors] = useState({});

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
    
    // Başarı mesajı (isteğe bağlı)
    // alert("Masraf başarıyla eklendi! ✅");
  };

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4">Yeni Masraf Kalemi Ekle</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Masraf Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masraf Adı
          </label>
          <input
            type="text"
            placeholder="Örn: Yakıt, Bakım, Yol"
            value={expense.name}
            onChange={handleNameChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            maxLength={50}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Tutar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutar (₺)
          </label>
          <input
            type="text"
            placeholder="Örn: 1500"
            value={expense.amount}
            onChange={handleAmountChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              errors.amount 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* KDV Oranı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KDV Oranı
          </label>
          <select
            value={expense.kdvRate}
            onChange={(e) => setExpense({ ...expense, kdvRate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">KDV %0</option>
            <option value="1">KDV %1</option>
            <option value="10">KDV %10</option>
            <option value="20">KDV %20</option>
          </select>
        </div>

        {/* KDV Hesaplama Önizleme */}
        {expense.amount && !errors.amount && !isNaN(parseFloat(expense.amount)) && expense.kdvRate > 0 && (
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
            <p><strong>KDV Hesaplaması:</strong></p>
            <p>• KDV Tutarı: {format(parseFloat(expense.amount) * (expense.kdvRate / (100 + parseFloat(expense.kdvRate))))} ₺</p>
            <p>• Net Tutar: {format(parseFloat(expense.amount) - (parseFloat(expense.amount) * (expense.kdvRate / (100 + parseFloat(expense.kdvRate)))))} ₺</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!expense.name || !expense.amount || errors.name || errors.amount}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            !expense.name || !expense.amount || errors.name || errors.amount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          ➕ Masrafı Ekle
        </button>
      </form>
    </div>
  );
}

export default AddExpenseForm;