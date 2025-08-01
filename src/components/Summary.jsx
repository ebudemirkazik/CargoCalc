//Gelir – Gider farkını yani net kazancı gösterir.

import { useEffect } from "react";
import React from "react";
import { calculateIncomeTax } from "../utils/taxCalculator";
import { useToast } from "./ToastNotification";

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

  // Gerçek nakit çıkan masraflar (ekranda gösterilecek) - Fatura hariç
  const totalExpenses = expenses.reduce((acc, item) => {
    return isFatura(item) ? acc : acc + item.amount;
  }, 0);

  // İndirilecek tüm KDV'ler (fatura dahil)
  const totalKdv = expenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

  // Vergi matrahından düşülecek tüm masraflar (fatura dahil!)
  const vergiMatrahMasraflar = expenses.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  // Hakediş KDV'si (%20 dahil hesaplaması)
  const hakedisKdv = income * (20 / 120);

  // Devlete ödenecek KDV
  const odenecekKdv = hakedisKdv - totalKdv;

  // Gelir vergisi matrahı (hakediş - tüm masraflar - ödenecek KDV)
  const gelirVergisiMatrahi = income - vergiMatrahMasraflar - odenecekKdv;

  // Gelir vergisi
  const gelirVergisi = calculateIncomeTax(gelirVergisiMatrahi);

  // Net kazanç
  const netKazanc = income - totalExpenses - odenecekKdv - gelirVergisi;

  // Fatura masraflarını ayrı gösterelim
  const faturaExpenses = expenses.filter(isFatura);
  const totalFaturaMasraflar = faturaExpenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const faturaKdv = faturaExpenses.reduce((acc, item) => {
    const kdv = item.amount * (item.kdvRate / (100 + item.kdvRate));
    return acc + (isNaN(kdv) ? 0 : kdv);
  }, 0);

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
      };
      saveSummaryToLocal(summaryData);

      if (onHistoryUpdate) {
        onHistoryUpdate();
      }

      addToast("Hesaplama başarıyla kaydedildi!", "success", 4000);
    } else {
      addToast("Lütfen önce hakediş tutarını giriniz.", "warning", 3000);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-base sm:text-sm">
      <h2 className="text-xl sm:text-lg font-bold sm:font-semibold mb-6 sm:mb-4 text-gray-800">
        Finansal Özet
      </h2>

      {/* Ana rakamlar - Mobilde kartlar */}
      <div className="space-y-4 sm:space-y-2 mb-6 sm:mb-4">
        {/* Hakediş */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-2 rounded-r-lg sm:rounded-r">
          <div className="flex justify-between items-center">
            <span className="font-semibold sm:font-medium text-blue-800">
              Hakediş:
            </span>
            <span className="text-xl sm:text-base font-bold text-blue-800">
              {format(income)} ₺
            </span>
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
        <summary className="grid grid-cols-2 items-center p-3 sm:p-2 cursor-pointer hover:bg-gray-100 transition-colors sm:text-xs text-xl md:text-sm font-bold md:font-medium text-blue-500">
          Vergi Detayları
          <span className="text-lg sm:text-base text-right font-bold text-gray-800">
            {format(odenecekKdv + gelirVergisi)} ₺
          </span>
        </summary>

        <div className="px-4 sm:px-3 pb-4 sm:pb-3 space-y-3 sm:space-y-2 border-t border-gray-200 pt-3 sm:pt-2">
          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              Toplam İndirilecek KDV:
            </span>
            <span className="text-base sm:text-sm font-semibold text-green-600">
              {format(totalKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              Hakediş KDV (%20):
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(hakedisKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1 border-t border-gray-200">
            <span className="text-base sm:text-sm text-gray-600">
              Ödenecek KDV:
            </span>
            <span className="text-base sm:text-sm font-semibold text-red-600">
              {format(odenecekKdv)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              Gelir Vergisi Matrahı:
            </span>
            <span className="text-base sm:text-sm font-semibold">
              {format(gelirVergisiMatrahi)} ₺
            </span>
          </div>

          <div className="flex justify-between items-center py-2 sm:py-1">
            <span className="text-base sm:text-sm text-gray-600">
              Gelir Vergisi:
            </span>
            <span className="text-base sm:text-sm font-semibold text-red-600">
              {format(gelirVergisi)} ₺
            </span>
          </div>
        </div>
      </details>

      {/* Toplam vergi yükü */}
      <div className="bg-gray-100 border border-gray-300 p-4 sm:p-3 rounded-lg mb-6 sm:mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-sm font-semibold text-blue-800">
            Toplam Vergi Yükü
            <br></br>(KDV + Gelir Vergisi):
          </span>
          <span className="text-lg sm:text-base font-bold text-blue-800">
            {format(odenecekKdv + gelirVergisi)} ₺
          </span>
        </div>
      </div>

      {/* Net Kazanç - Ana Sonuç */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 sm:p-4 rounded-xl shadow-lg mb-6 sm:mb-4">
        <div className="text-center">
          <p className="text-base sm:text-sm font-medium opacity-90 mb-2 sm:mb-1">
            NET KAZANÇ
          </p>
          <p className="text-4xl sm:text-2xl font-bold mb-2 sm:mb-1">
            {format(netKazanc)} ₺
          </p>
          <p className="text-sm sm:text-xs opacity-75">
            Tüm vergiler düşülmüş net kâr
          </p>
        </div>
      </div>

      {/* Detaylı açıklama */}
      <details className="mb-6 sm:mb-4 bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="p-3 sm:p-2 cursor-pointer hover:bg-gray-100 transition-colors text-sm sm:text-xs font-medium text-gray-700">
          Hesaplama Mantığı
        </summary>
        <div className="px-3 sm:px-2 pb-3 sm:pb-2 text-sm sm:text-xs text-gray-600 space-y-1">
          <p>• Hakediş: {format(income)} ₺</p>
          <p>• Görünür Masraflar: -{format(totalExpenses)} ₺</p>
          {totalFaturaMasraflar > 0 && (
            <p>• Gizli Masraflar (Fatura): -{format(totalFaturaMasraflar)} ₺</p>
          )}
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
        Hesaplamayı Kaydet
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

      {/* Mobil ipucu */}
      <div className="block mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <div className="text-gray-600 text-sm">
          <p className="font-medium mb-1">İpucu:</p>
          <p>
            Vergi detaylarını ve hesaplama mantığını görmek için ilgili
            bölümlere dokunun.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Summary;
