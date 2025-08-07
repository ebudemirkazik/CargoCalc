//Gelir – Gider farkını yani net kazancı gösterir.

import { useEffect } from "react";
import React from "react";
import { calculateIncomeTax } from "../utils/taxCalculator";
import { useToast } from "./ToastNotification";
import { exportToExcel } from "../utils/exportToExcel";
import { getCategory } from "../utils/categorizeExpense";
import { exportToPDF } from "../utils/exportToPDF";

function Summary({ income, expenses, onHistoryUpdate }) {
  const { addToast } = useToast();
  const saveSummaryToLocal = (data) => {
    try {
      const existing =
        JSON.parse(localStorage.getItem("cargoCalcHistory")) || [];
      existing.push({ ...data, date: new Date().toISOString() });
      localStorage.setItem("cargoCalcHistory", JSON.stringify(existing)); // Tutarlı anahtar
    } catch (error) {
      console.error("Hesaplama geçmişi kaydedilemedi:", error);
    }
  };

  // Fatura kontrol fonksiyonu
  const isFatura = (item) => item.name.trim().toLowerCase() === "fatura";

  // **DÜZELTME: Gerçek nakit çıkan masraflar (ekranda gösterilecek) - Fatura hariç**
  const totalExpenses = expenses.reduce((acc, item) => {
    return isFatura(item) ? acc : acc + item.amount;
  }, 0);

  // **DÜZELTME: İndirilecek tüm KDV'ler (fatura dahil)**
  const totalKdv = expenses.reduce((acc, item) => {
    const rate = item.kdvRate || 20; // Default %20
    const kdv = item.amount * (rate / (100 + rate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  // **DÜZELTME: Vergi matrahından düşülecek masrafların KDV HARİÇ tutarları**
  const vergiMatrahMasraflarKdvHaric = expenses.reduce((acc, item) => {
    const rate = item.kdvRate || 20;
    const kdvHaricTutar = item.amount / (1 + rate/100);
    return acc + kdvHaricTutar;
  }, 0);

  // **DÜZELTME: Hakediş KDV'si (%20 dahil hesaplaması)**
  const hakedisKdv = income * (20 / 120);

  // **DÜZELTME: Devlete ödenecek KDV**
  const odenecekKdv = Math.max(0, hakedisKdv - totalKdv);

  // **DÜZELTME: KDV hariç gelir**
  const kdvHaricGelir = income / 1.20;

  // **DÜZELTME: Gelir vergisi matrahı (KDV hariç gelir - KDV hariç masraflar)**
  const gelirVergisiMatrahi = Math.max(0, kdvHaricGelir - vergiMatrahMasraflarKdvHaric);

  // **DÜZELTME: Gelir vergisi hesaplama - Doğru vergi dilimleri**
  function calculateYearlyIncomeTax(yearlyIncome) {
    const taxBrackets = [
      { min: 0, max: 158000, rate: 0.15, fixedTax: 0 },
      { min: 158000, max: 330000, rate: 0.20, fixedTax: 23700 },
      { min: 330000, max: 1200000, rate: 0.27, fixedTax: 58100 },
      { min: 1200000, max: 4300000, rate: 0.35, fixedTax: 293000 },
      { min: 4300000, max: Infinity, rate: 0.40, fixedTax: 1378000 }
    ];

    if (yearlyIncome <= 0) return 0;

    for (let i = 0; i < taxBrackets.length; i++) {
      const bracket = taxBrackets[i];
      if (yearlyIncome > bracket.min && yearlyIncome <= bracket.max) {
        const taxable = yearlyIncome - bracket.min;
        return bracket.fixedTax + (taxable * bracket.rate);
      }
    }
    return 0;
  }

  // **DÜZELTME: Yıllık matrah üzerinden gelir vergisi hesapla**
  const yillikGelirVergisiMatrahi = gelirVergisiMatrahi * 12;
  const yillikGelirVergisi = yillikGelirVergisiMatrahi > 0 ? calculateYearlyIncomeTax(yillikGelirVergisiMatrahi) : 0;
  const gelirVergisi = yillikGelirVergisi / 12;

  // **DÜZELTME: Net kazanç**
  const netKazanc = income - totalExpenses - odenecekKdv - gelirVergisi;

  // Fatura masraflarını ayrı gösterelim
  const faturaExpenses = expenses.filter(isFatura);
  const totalFaturaMasraflar = faturaExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const faturaKdv = faturaExpenses.reduce((acc, item) => {
    const rate = item.kdvRate || 20;
    const kdv = item.amount * (rate / (100 + rate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  // **DEBUG LOG - Hesaplama adımlarını kontrol et**
  console.log('WEB Vergi Hesaplamaları - Düzeltildi:', {
    '1_grossIncome_KDV_Dahil': income,
    '2_kdvHaricGelir': kdvHaricGelir.toFixed(2),
    '3_vergiMatrahMasraflarKdvHaric': vergiMatrahMasraflarKdvHaric.toFixed(2),
    '4_gelirVergisiMatrahi': gelirVergisiMatrahi.toFixed(2),
    '5_yillikGelirVergisiMatrahi': yillikGelirVergisiMatrahi.toFixed(2),
    '6_yillikGelirVergisi': yillikGelirVergisi.toFixed(2),
    '7_aylikGelirVergisi': gelirVergisi.toFixed(2),
    'KDV_hakedisKdv': hakedisKdv.toFixed(2),
    'KDV_totalKdv': totalKdv.toFixed(2),
    'KDV_odenecek': odenecekKdv.toFixed(2),
    'netKazanc': netKazanc.toFixed(2)
  });

  // Yardımcı gösterimler
  const format = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  // Manuel kaydetme fonksiyonu
  const handleSave = () => {
    if (income > 0) {
      const summaryData = {
        income,
        totalExpenses,
        totalKdv,
        hakedisKdv,
        odenecekKdv,
        gelirVergisiMatrahi,
        gelirVergisi,
        netKazanc,
        expenses: expenses,
        // Yeni hesaplama yöntemi bilgisi
        calculationMethod: 'fixed_tax_calculation',
        version: '2.0'
      };
      saveSummaryToLocal(summaryData);

      if (onHistoryUpdate) {
        onHistoryUpdate();
      }

      addToast("Hesaplama başarıyla kaydedildi! (Düzeltilmiş hesaplama)", "success", 4000);
    } else {
      addToast("Lütfen önce hakediş tutarını giriniz.", "warning", 3000);
    }
  };

  const handleExportPDF = () => {
    exportToPDF({
      expenses,
      income,
      totalExpenses,
      totalFaturaMasraflar,
      faturaKdv,
      totalKdv,
      hakedisKdv,
      odenecekKdv,
      gelirVergisiMatrahi,
      gelirVergisi,
      netKazanc,
    });
  };

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];

    const expenseRows = expenses.map((item) => ({
      Tarih: item.date || today,
      Masraf: item.name,
      Tutar: item.amount + " ₺",
      KDV: (item.kdvRate || 20) + "%",
      Kategori: getCategory(item.name),
    }));

    const spacer = [{}];

    const summaryRows = [
      { Başlık: "Hakediş (KDV Dahil)", Değer: format(income) + " ₺" },
      { Başlık: "KDV Hariç Gelir", Değer: format(kdvHaricGelir) + " ₺" },
      { Başlık: "Görünür Masraflar", Değer: format(totalExpenses) + " ₺" },
      ...(totalFaturaMasraflar > 0
        ? [
            {
              Başlık: "Fatura Masrafları",
              Değer: format(totalFaturaMasraflar) + " ₺",
            },
            {
              Başlık: "Fatura KDV İndirimi",
              Değer: format(faturaKdv) + " ₺",
            },
          ]
        : []),
      { Başlık: "Toplam İndirilecek KDV", Değer: format(totalKdv) + " ₺" },
      { Başlık: "Hakediş KDV (%20)", Değer: format(hakedisKdv) + " ₺" },
      { Başlık: "Ödenecek KDV", Değer: format(odenecekKdv) + " ₺" },
      {
        Başlık: "Gelir Vergisi Matrahı",
        Değer: format(gelirVergisiMatrahi) + " ₺",
      },
      { Başlık: "Gelir Vergisi", Değer: format(gelirVergisi) + " ₺" },
      { Başlık: "Net Kazanç", Değer: format(netKazanc) + " ₺" },
    ];

    const exportData = [...expenseRows, ...spacer, ...summaryRows];
    exportToExcel(exportData, `CargoCalc-Fixed-${today}.xlsx`);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-base sm:text-sm">
      <h2 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-4 text-gray-800">
        Finansal Özet
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          ✅ Düzeltildi
        </span>
      </h2>

      {/* Ana rakamlar - Mobilde kartlar */}
      <div className="space-y-4 sm:space-y-2 mb-6 sm:mb-4">
        {/* Hakediş */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-2 rounded-r-lg sm:rounded-r">
          <div className="flex justify-between items-center">
            <span className="font-semibold sm:font-medium text-blue-800">
              Hakediş (KDV Dahil):
            </span>
            <span className="text-xl sm:text-base font-bold text-blue-800">
              {format(income)} ₺
            </span>
          </div>
          <div className="text-sm text-blue-600 mt-1">
            KDV Hariç: {format(kdvHaricGelir)} ₺
          </div>
        </div>

        {/* Görünür masraflar */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 sm:p-2 rounded-r-lg sm:rounded-r">
          <div className="flex justify-between items-center">
            <span className="font-semibold sm:font-medium text-red-800">
              Görünür Masraflar:
            </span>
            <span className="text-xl sm:text-base font-bold text-red-800">
              {format(totalExpenses)} ₺
            </span>
          </div>
        </div>

        {/* Fatura masrafları varsa göster */}
        {totalFaturaMasraflar > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-2 rounded-r-lg sm:rounded-r">
            <div className="mb-2 sm:mb-1">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-sm font-semibold text-yellow-800">
                  Gizli Masraflar (Fatura):
                </span>
                <span className="text-lg sm:text-base font-bold text-yellow-800">
                  {format(totalFaturaMasraflar)} ₺
                </span>
              </div>
            </div>
            <div className="space-y-1 text-sm sm:text-xs text-yellow-700">
              <p>
                Vergi matrahından düşülüyor ama görünür masraflarda sayılmıyor
              </p>
              <p>KDV indirimi: {format(faturaKdv)} ₺</p>
            </div>
          </div>
        )}
      </div>

      {/* Vergi detayları - Genişletilebilir */}
      <details className="mb-6 sm:mb-4 bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="flex justify-between items-center p-3 sm:p-2 cursor-pointer hover:bg-gray-100 transition-colors sm:text-xs text-xl md:text-sm font-bold md:font-medium text-blue-500">
          💳 Vergi Detayları (Düzeltilmiş)
          <span className="text-lg sm:text-base text-right font-bold text-gray-800">
            {format(odenecekKdv + gelirVergisi)} ₺
          </span>
        </summary>

        <div className="px-4 sm:px-3 pb-4 sm:pb-3 space-y-3 sm:space-y-2 border-t border-gray-200 pt-3 sm:pt-2">
          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              📋 KDV Dahil Gelir:
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(income)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              💰 KDV Hariç Gelir:
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(kdvHaricGelir)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              📄 İndirilebilir Masraflar (KDV Hariç):
            </span>
            <span className="text-base sm:text-sm font-semibold text-green-600">
              -{format(vergiMatrahMasraflarKdvHaric)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              📈 Gelir Vergisi Matrahı:
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(gelirVergisiMatrahi)} ₺
            </span>
          </div>

          <div className="h-px bg-gray-300 my-2"></div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              🔢 Hakediş KDV'si (%20):
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(hakedisKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              📉 İndirilecek KDV:
            </span>
            <span className="text-base sm:text-sm font-semibold text-green-600">
              -{format(totalKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1 border-t border-gray-200">
            <span className="text-base sm:text-sm font-semibold text-gray-800">
              💸 Ödenecek KDV:
            </span>
            <span className="text-base sm:text-sm font-bold text-red-600">
              {format(odenecekKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm font-semibold text-gray-800">
              🏛️ Gelir Vergisi:
            </span>
            <span className="text-base sm:text-sm font-bold text-red-600">
              {format(gelirVergisi)} ₺
            </span>
          </div>
        </div>
      </details>

      {/* Toplam vergi yükü */}
      <div className="bg-gray-100 border border-gray-300 p-4 sm:p-3 rounded-lg mb-6 sm:mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-sm font-semibold text-blue-800">
            🔴 Toplam Vergi Yükü
            <br></br>(KDV + Gelir Vergisi):
          </span>
          <span className="text-lg sm:text-base font-bold text-blue-800">
            {format(odenecekKdv + gelirVergisi)} ₺
          </span>
        </div>
        <div className="text-sm text-blue-600 mt-1">
          Gelir oranı: %{income > 0 ? (((odenecekKdv + gelirVergisi) / income) * 100).toFixed(1) : "0"}
        </div>
      </div>

      {/* Net Kazanç - Ana Sonuç */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 sm:p-4 rounded-xl shadow-lg mb-6 sm:mb-4">
        <div className="text-center">
          <p className="text-base sm:text-sm font-medium opacity-90 mb-2 sm:mb-1">
            {netKazanc >= 0 ? '🎉 NET KAZANÇ' : '⚠️ NET ZARAR'}
          </p>
          <p className="text-4xl sm:text-2xl font-bold mb-2 sm:mb-1">
            {format(Math.abs(netKazanc))} ₺
          </p>
          <p className="text-sm sm:text-xs opacity-75">
            {netKazanc < 0 ? 'Tüm vergiler ve masraflar düşülmüş net zarar' : 'Tüm vergiler ve masraflar düşülmüş net kâr'}
          </p>
        </div>
      </div>

      {/* Detaylı açıklama */}
      <details className="mb-6 sm:mb-4 bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="p-3 sm:p-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm sm:text-xs font-medium text-gray-700">
          📊 Hesaplama Mantığı (Düzeltilmiş)
        </summary>
        <div className="px-3 sm:px-2 pb-3 sm:pb-2 text-sm sm:text-xs text-gray-600 space-y-1">
          <p>• Hakediş (KDV Dahil): {format(income)} ₺</p>
          <p>• KDV Hariç Gelir: {format(kdvHaricGelir)} ₺</p>
          <p>• Görünür Masraflar: -{format(totalExpenses)} ₺</p>
          {totalFaturaMasraflar > 0 && (
            <p>• Gizli Masraflar (Fatura): -{format(totalFaturaMasraflar)} ₺</p>
          )}
          <p>• İndirilebilir Masraflar (KDV Hariç): -{format(vergiMatrahMasraflarKdvHaric)} ₺</p>
          <p>• Gelir Vergisi Matrahı: {format(gelirVergisiMatrahi)} ₺</p>
          <p>• Ödenecek KDV: -{format(odenecekKdv)} ₺</p>
          <p>• Gelir Vergisi: -{format(gelirVergisi)} ₺</p>
          <p className="border-t pt-1 mt-1 font-semibold">
            = Net Kazanç: {format(netKazanc)} ₺
          </p>
        </div>
      </details>

      {/* Kaydet butonu - Mobilde büyük */}
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white px-6 sm:px-4 py-4 sm:py-2 rounded-xl sm:rounded-lg text-lg sm:text-sm font-bold sm:font-semibold shadow-lg sm:shadow transition-all transform active:scale-95 sm:active:scale-100"
      >
        💾 Hesaplamayı Kaydet (Düzeltilmiş)
      </button>

      {/* Hızlı istatistikler */}
      <div className="mt-6 sm:mt-4 grid grid-cols-2 gap-4 sm:gap-3">
        <div className="bg-blue-50 p-4 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-xs text-blue-600 mb-1 sm:mb-0">
            Kar Marjı
          </p>
          <p className="text-lg sm:text-base font-bold text-blue-800">
            {income > 0 ? ((netKazanc / income) * 100).toFixed(1) : "0"}%
          </p>
        </div>
        <div className="bg-red-50 p-4 sm:p-3 rounded-lg text-center">
          <p className="text-xs sm:text-xs text-red-600 mb-1 sm:mb-0">
            Vergi Oranı
          </p>
          <p className="text-lg sm:text-base font-bold text-red-800">
            {income > 0
              ? (((odenecekKdv + gelirVergisi) / income) * 100).toFixed(1)
              : "0"}
            %
          </p>
        </div>
      </div>

      <div className="text-right mt-4 flex justify-between">
        <button
          onClick={handleExportPDF}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition-all ml-2"
        >
          PDF'e Aktar
        </button>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
        >
          Excel'e Aktar
        </button>
      </div>

      {/* Düzeltme bilgisi */}
      <div className="block mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
        <div className="text-green-700 text-sm">
          <p className="font-medium mb-1">✅ Hesaplama Düzeltildi:</p>
          <p>
            • KDV hariç masraflar gelir vergisi matrahından düşülüyor<br/>
            • Doğru vergi dilimleri kullanılıyor<br/>
            • Console'da detaylı hesaplama adımlarını görebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}

export default Summary;
