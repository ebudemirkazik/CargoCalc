// utils/exportToPDF.js
import { getCategory } from "./categorizeExpense";

export const exportToPDF = ({
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
}) => {
  const today = new Date().toLocaleDateString("tr-TR");
  const formatCurrency = (amount) => `${amount.toLocaleString("tr-TR")} ₺`;

  // HTML içeriği oluştur
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CargoCalc Hesap Özeti</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 12px;
            margin: 0 0 15px 0;
            border-radius: 8px;
            font-size: 18px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        th {
            background: #f8fafc;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        tr:hover {
            background: #f3f4f6;
        }
        .amount {
            text-align: right;
            font-weight: 600;
        }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .warning { color: #d97706; }
        .info { color: #2563eb; }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .net-profit {
            background: linear-gradient(135deg, #059669, #047857);
            color: white;
            text-align: center;
            padding: 25px;
            border-radius: 12px;
            margin: 20px 0;
        }
        .net-profit h2 {
            background: none;
            color: white;
            margin: 0 0 10px 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .net-profit .amount {
            font-size: 36px;
            font-weight: bold;
            margin: 0;
            text-align: center;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            body { margin: 0; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚚 CargoCalc</h1>
        <p>Nakliye Maliyet ve Hakediş Hesap Özeti</p>
        <p>Rapor Tarihi: ${today}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>Toplam Hakediş</h3>
            <p class="value info">${formatCurrency(income)}</p>
        </div>
        <div class="summary-card">
            <h3>Toplam Masraflar</h3>
            <p class="value negative">${formatCurrency(totalExpenses)}</p>
        </div>
        <div class="summary-card">
            <h3>Toplam Vergi</h3>
            <p class="value warning">${formatCurrency(odenecekKdv + gelirVergisi)}</p>
        </div>
        <div class="summary-card">
            <h3>Kar Marjı</h3>
            <p class="value positive">${income > 0 ? ((netKazanc / income) * 100).toFixed(1) : "0"}%</p>
        </div>
    </div>

    ${expenses.length > 0 ? `
    <div class="section">
        <h2>📊 Masraf Detayları</h2>
        <table>
            <thead>
                <tr>
                    <th>Masraf Adı</th>
                    <th>Kategori</th>
                    <th>KDV Oranı</th>
                    <th class="amount">Tutar</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => `
                    <tr>
                        <td><strong>${expense.name}</strong></td>
                        <td>${getCategory(expense.name)}</td>
                        <td>%${expense.kdvRate}</td>
                        <td class="amount negative">${formatCurrency(expense.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>💰 Finansal Özet</h2>
        <table>
            <tbody>
                <tr>
                    <td><strong>Hakediş (KDV Dahil)</strong></td>
                    <td class="amount info">${formatCurrency(income)}</td>
                </tr>
                <tr>
                    <td>Görünür Masraflar</td>
                    <td class="amount negative">-${formatCurrency(totalExpenses)}</td>
                </tr>
                ${totalFaturaMasraflar > 0 ? `
                <tr>
                    <td>Gizli Masraflar (Fatura)</td>
                    <td class="amount warning">-${formatCurrency(totalFaturaMasraflar)}</td>
                </tr>
                <tr>
                    <td>Fatura KDV İndirimi</td>
                    <td class="amount positive">+${formatCurrency(faturaKdv)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td>Toplam KDV İndirimi</td>
                    <td class="amount positive">+${formatCurrency(totalKdv)}</td>
                </tr>
                <tr>
                    <td>Hakediş KDV (%20)</td>
                    <td class="amount negative">-${formatCurrency(hakedisKdv)}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                    <td><strong>Ödenecek KDV</strong></td>
                    <td class="amount negative"><strong>-${formatCurrency(odenecekKdv)}</strong></td>
                </tr>
                <tr>
                    <td>Gelir Vergisi Matrahı</td>
                    <td class="amount">${formatCurrency(gelirVergisiMatrahi)}</td>
                </tr>
                <tr>
                    <td><strong>Gelir Vergisi</strong></td>
                    <td class="amount negative"><strong>-${formatCurrency(gelirVergisi)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="net-profit">
        <h2>NET KAZANÇ</h2>
        <p class="amount">${formatCurrency(netKazanc)}</p>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Tüm vergiler düşülmüş net kâr</p>
    </div>

    <div class="section">
        <h2>📈 Performans Analizi</h2>
        <table>
            <tbody>
                <tr>
                    <td><strong>Kar Marjı</strong></td>
                    <td class="amount positive">${income > 0 ? ((netKazanc / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
                <tr>
                    <td><strong>Vergi Oranı</strong></td>
                    <td class="amount warning">${income > 0 ? (((odenecekKdv + gelirVergisi) / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
                <tr>
                    <td><strong>Masraf Oranı</strong></td>
                    <td class="amount negative">${income > 0 ? ((totalExpenses / income) * 100).toFixed(1) : "0"}%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p><strong>⚠️ Önemli Uyarı:</strong> Bu hesaplama aracı sadece genel bilgi ve fikir vermek amacıyla hazırlanmıştır.</p>
        <p>Gerçek vergi hesaplamaları için muhasebeci veya mali müşaviriniz ile görüşünüz.</p>
        <p style="margin-top: 15px;">© 2025 CargoCalc - Bu araç bilgilendirme amaçlıdır.</p>
    </div>
</body>
</html>`;

  // Yeni pencerede aç ve yazdır
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Sayfa yüklendikten sonra print dialog'unu aç
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};