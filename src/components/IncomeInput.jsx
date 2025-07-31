//Kullanıcının her ayki toplam gelirini (hakedişini) girmesini sağlar.

import React, { useState } from "react";

function IncomeInput({ income, setIncome }) {
  const [inputValue, setInputValue] = useState(income.toString());
  const [error, setError] = useState("");

  // Hakediş validasyonu
  const validateIncome = (value) => {
    if (!value) {
      return "Hakediş tutarı boş olamaz";
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Geçerli bir sayı giriniz";
    }

    if (numValue < 0) {
      return "Hakediş negatif olamaz";
    }

    if (numValue > 10000000) {
      return "Tutar çok büyük (max: 10.000.000₺)";
    }

    return null;
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Sadece sayı, nokta ve virgül kabul et
    value = value.replace(/[^0-9.,]/g, "");

    // Virgülü noktaya çevir
    value = value.replace(",", ".");

    // Birden fazla nokta varsa sadece ilkini bırak
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // Başında sıfır varsa temizle (00123 -> 123)
    if (value.length > 1 && value[0] === "0" && value[1] !== ".") {
      value = value.replace(/^0+/, "");
    }

    setInputValue(value);

    // Gerçek zamanlı validasyon
    const validationError = validateIncome(value);
    setError(validationError);

    // Hata yoksa parent'a gönder
    if (!validationError && value) {
      const numValue = parseFloat(value);
      setIncome(numValue);
    } else if (!value) {
      setIncome(0);
    }
  };

  const handleBlur = () => {
    // Focus kaybedince son validasyon
    const validationError = validateIncome(inputValue);
    setError(validationError);

    // Değer varsa formatla
    if (inputValue && !validationError) {
      const numValue = parseFloat(inputValue);
      setInputValue(numValue.toString());
      setIncome(numValue);
    }
  };

  const handleFocus = () => {
    // Focus alınca hatayı temizle
    setError("");
  };

  // Hızlı tutar butonları
  const quickAmounts = [
    100000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 150000,
  ];

  const handleQuickAmount = (amount) => {
    setInputValue(amount.toString());
    setIncome(amount);
    setError("");
  };

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4">Aylık Gelir (Hakediş)</h2>

      {/* Ana input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hakediş Tutarı (₺)
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Örn: 50000"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : income > 0
              ? "border-green-300 focus:ring-green-500 bg-green-50"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />

        {/* Hata mesajı */}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

        
       
      </div>

      {/* Hızlı tutar butonları */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hızlı Seçim:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmount(amount)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                income === amount
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300"
              }`}
            >
              {format(amount)} ₺
            </button>
          ))}
        </div>
      </div>

      {/* Temizle butonu */}
      {income > 0 && (
        <button
          onClick={() => {
            setInputValue("");
            setIncome(0);
            setError("");
          }}
          className="w-full mt-2 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🗑️ Temizle
        </button>
      )}

      {/* Bilgi kutusu */}
      {income > 0 && !error && (
        <div className="bg-blue-50 p-3 rounded-lg mt-4 text-xs text-blue-800">
          <p>
            <strong>💡 Hakediş Bilgisi:</strong>
          </p>
          <p>• KDV Dahil Tutar: {format(income)} ₺</p>
          <p>• KDV Tutarı (%20): {format(income * (20 / 120))} ₺</p>
          <p>• Net Tutar: {format(income - income * (20 / 120))} ₺</p>
        </div>
      )}
    </div>
  );
}

export default IncomeInput;
