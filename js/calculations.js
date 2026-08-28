export const PRODUCT_TYPES = {
  education: { label: 'קרן השתלמות', taxNow: 0, taxFuture: 0, wrapperCost: 0.25, taxBasis: 'exempt', noCost: true, liquiditySetting: true, assumption: 'ברירת המחדל היא קרן נזילה. קרן שאינה נזילה מחושבת עם מס של 47% על מלוא המשיכה.', overrideNote: 'יש לוודא את מועד הנזילות והזכאות לפני ביצוע משיכה.' },
  provident: { label: 'קופת גמל להשקעה', taxNow: 0.25, taxFuture: 0.25, wrapperCost: 0.05, taxBasis: 'real', assumption: 'ברירת המחדל מניחה 25% מס עתידי על הרווח הריאלי. בקבלת קצבה מוכרת ובהתקיים התנאים עשוי לחול פטור.', overrideNote: 'אם מתוכננת משיכה כקצבה מוכרת ובהתקיים התנאים, ניתן להתאים את שיעור המס העתידי.' },
  policy: { label: 'פוליסת חיסכון', taxNow: 0.25, taxFuture: 0.25, wrapperCost: 0, taxBasis: 'real', assumption: 'שיעור תכנוני כללי על הרווח הריאלי.', overrideNote: 'המס בפועל עשוי להשתנות בשל מדד, פטורים, הטבות או נתונים אישיים.' },
  portfolio: { label: 'תיק השקעות', taxNow: 0.25, taxFuture: 0.25, wrapperCost: 0, taxBasis: 'real', assumption: 'ברירת מחדל: 25% על הרווח הריאלי.', overrideNote: 'יש להתאים לפי סוגי הניירות, הפסדים לקיזוז ואופן המימוש.' },
  bankDeposit: { label: 'פיקדון בנקאי', taxNow: 0.15, taxFuture: 0.15, wrapperCost: 0, taxBasis: 'nominal', assumption: 'ברירת מחדל: 15% על הריבית הנומינלית.', overrideNote: 'יש לבדוק את סוג הפיקדון ואת אישור המס של הבנק.' },
  moneyFund: { label: 'קרן כספית', taxNow: 0.25, taxFuture: 0.25, wrapperCost: 0, taxBasis: 'real', assumption: '25% על הרווח הריאלי מעל עליית המדד.', overrideNote: 'יש להזין הצמדה מצטברת מדויקת ככל שניתן.' },
  amendment190: { label: 'קופת גמל — תיקון 190', taxNow: 0.15, taxFuture: 0.15, wrapperCost: 0.25, taxBasis: 'nominal', assumption: '15% נומינלי במשיכה הונית של הקצבה המוכרת; ברירת המחדל למס עתידי היא 15%.', overrideNote: 'רובד הקצבה המזכה אינו נכלל במשיכה ההונית המומלצת. ברירת המחדל לקצבה המזכה היא 38,412 ₪ (לפי תקרת שנת 2025), מחושב לפי הנחה כללית של הפקדה אחת בשנת 2025; יש להתאים לפי אישור הקופה או רשות המסים.' },
  pension: { label: 'קרן פנסיה', taxNow: 0, taxFuture: 0, wrapperCost: 0.5, taxBasis: 'exempt', noCost: true, pensionEarlyWithdrawal: true, assumption: 'ברירת המחדל מניחה 67% תגמולים החייבים ב־35% בניכוי במקור במשיכה מוקדמת ו־33% פיצויים.', overrideNote: 'משיכה תקטין את הקצבה הצפויה. משיכת פיצויים כפופה לסיום עבודה, טופס 161 או אישור פקיד שומה; חריגי מס דורשים אישור מתאים.' },
  annuityProvident: { label: 'קופת גמל לקצבה', taxNow: 0, taxFuture: 0, wrapperCost: 0.5, taxBasis: 'exempt', noCost: true, pensionEarlyWithdrawal: true, assumption: 'ברירת המחדל מניחה 67% תגמולים החייבים ב־35% בניכוי במקור במשיכה מוקדמת ו־33% פיצויים.', overrideNote: 'משיכה תקטין את הקצבה הצפויה. משיכת פיצויים כפופה לסיום עבודה, טופס 161 או אישור פקיד שומה; חריגי מס דורשים אישור מתאים.' },
  managersInsurance: { label: 'ביטוח מנהלים', taxNow: 0, taxFuture: 0, wrapperCost: 0.5, taxBasis: 'exempt', noCost: true, pensionEarlyWithdrawal: true, assumption: 'ברירת המחדל מניחה 67% תגמולים החייבים ב־35% בניכוי במקור במשיכה מוקדמת ו־33% פיצויים.', overrideNote: 'משיכה תקטין את הקצבה הצפויה. משיכת פיצויים כפופה לסיום עבודה, טופס 161 או אישור פקיד שומה; חריגי מס דורשים אישור מתאים.' },
  other: { label: 'מקור נוסף', taxNow: 0.25, taxFuture: 0.25, wrapperCost: 0.05, taxBasis: 'real', assumption: 'ברירת מחדל: 25% על הרווח הריאלי.', overrideNote: 'יש להתאים למאפייני המקור בפועל.' }
};

export const finiteNonNegative = value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
export const resolveOverride = (override, fallback) => override === '' || override == null ? finiteNonNegative(fallback) : finiteNonNegative(override);

export function calculateProduct(product, defaults) {
  const value = finiteNonNegative(product.value);
  const lockedAmount = Math.min(value, finiteNonNegative(product.lockedAmount));
  const pensionBaseValue = Math.max(0, value - lockedAmount);
  const cost = finiteNonNegative(product.cost);
  const taxBasis = product.taxBasisOverride || defaults.taxBasis || 'nominal';
  const cpiAdjustment = taxBasis === 'real' ? finiteNonNegative(product.cpiAdjustment) : 0;
  const indexedCost = cost * (1 + cpiAdjustment);
  const gain = Math.max(0, value - indexedCost);
  const gainRatio = value > 0 ? gain / value : 0;
  const taxNow = Math.min(0.999999, resolveOverride(product.taxNowOverride, defaults.taxNow));
  const taxFuture = Math.min(0.999999, resolveOverride(product.taxFutureOverride, defaults.taxFuture));
  const wrapperRate = resolveOverride(product.wrapperOverride, defaults.wrapperCost);
  const annualReturn = resolveOverride(product.annualReturn, 0);
  const years = finiteNonNegative(product.years);
  const expectedInflation = finiteNonNegative(product.expectedInflation);
  const rewardsRatio = defaults.pensionEarlyWithdrawal ? Math.min(1, resolveOverride(product.rewardsRatio, .67)) : 0;
  const severanceRatio = defaults.pensionEarlyWithdrawal ? Math.min(1, resolveOverride(product.severanceRatio, .33)) : 0;
  const rewardsTaxRate = defaults.pensionEarlyWithdrawal ? Math.min(.999999, resolveOverride(product.rewardsTaxRate, .35)) : 0;
  const severanceTaxRate = defaults.pensionEarlyWithdrawal ? Math.min(.999999, resolveOverride(product.severanceTaxRate, 0)) : 0;
  const severanceWithdrawable = defaults.pensionEarlyWithdrawal ? product.severanceWithdrawable===true : true;
  const withdrawableValue = defaults.pensionEarlyWithdrawal&&!severanceWithdrawable ? pensionBaseValue*rewardsRatio : pensionBaseValue;
  const pensionTaxPerGross = severanceWithdrawable ? rewardsRatio * rewardsTaxRate + severanceRatio * severanceTaxRate : rewardsTaxRate;
  const educationIlliquid = defaults.liquiditySetting&&product.isLiquid===false;
  const taxPerGross = Math.min(0.999999, educationIlliquid ? .47 : defaults.pensionEarlyWithdrawal ? pensionTaxPerGross : gainRatio * taxNow);
  const maxNet = withdrawableValue * (1 - taxPerGross);
  const nominalGrowthFactor = Math.pow(1 + annualReturn, years);
  const inflationFactor = Math.pow(1 + expectedInflation, years);
  const grossRealGrowthFactor = nominalGrowthFactor / Math.max(0.000001, inflationFactor);
  const realGainBeforeTax = Math.max(0, grossRealGrowthFactor - 1);
  const nominalGainBeforeTax = Math.max(0, nominalGrowthFactor - 1);
  const taxCostPerNet = taxPerGross / Math.max(0.000001, 1 - taxPerGross);
  const grossPerNet = 1 / Math.max(0.000001, 1 - taxPerGross);
  const futureValueAfterTaxPerGross = taxBasis === 'nominal'
    ? (1 + nominalGainBeforeTax * (1 - taxFuture)) / Math.max(0.000001, inflationFactor)
    : 1 + realGainBeforeTax * (1 - taxFuture);
  const realGrowthFactorAfterTax = Math.max(0, futureValueAfterTaxPerGross);
  const futureGainPerShekel = Math.max(0, realGrowthFactorAfterTax - 1);
  const futureValueForgonePerNet = grossPerNet * futureValueAfterTaxPerGross;
  const futureOpportunityCostPerNet = Math.max(0, futureValueForgonePerNet - 1);
  const wrapperCostEstimate = futureGainPerShekel * wrapperRate * grossPerNet;
  const planningScore = futureOpportunityCostPerNet + wrapperCostEstimate;
  return { ...product, value, cost, lockedAmount, withdrawableValue, indexedCost, taxBasis, cpiAdjustment, gain, hasLoss: indexedCost > value, gainRatio, taxNow, taxFuture, wrapperRate, rewardsRatio, severanceRatio, rewardsTaxRate, severanceTaxRate, severanceWithdrawable, taxPerGross, maxNet, expectedInflation, nominalGrowthFactor, inflationFactor, grossRealGrowthFactor, realGrowthFactorAfterTax, growthFactor: realGrowthFactorAfterTax, futureGainPerShekel, futureValueAfterTaxPerGross, futureValueForgonePerNet, futureOpportunityCostPerNet, wrapperCostEstimate, taxCostPerNet, planningScore };
}

export function withdrawalForNet(calculated, desiredNet) {
  const net = Math.min(finiteNonNegative(desiredNet), calculated.maxNet);
  const gross = Math.min(calculated.withdrawableValue ?? calculated.value, net / Math.max(0.000001, 1 - calculated.taxPerGross));
  const gainComponent = gross * calculated.gainRatio;
  const tax = gross * calculated.taxPerGross;
  return { gross, gainComponent, tax, net: gross - tax, remainingValue: Math.max(0, calculated.value - gross) };
}

export function allocateWithdrawal(products, requiredNet, mode = 'planning') {
  const need = finiteNonNegative(requiredNet);
  const ranked = products.map((p, index) => ({ ...p, originalIndex: index })).sort((a, b) => {
    if (mode === 'manual') return a.originalIndex - b.originalIndex;
    const metricA = mode === 'tax' ? a.taxCostPerNet : a.planningScore;
    const metricB = mode === 'tax' ? b.taxCostPerNet : b.planningScore;
    return metricA - metricB || a.originalIndex - b.originalIndex;
  });
  let remaining = need;
  const rows = ranked.map((product, index) => {
    const withdrawal = withdrawalForNet(product, remaining);
    remaining = Math.max(0, remaining - withdrawal.net);
    const metric = mode === 'tax' ? product.taxCostPerNet : product.planningScore;
    const reason = mode === 'manual' ? 'המיקום נקבע לפי הסדר הידני.' : mode === 'tax' ? `עלות המס המיידי לנטו היא ${(metric * 100).toFixed(2)}%.` : `הציון התכנוני היחסי הוא ${(metric * 100).toFixed(2)}% (נמוך עדיף).`;
    return { ...product, ...withdrawal, rank: index + 1, reason };
  });
  return {
    rows, requiredNet: need, allocatedNet: rows.reduce((s, r) => s + r.net, 0), totalGross: rows.reduce((s, r) => s + r.gross, 0), totalTax: rows.reduce((s, r) => s + r.tax, 0), shortfall: remaining, productsUsed: rows.filter(r => r.gross > 0.005).length
  };
}
