//Bu bileşen localStorage'daki verileri okur ve ekrana yazdırır.

import React from "react";

function HistoryList({ refreshTrigger }) {
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    console.log("HistoryList component loaded"); // Debug için

    try {
      const stored = JSON.parse(localStorage.getItem("cargoCalcHistory")) || [];
      console.log("Stored data:", stored); // Debug için
      setHistory(stored.reverse());
    } catch (error) {
      console.error("LocalStorage okuma hatası:", error);
      setHistory([]);
    }
  }, [refreshTrigger]); // refreshTrigger değiştiğinde yeniden oku

  const deleteHistoryItem = (indexToDelete) => {
    const updated = history.filter((_, i) => i !== indexToDelete);
    setHistory(updated);
    localStorage.setItem("cargoCalcHistory", JSON.stringify(updated.reverse()));
  };

  const format = (n) => {
    if (!n || isNaN(n)) return "0";
    return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Tarih bilinmiyor";
    }
  };

  // Kısa tarih formatı (mobil için)
  const formatShortDate = (iso) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Bugün";
      if (diffDays === 2) return "Dün";
      if (diffDays <= 7) return `${diffDays} gün önce`;

      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch (error) {
      return "Tarih bilinmiyor";
    }
  };

  console.log("History length:", history.length); // Debug için

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-4 text-gray-800">
        Geçmiş Hesaplamalar
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8 sm:py-4">
          <div className="text-4xl sm:text-3xl mb-4 sm:mb-2">📊</div>
          <p className="text-base sm:text-sm text-gray-500 mb-2 sm:mb-1">
            Henüz kayıtlı hesaplama yok
          </p>
          <p className="text-sm sm:text-xs text-gray-400">
            Bir hesaplama yapıp kaydedin
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-3">
          {history.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-lg p-4 sm:p-3 hover:bg-gray-100 transition-colors"
            >
              {/* Başlık ve Silme Butonu */}
              <div className="flex justify-between items-start mb-4 sm:mb-2">
                <div>
                  <p className="text-base sm:text-sm font-semibold sm:font-medium text-gray-800 mb-1">
                    {formatShortDate(item.date)}
                  </p>
                  <p className="text-sm sm:text-xs text-gray-500">
                    {formatDate(item.date)}
                  </p>
                </div>

                <button
                  onClick={() => deleteHistoryItem(i)}
                  className="bg-blue-500 hover:bg-blue-700 text-white p-3 sm:p-1.75 rounded-xl sm:rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center transition-all transform active:scale-95 sm:active:scale-100"
                  title="Hesaplamayı Sil"
                >
                  <span className="text-base sm:text-xs">Sil</span>
                </button>
              </div>

              {/* Net Kazanç - Ana Vurgu */}
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 sm:p-2 mb-4 sm:mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-sm font-semibold text-green-800">
                    Net Kazanç:
                  </span>
                  <span className="text-xl sm:text-lg font-bold text-green-800">
                    {format(item.netKazanc)} ₺
                  </span>
                </div>
              </div>

              {/* Ana Bilgiler - Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 mb-4 sm:mb-3">
                <div className="bg-blue-50 p-3 sm:p-2 rounded-lg">
                  <p className="text-sm sm:text-xs text-blue-600 mb-1">
                    Hakediş:
                  </p>
                  <p className="text-lg sm:text-base font-bold text-blue-800">
                    {format(item.income)} ₺
                  </p>
                </div>

                <div className="bg-red-50 p-3 sm:p-2 rounded-lg">
                  <p className="text-sm sm:text-xs text-red-600 mb-1">
                    Masraflar:
                  </p>
                  <p className="text-lg sm:text-base font-bold text-red-800">
                    {format(item.totalExpenses)} ₺
                  </p>
                </div>

                <div className="bg-yellow-50 p-3 sm:p-2 rounded-lg">
                  <p className="text-sm sm:text-xs text-yellow-600 mb-1">
                    Ödenecek KDV:
                  </p>
                  <p className="text-lg sm:text-base font-bold text-yellow-800">
                    {format(item.odenecekKdv)} ₺
                  </p>
                </div>

                <div className="bg-purple-50 p-3 sm:p-2 rounded-lg">
                  <p className="text-sm sm:text-xs text-purple-600 mb-1">
                    Gelir Vergisi:
                  </p>
                  <p className="text-lg sm:text-base font-bold text-purple-800">
                    {format(item.gelirVergisi)} ₺
                  </p>
                </div>
              </div>

              {/* Toplam Vergi */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 sm:p-2 mb-4 sm:mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-sm font-semibold text-gray-700">
                    Toplam Vergi:
                  </span>
                  <span className="text-lg sm:text-base font-bold text-gray-800">
                    {format(item.odenecekKdv + item.gelirVergisi)} ₺
                  </span>
                </div>
              </div>

              {/* Masraf detayları varsa göster */}
              {item.expenses && item.expenses.length > 0 && (
                <details className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <summary className="p-3 sm:p-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm sm:text-xs font-medium text-gray-700">
                    <span className="text-xl md:text-sm font-bold md:font-medium text-blue-600">
                      Masraf Detayları
                    </span>
                    <span className="text-lg md:text-xs text-gray-500 bg-gray-100 px-3 py-1 md:px-2 md:py-0.5 rounded-full font-bold md:font-medium">
                      {item.expenses.length} kalem
                    </span>
                  </summary>

                  <div className="px-3 sm:px-2 pb-3 sm:pb-2 border-t border-gray-200 pt-3 sm:pt-2">
                    <div className="space-y-2 sm:space-y-1">
                      {item.expenses.map((expense, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-sm sm:text-xs text-gray-700">
                            {expense.name}
                            {expense.kdvRate > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (KDV: %{expense.kdvRate})
                              </span>
                            )}
                          </span>
                          <span className="text-sm sm:text-xs font-medium text-gray-800">
                            {format(expense.amount)} ₺
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              {/* Performans göstergesi */}
              <div className="mt-3 sm:mt-2 flex justify-between items-center text-sm sm:text-xs text-gray-500">
                <span>Kar Marjı:</span>
                <span className="font-semibold">
                  {item.income > 0
                    ? `${((item.netKazanc / item.income) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Temizle butonu - sadece kayıt varsa göster */}
      {history.length > 0 && (
        <div className="mt-6 sm:mt-4 space-y-3 sm:space-y-2">
          <button
            onClick={() => {
              if (confirm("Tüm geçmişi silmek istediğinizden emin misiniz?")) {
                setHistory([]);
                localStorage.removeItem("cargoCalcHistory");
              }
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 sm:px-3 py-3 sm:py-2 rounded-xl sm:rounded-lg text-base sm:text-sm font-semibold sm:font-medium transition-all transform active:scale-95 sm:active:scale-100"
          >
            Tüm Geçmişi Temizle
          </button>

          {/* İstatistik */}
          <div className="text-center text-sm sm:text-xs text-gray-500">
            Toplam {history.length} hesaplama kaydı.
          </div>
        </div>
      )}

      {/* Mobil ipucu */}
      <div className="block mt-4 bg-blue-50 border border-gray-200 rounded-xl p-3">
        <div className="text-gray-600 text-sm ">
          <p className="font-medium mb-1">İpucu:</p>
          <p>
            Masraf detaylarını görmek için "Masraf Detayları" bölümüne dokunun.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HistoryList;
