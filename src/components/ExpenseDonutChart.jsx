import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

function ExpenseDonutChart({ expenses }) {
  // Masraf kategorilerini analiz et
  const categorizeExpenses = (expenses) => {
    const categories = {
      yakit: { name: "Yakıt", total: 0, color: "#ef4444", icon: "⛽" },
      yol: { name: "Yol", total: 0, color: "#3b82f6", icon: "🛣️" },
      bakim: { name: "Bakım", total: 0, color: "#10b981", icon: "🔧" },
      yemek: { name: "Yemek", total: 0, color: "#f59e0b", icon: "🍽️" },
      faturalar: { name: "Faturalar", total: 0, color: "#8b5cf6", icon: "📄" },
      diger: { name: "Diğer", total: 0, color: "#6b7280", icon: "📦" },
      fatura: { name: "Fatura", total: 0, color: "#96ff73", icon: "📋" },
    };

    expenses.forEach((expense) => {
      const name = expense.name.toLowerCase().trim();

      if (
        name.includes("yakıt") ||
        name.includes("benzin") ||
        name.includes("mazot")
      ) {
        categories.yakit.total += expense.amount;
      } else if (
        name.includes("yol") ||
        name.includes("otoyol") ||
        name.includes("köprü") ||
        name.includes("geçiş")
      ) {
        categories.yol.total += expense.amount;
      } else if (
        name.includes("bakım") ||
        name.includes("onarım") ||
        name.includes("servis")
      ) {
        categories.bakim.total += expense.amount;
      } else if (
        name.includes("yemek") ||
        name.includes("restoran") ||
        name.includes("kahvaltı") ||
        name.includes("öğle") ||
        name.includes("akşam")
      ) {
        categories.yemek.total += expense.amount;
      } else if (
        name.includes("telefon") ||
        name.includes("elektrik") ||
        name.includes("su") ||
        name.includes("gaz") ||
        name.includes("internet")
      ) {
        categories.faturalar.total += expense.amount;
      } else if (name.includes("fatura")) {
        categories.fatura.total += expense.amount;
      } else {
        categories.diger.total += expense.amount;
      }
    });

    // Sadece değeri olan kategorileri döndür
    return Object.values(categories)
      .filter((cat) => cat.total > 0)
      .map((cat) => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
        icon: cat.icon,
        percentage: 0, // Sonra hesaplanacak
      }));
  };

  const data = categorizeExpenses(expenses);
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  // Yüzdeleri hesapla ve büyükten küçüğe sırala
  data.forEach((item) => {
    item.percentage =
      totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0;
  });

  // Data'yı değere göre büyükten küçüğe sırala
  const sortedData = data.sort((a, b) => b.value - a.value);

  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">
            {data.payload.icon} {data.payload.name}
          </p>
          <p className="text-blue-600">{format(data.value)} ₺</p>
          <p className="text-gray-500 text-sm">%{data.payload.percentage}</p>
        </div>
      );
    }
    return null;
  };

  // Hiç masraf yoksa
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Masraf Dağılımı
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-sm">Henüz masraf eklenmedi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4">
        Masraf Dağılımı
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Kategori listesi */}
      <div className="mt-4 space-y-2">
        {sortedData.map((category, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              ></div>
              <span>
                {category.icon} {category.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-medium">{format(category.value)} ₺</div>
              <div className="text-xs text-gray-500">
                %{category.percentage}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toplam */}
      <div className="border-t mt-3 pt-3">
        <div className="flex justify-between font-semibold">
          <span>💰 Toplam:</span>
          <span className="text-red-600">{format(totalAmount)} ₺</span>
        </div>
      </div>

      {/* En yüksek kategori vurgusu */}
      {sortedData.length > 0 && (
        <div className="bg-blue-50 p-2 rounded mt-3 text-xs text-blue-800">
          <span className="font-medium">🔝 En çok harcama:</span>{" "}
          {sortedData[0].icon} {sortedData[0].name}
          <span className="font-semibold"> (%{sortedData[0].percentage})</span>
        </div>
      )}
    </div>
  );
}

export default ExpenseDonutChart;
