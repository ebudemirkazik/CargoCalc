
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

  console.log("History length:", history.length); // Debug için

  // Her zaman göster (test için)
  return (
    <div className="p-4 bg-white rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Önceki Hesaplamalar</h3>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Henüz kayıtlı hesaplama yok. Bir hesaplama yapıp kaydedin.
        </p>
      ) : (
        <ul className="space-y-3 text-sm">
          {history.map((item, i) => (
            <li key={i} className="border-b pb-3 bg-white p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-medium">
                  🗓️ {formatDate(item.date)}
                </p>
                <button
                  onClick={() => deleteHistoryItem(i)}
                  className="text-red-500 text-xs hover:underline hover:bg-red-50 px-2 py-1 rounded"
                >
                  🗑️ Sil
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>
                  💰 <strong>Net Kazanç:</strong> {format(item.netKazanc)} ₺
                </p>
                <p>
                  🔢 <strong>Hakediş:</strong> {format(item.income)} ₺
                </p>
                <p>
                  📦 <strong>Masraflar:</strong> {format(item.totalExpenses)} ₺
                </p>
                <p>
                  📉 <strong>Gelir Vergisi:</strong> {format(item.gelirVergisi)}{" "}
                  ₺
                </p>
                <p>
                  💸 <strong>Ödenecek KDV:</strong> {format(item.odenecekKdv)} ₺
                </p>
                <p>
                  🏦 <strong>Toplam Vergi:</strong>{" "}
                  {format(item.odenecekKdv + item.gelirVergisi)} ₺
                </p>
              </div>

              {/* Masraf detayları varsa göster */}
              {item.expenses && item.expenses.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 text-xs hover:underline">
                    Masraf Detayları ({item.expenses.length} kalem)
                  </summary>
                  <div className="mt-1 pl-3 border-l-2 border-gray-200">
                    {item.expenses.map((expense, idx) => (
                      <p key={idx} className="text-xs text-gray-600">
                        • {expense.name}: {format(expense.amount)} ₺
                        {expense.kdvRate && ` (KDV: %${expense.kdvRate})`}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Temizle butonu - sadece kayıt varsa göster */}
      {history.length > 0 && (
        <button
          onClick={() => {
            if (confirm("Tüm geçmişi silmek istediğinizden emin misiniz?")) {
              setHistory([]);
              localStorage.removeItem("cargoCalcHistory");
            }
          }}
          className="mt-3 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
        >
          🗑️ Tüm Geçmişi Temizle
        </button>
      )}
    </div>
  );
}

export default HistoryList;