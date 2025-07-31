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

      addToast("Hesaplama başarıyla kaydedildi! 🎉", "success", 4000);
    } else {
      addToast("Lütfen önce hakediş tutarını giriniz.", "warning", 3000);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-sm md:text-base">
      <h2 className="text-lg font-semibold mb-4">Özet</h2>
      <div className="space-y-1">
        <p>
          <strong>Hakediş:</strong> {format(income)} ₺
        </p>
        <p>
          <strong>Görünür Masraflar:</strong> {format(totalExpenses)} ₺
        </p>

        {/* Fatura masrafları varsa göster */}
        {totalFaturaMasraflar > 0 && (
          <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400 my-2">
            <p className="text-sm text-yellow-800">
              <strong>Gizli Masraflar (Fatura):</strong>{" "}
              {format(totalFaturaMasraflar)} ₺
            </p>
            <p className="text-xs text-yellow-600">
              • Vergi matrahından düşülüyor ama görünür masraflarda sayılmıyor
            </p>
            <p className="text-xs text-yellow-600">
              • KDV indirimi: {format(faturaKdv)} ₺
            </p>
          </div>
        )}

        <p>
          <strong>Toplam İndirilecek KDV:</strong> {format(totalKdv)} ₺
        </p>
        <p>
          <strong>Hakediş KDV (%20):</strong> {format(hakedisKdv)} ₺
        </p>
        <p>
          <strong>Ödenecek KDV:</strong> {format(odenecekKdv)} ₺
        </p>
        <p>
          <strong>Gelir Vergisi Matrahı:</strong> {format(gelirVergisiMatrahi)}{" "}
          ₺
        </p>
        <p>
          <strong>Gelir Vergisi:</strong> {format(gelirVergisi)} ₺
        </p>

        <hr className="my-3" />

        <p>
          <strong className="text-blue-600">
            Toplam Vergi Yükü (KDV + Gelir V.):
          </strong>{" "}
          {format(odenecekKdv + gelirVergisi)} ₺
        </p>

        <p className="text-green-700 font-bold text-lg mt-2">
          Son Net Kazanç: {format(netKazanc)} ₺
        </p>

        {/* Detaylı açıklama */}
        <div className="bg-gray-50 p-3 rounded mt-4 text-xs">
          <p>
            <strong>Hesaplama Mantığı:</strong>
          </p>
          <p>• Hakediş: {format(income)} ₺</p>
          <p>• Görünür Masraflar: -{format(totalExpenses)} ₺</p>
          {totalFaturaMasraflar > 0 && (
            <p>• Gizli Masraflar (Fatura): -{format(totalFaturaMasraflar)} ₺</p>
          )}
          <p>• Ödenecek KDV: -{format(odenecekKdv)} ₺</p>
          <p>• Gelir Vergisi: -{format(gelirVergisi)} ₺</p>
          <p className="border-t pt-1 mt-1">
            <strong>= Net Kazanç: {format(netKazanc)} ₺</strong>
          </p>
        </div>
      </div>

      {/* Kaydet butonu */}
      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
      >
        Hesaplamayı Kaydet
      </button>
    </div>
  );
}

export default Summary;