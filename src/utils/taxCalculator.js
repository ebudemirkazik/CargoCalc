// Gelir vergisi hesaplama fonksiyonu

// src/utils/taxCalculator.js
/* export function calculateIncomeTax(income) {
  if (income <= 158000) {
    return income * 0.15;
  } else if (income <= 330000) {
    return 23700 + (income - 158000) * 0.20;
  } else if (income <= 800000) {
    return 58100 + (income - 330000) * 0.27;
  } else if (income <= 4300000) {
    return 185000 + (income - 800000) * 0.35;
  } else {
    return 1410000 + (income - 4300000) * 0.40;
  }
}

 */

export function calculateIncomeTax(income) {
    // Gelir vergisi dilimleri ve oranları (2025 yılı için)
    const taxBrackets = [
        { min: 0, max: 158000, rate: 0.15, fixedTax: 0 },
        { min: 158000, max: 330000, rate: 0.20, fixedTax: 23700 },
        { min: 330000, max: 1200000, rate: 0.27, fixedTax: 58100 },
        { min: 1200000, max: 4300000, rate: 0.35, fixedTax: 293000 },
        { min: 4300000, max: Infinity, rate: 0.40, fixedTax: 1378000 }
    ];
    
    // Gelir 0 veya negatifse vergi 0
    if (income <= 0) {
        return 0;
    }
    
    let totalTax = 0;
    
    // Hangi dilimde olduğunu bul ve vergiyi hesapla
    for (let i = 0; i < taxBrackets.length; i++) {
        const bracket = taxBrackets[i];
        
        if (income > bracket.min) {
            if (income <= bracket.max) {
                // Bu dilimde kalıyor
                const taxableInThisBracket = income - bracket.min;
                totalTax = bracket.fixedTax + (taxableInThisBracket * bracket.rate);
                break;
            }
        }
    }
    
    return Math.round(totalTax * 100) / 100; // 2 ondalık basamağa yuvarla
}

