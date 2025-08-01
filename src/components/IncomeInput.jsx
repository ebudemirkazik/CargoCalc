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

  // Hızlı tutar butonları - Daha çeşitli ve mobil dostu
  const quickAmounts = [
    { amount: 80000, label: "80K", popular: false },
    { amount: 100000, label: "100K", popular: true },
    { amount: 115000, label: "115K", popular: true },
    { amount: 120000, label: "120K", popular: true },
    { amount: 125000, label: "125K", popular: true },
    { amount: 130000, label: "130K", popular: true },
    { amount: 135000, label: "135K", popular: false },
    { amount: 140000, label: "140K", popular: false },
    { amount: 150000, label: "150K", popular: true },
    { amount: 160000, label: "160K", popular: false },
    { amount: 175000, label: "175K", popular: false },
    { amount: 200000, label: "200K", popular: false },
  ];

  const handleQuickAmount = (amount) => {
    setInputValue(amount.toString());
    setIncome(amount);
    setError("");
  };

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
      <h2 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-4 text-gray-800 flex items-center">
        <span className="mr-2">💰</span>
        Aylık Hakediş
      </h2>

      {/* Ana input */}
      <div className="mb-6 sm:mb-4">
        <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-3 sm:mb-1">
          Hakediş Tutarı (₺)
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Örn: 125000"
          className={`
            w-full border rounded-xl sm:rounded-lg px-4 sm:px-3 py-4 sm:py-2 text-lg sm:text-sm font-semibold sm:font-medium
            focus:outline-none focus:ring-2 transition-colors
            ${
              error
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : income > 0
                ? "border-green-300 focus:ring-green-500 bg-green-50"
                : "border-gray-300 focus:ring-blue-500"
            }
          `}
        />

        {/* Hata mesajı */}
        {error && (
          <p className="text-red-500 text-sm sm:text-xs mt-2 sm:mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>

      {/* Hızlı tutar butonları - Popüler olanlar önce */}
      <div className="mb-6 sm:mb-4">
        <label className="block text-base sm:text-sm font-semibold sm:font-medium text-gray-700 mb-3 sm:mb-2">
          Hızlı Seçim:
        </label>

        {/* Popüler tutarlar */}
        <div className="mb-3 sm:mb-2">
          <p className="text-sm sm:text-xs text-gray-500 mb-2 sm:mb-1">
            Popüler Tutarlar:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-2">
            {quickAmounts
              .filter((item) => item.popular)
              .map((item) => (
                <button
                  key={item.amount}
                  onClick={() => handleQuickAmount(item.amount)}
                  className={`
                  px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-xs rounded-xl sm:rounded-lg border-2 font-semibold sm:font-medium 
                  transition-all transform active:scale-95 sm:active:scale-100
                  ${
                    income === item.amount
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                  }
                `}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>

        {/* Diğer tutarlar - Genişletilebilir */}
        <details className="group">
          <summary className="cursor-pointer text-blue-600 text-sm sm:text-xs hover:text-blue-800 font-medium transition-colors flex items-center">
            Diğer Tutarlar
            <span className="ml-1 group-open:rotate-180 transition-transform">
              ⬇️
            </span>
          </summary>
          <div className="mt-3 sm:mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-2">
            {quickAmounts
              .filter((item) => !item.popular)
              .map((item) => (
                <button
                  key={item.amount}
                  onClick={() => handleQuickAmount(item.amount)}
                  className={`
                  px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-xs rounded-xl sm:rounded-lg border transition-all transform active:scale-95 sm:active:scale-100
                  ${
                    income === item.amount
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }
                `}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </details>
      </div>

      {/* Temizle butonu */}
      {income > 0 && (
        <button
          onClick={() => {
            setInputValue("");
            setIncome(0);
            setError("");
          }}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 sm:px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg text-base sm:text-sm font-semibold sm:font-medium transition-all transform active:scale-95 sm:active:scale-100"
        >
          Temizle
        </button>
      )}

      {/* Bilgi kutusu - Geliştirilmiş */}
      {income > 0 && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-lg p-4 sm:p-3 mt-6 sm:mt-4">
          <p className="text-base sm:text-sm font-semibold sm:font-medium text-blue-800 mb-3 sm:mb-2 flex items-center">
            Hakediş Analizi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 text-sm sm:text-xs text-blue-700">
            <div className="bg-white rounded-lg p-3 sm:p-2">
              <p className="font-medium mb-1">KDV Dahil Tutar:</p>
              <p className="text-lg sm:text-base font-bold text-blue-800">
                {format(income)} ₺
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-2">
              <p className="font-medium mb-1">KDV Tutarı (%20):</p>
              <p className="text-lg sm:text-base font-bold text-red-600">
                {format(income * (20 / 120))} ₺
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-2 sm:col-span-2">
              <p className="font-medium mb-1">Net Hakediş (KDV Hariç):</p>
              <p className="text-lg sm:text-base font-bold text-green-600">
                {format(income - income * (20 / 120))} ₺
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobil ipucu */}
      <div className="block sm:hidden mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div className="flex items-start text-gray-600 text-sm">
          <span className="mr-2 mt-0.5">💡</span>
          <div>
            <p className="font-medium mb-1">İpucu:</p>
            <p>
              Hızlı seçim butonlarını kullanarak yaygın hakediş tutarlarını
              kolayca seçebilirsiniz.
            </p>
            <p>
              "Diğer Tutarlar" butonundan farklı tutardaki hakedişlere
              erişebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomeInput;
