import React from "react";

function ExpenseList({ expenses = [], fixedExpenses = [], onDeleteExpense }) {
  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  const totalManualExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalFixedExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const grandTotal = totalManualExpenses + totalFixedExpenses;

  // Elle eklenen masrafların toplam KDV'si
  const totalManualKdv = expenses.reduce((sum, expense) => {
    const kdv = expense.amount * (expense.kdvRate / (100 + expense.kdvRate));
    return sum + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  if (expenses.length === 0 && fixedExpenses.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
          Masraflar
        </h2>

        {/* Boş durum - Mobil optimized */}
        <div className="text-center py-6 sm:py-4">
          <div className="text-4xl sm:text-3xl mb-3 sm:mb-2">💸</div>
          <p className="text-base sm:text-sm text-gray-500 mb-2">
            Henüz masraf eklenmedi!
          </p>
          <p className="text-sm sm:text-xs text-gray-400">
            Yakıt, yol, bakım gibi masraflarınızı ekleyiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-3 flex items-center">
        Masraflar
        {expenses.length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm sm:text-xs px-2 py-1 rounded-full">
            {expenses.length}
          </span>
        )}
      </h2>

      {/* Elle eklenen masraflar */}
      {expenses.length > 0 && (
        <div className="mb-4 sm:mb-4">
          <h3 className="font-medium text-base sm:text-sm text-gray-700 mb-3 sm:mb-2">
            Elle Eklenen Masraflar:
          </h3>

          <ul className="space-y-3 sm:space-y-1">
            {expenses.map((expense, index) => {
              const kdvAmount =
                expense.amount * (expense.kdvRate / (100 + expense.kdvRate));

              return (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-4 sm:p-3 rounded-xl sm:rounded text-base sm:text-sm group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 mr-3">
                    {/* Mobil: Dikey layout, Desktop: Horizontal */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-semibold sm:font-medium text-gray-800 mb-1 sm:mb-0">
                        {expense.name}
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:ml-2">
                        <span className="text-lg sm:text-base font-bold sm:font-medium text-red-600">
                          {format(expense.amount)} ₺
                        </span>

                        {expense.kdvRate > 0 && (
                          <span className="text-sm sm:text-xs text-green-600 mt-1 sm:mt-0 sm:ml-2">
                            (KDV %{expense.kdvRate} = {format(kdvAmount)} ₺)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SİL BUTONU - MOBİLDE HER ZAMAN GÖRÜNÜR */}
                  <button
                    onClick={() => onDeleteExpense(index)}
                    className="bg-blue-500 hover:bg-blue-700 text-white p-3 sm:p-1.5 rounded-xl sm:rounded min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center transition-all transform active:scale-95 sm:active:scale-100"
                  title="Masrafı Sil"
                  >
                    <span className="text-base sm:text-xs">🗑️ Sil</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Ara toplam */}
          <div className="text-right mt-4 sm:mt-2 space-y-2 sm:space-y-1">
            <div className="text-base sm:text-sm font-semibold sm:font-medium text-blue-600">
              Ara Toplam: {format(totalManualExpenses)} ₺
            </div>
            {totalManualKdv > 0 && (
              <div className="text-sm sm:text-xs text-green-600">
                Toplam KDV: {format(totalManualKdv)} ₺
              </div>
            )}
          </div>
        </div>
      )}

      {/* Genel toplam */}
      <div className="border-t pt-4 sm:pt-3 mt-4 sm:mt-3">
        <div className="flex justify-between items-center font-bold text-lg sm:text-base">
          <span>Toplam Aylık Masraf:</span>
          <span className="text-red-600">{format(totalManualExpenses)} ₺</span>
        </div>
        {totalManualKdv > 0 && (
          <div className="flex justify-between items-center text-base sm:text-sm mt-2 sm:mt-1">
            <span className="text-green-700">Toplam İndirilecek KDV:</span>
            <span className="text-green-600 font-semibold sm:font-medium">
              {format(totalManualKdv)} ₺
            </span>
          </div>
        )}
      </div>

      {/* Açıklama */}
      {fixedExpenses.length > 0 && (
        <div className="bg-blue-50 p-3 sm:p-2 rounded-xl sm:rounded mt-4 sm:mt-3 text-sm sm:text-xs text-blue-800">
          <p>
            Sabit giderler otomatik olarak her ay hesaplamalara dahil edilir.
          </p>
        </div>
      )}

      {/* Mobil ipucu */}
      <div className="block sm:hidden mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div className="flex items-center justify-center text-gray-500 text-sm">
          <span className="mr-2">💡</span>
          Masraf silmek için kırmızı butona dokunun
        </div>
      </div>
    </div>
  );
}

export default ExpenseList;
