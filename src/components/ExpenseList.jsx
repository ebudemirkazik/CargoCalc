import React from "react";

function ExpenseList({ expenses, fixedExpenses = [], onDeleteExpense }) {
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
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Masraflar</h2>
        <p className="text-gray-500 text-sm">Henüz masraf eklenmedi.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Masraflar</h2>

      {/* Elle eklenen masraflar */}
      {expenses.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">
            Elle Eklenen Masraflar:
          </h3>
          <ul className="space-y-1">
            {expenses.map((expense, index) => {
              const kdvAmount =
                expense.amount * (expense.kdvRate / (100 + expense.kdvRate));

              return (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium">{expense.name}</span>
                    <span className="text-gray-600 ml-2">
                      {format(expense.amount)} ₺
                      {expense.kdvRate > 0 && (
                        <span className="text-xs ml-1">
                          (KDV %{expense.kdvRate} = {format(kdvAmount)} ₺)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Silme butonu */}
                  <button
                    onClick={() => {
                      onDeleteExpense(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                    title="Masrafı Sil"
                  >
                    🗑️
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="text-right mt-2 space-y-1">
            <div className="text-sm font-medium text-blue-600">
              Ara Toplam: {format(totalManualExpenses)} ₺
            </div>
            {totalManualKdv > 0 && (
              <div className="text-xs text-green-600">
                Toplam KDV: {format(totalManualKdv)} ₺
              </div>
            )}
          </div>
        </div>
      )}

      {/* Genel toplam */}
      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center font-bold text-base">
          <span>Toplam Aylık Masraf:</span>
          <span className="text-red-600">{format(totalManualExpenses)} ₺</span>
        </div>
        {totalManualKdv > 0 && (
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-green-700">Toplam İndirilecek KDV:</span>
            <span className="text-green-600 font-medium">
              {format(totalManualKdv)} ₺
            </span>
          </div>
        )}
      </div>

      {/* Açıklama */}
      {fixedExpenses.length > 0 && (
        <div className="bg-blue-50 p-2 rounded mt-3 text-xs text-blue-800">
          <p>
            Sabit giderler otomatik olarak her ay hesaplamalara dahil edilir.
          </p>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
