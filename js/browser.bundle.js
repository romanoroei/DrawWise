const PRODUCT_TYPES = {
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

const finiteNonNegative = value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
const resolveOverride = (override, fallback) => override === '' || override == null ? finiteNonNegative(fallback) : finiteNonNegative(override);

function calculateProduct(product, defaults) {
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

function withdrawalForNet(calculated, desiredNet) {
  const net = Math.min(finiteNonNegative(desiredNet), calculated.maxNet);
  const gross = Math.min(calculated.withdrawableValue ?? calculated.value, net / Math.max(0.000001, 1 - calculated.taxPerGross));
  const gainComponent = gross * calculated.gainRatio;
  const tax = gross * calculated.taxPerGross;
  return { gross, gainComponent, tax, net: gross - tax, remainingValue: Math.max(0, calculated.value - gross) };
}

function allocateWithdrawal(products, requiredNet, mode = 'planning') {
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

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], clone=x=>JSON.parse(JSON.stringify(x));
const STORE='drawwise-wizard-v4'; const uid=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
let settings=clone(PRODUCT_TYPES), screen=1;
let state=load()||{requiredNet:0,expectedInflation:2.5,annualReturn:7,years:10,products:[make()]};
function make(type='',value=0,cost=0){return{id:uid(),type,value,cost,annualReturn:.07,years:10,cpiAdjustment:0,taxNowOverride:'',taxFutureOverride:'',wrapperOverride:'',taxBasisOverride:'',rewardsRatio:.67,severanceRatio:.33,rewardsTaxRate:.35,severanceTaxRate:0,severanceWithdrawable:false,isLiquid:true}}
function load(){try{return JSON.parse(localStorage.getItem(STORE))}catch{return null}} function save(){localStorage.setItem(STORE,JSON.stringify(state))}
const money=new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:0}), money2=new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',minimumFractionDigits:2,maximumFractionDigits:2});
const fmt=n=>money.format(Number.isFinite(n)?n:0), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function calculated(){return state.products.map(p=>calculateProduct({...p,expectedInflation:finiteNonNegative(state.expectedInflation)/100},settings[p.type]||PRODUCT_TYPES.other))} function result(){return allocateWithdrawal(calculated(),state.requiredNet,'planning')}
function go(n){if(n===2&&state.requiredNet<=0){toast('יש להזין סכום נטו גדול מאפס');return}screen=Math.max(1,Math.min(4,n));$$('.screen').forEach(x=>x.classList.toggle('active',+x.dataset.screen===screen));$$('.steps button').forEach((x,i)=>{x.classList.toggle('active',i+1===screen);x.classList.toggle('done',i+1<screen)});if(screen===2)renderProducts();if(screen===3)renderResults();if(screen===4)renderAdvanced();scrollTo({top:0,behavior:'smooth'})}
function typeOptions(selected){return Object.entries(settings).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${esc(v.label)}</option>`).join('')}
function renderProducts(){const root=$('#products');root.innerHTML=state.products.map((p,i)=>`<article class="product-card" data-id="${p.id}"><div class="product-head"><h3>${esc((settings[p.type]||PRODUCT_TYPES.other).label)}</h3><button data-remove aria-label="מחיקת מוצר">מחיקה</button></div><div class="product-grid"><label>סוג המוצר<select data-k="type">${typeOptions(p.type)}</select></label><label>שווי נוכחי (₪)<input data-k="value" type="number" min="0" value="${p.value}"></label><label>עלות ממוצעת / הפקדות (₪)<input data-k="cost" type="number" min="0" value="${p.cost}"></label></div></article>`).join('');root.querySelectorAll('.product-card').forEach(card=>{const p=state.products.find(x=>x.id===card.dataset.id);card.querySelectorAll('[data-k]').forEach(el=>el.oninput=()=>{p[el.dataset.k]=el.dataset.k==='type'?el.value:finiteNonNegative(el.value);save();renderProducts()});card.querySelector('[data-remove]').onclick=()=>{state.products=state.products.filter(x=>x.id!==p.id);save();renderProducts()}})}
function naturalReason(r){if(r.taxNow===0)return r.wrapperCostEstimate>.01?'המשיכה פטורה, אך כדאי לשקול את אובדן הצמיחה הפטורה.':'המשיכה פטורה ממס לפי ההנחה.';if(r.gainRatio<.03)return 'רכיב הרווח קטן, ולכן המס המיידי נמוך יחסית.';if(r.taxBasis==='real'&&r.cpiAdjustment>0)return 'ההצמדה למדד מקטינה את הרווח החייב במס.';if(r.wrapperCostEstimate>.08)return 'נשמר להמשך ככל האפשר בגלל יתרון מס עתידי.';return 'עלות המס המשוערת נמוכה יחסית למוצרים שאחריו.'}
function renderResults(){const r=result(),rows=r.rows;const cards=[['נטו נדרש',fmt(r.requiredNet)],['נטו בתכנית',fmt(r.allocatedNet)],['ברוטו כולל',fmt(r.totalGross)],['מס משוער',fmt(r.totalTax)],['חוסר',fmt(r.shortfall)],['מקורות בשימוש',r.productsUsed],['סטטוס',r.shortfall<.01?'הצורך כוסה':'חסר סכום']];$('#summaryCards').innerHTML=cards.map((c,i)=>`<div class="summary-card ${i===6?'status '+(r.shortfall<.01?'ok':'bad'):''}"><small>${c[0]}</small><strong>${c[1]}</strong></div>`).join('');$('#statusMessage').innerHTML=r.shortfall>.01?`<div class="status-banner">חסרים <b>${fmt(r.shortfall)}</b> להשלמת היעד.</div>`:'';$('#resultsBody').innerHTML=rows.map(x=>`<tr class="${x.gross>.01?'active':'inactive'}"><td>${x.rank}</td><td><b>${esc(settings[x.type].label)}</b><br><small>${x.taxBasis==='real'?'מס ריאלי':x.taxBasis==='nominal'?'מס נומינלי':'פטור'}</small></td><td class="amount">${money2.format(x.value)}</td><td class="amount">${money2.format(x.gross)}</td><td class="amount">${money2.format(x.gainComponent)}</td><td class="amount">${money2.format(x.tax)}</td><td class="amount"><b>${money2.format(x.net)}</b></td><td class="amount">${money2.format(x.remainingValue)}</td><td><small>${naturalReason(x)}</small></td></tr>`).join('');$('#resultsFoot').innerHTML=`<tr><td colspan="2">סה״כ</td><td class="amount">${money2.format(rows.reduce((s,x)=>s+x.value,0))}</td><td class="amount">${money2.format(r.totalGross)}</td><td class="amount">${money2.format(rows.reduce((s,x)=>s+x.gainComponent,0))}</td><td class="amount">${money2.format(r.totalTax)}</td><td class="amount">${money2.format(r.allocatedNet)}</td><td class="amount">${money2.format(rows.reduce((s,x)=>s+x.remainingValue,0))}</td><td></td></tr>`}
function renderAdvanced(){const root=$('#advancedProducts');root.innerHTML=state.products.map(p=>{const d=settings[p.type],basis=p.taxBasisOverride||d.taxBasis||'nominal';return`<article class="advanced-card" data-id="${p.id}"><h3>${esc(d.label)}</h3><div class="advanced-grid"><label>בסיס המס<select data-k="taxBasisOverride"><option value="" ${!p.taxBasisOverride?'selected':''}>אוטומטי — ${basis==='real'?'ריאלי':basis==='exempt'?'פטור':'נומינלי'}</option><option value="real" ${p.taxBasisOverride==='real'?'selected':''}>ריאלי</option><option value="nominal" ${p.taxBasisOverride==='nominal'?'selected':''}>נומינלי</option><option value="exempt" ${p.taxBasisOverride==='exempt'?'selected':''}>פטור</option></select></label><label>הצמדה מצטברת מאז הרכישה (%)<input data-k="cpiAdjustment" type="number" min="0" step=".1" value="${p.cpiAdjustment*100}" ${basis!=='real'?'disabled':''}></label><label>תשואה שנתית צפויה (%)<input data-k="annualReturn" type="number" min="0" step=".1" value="${p.annualReturn*100}"></label><label>שנים קדימה<input data-k="years" type="number" min="0" value="${p.years}"></label><label>מס היום — override (%)<input data-k="taxNowOverride" type="number" min="0" value="${p.taxNowOverride===''?'':p.taxNowOverride*100}" placeholder="${d.taxNow*100}"></label><label>ערך דחיית מס (%)<input data-k="wrapperOverride" type="number" min="0" value="${p.wrapperOverride===''?'':p.wrapperOverride*100}" placeholder="${d.wrapperCost*100}"></label></div></article>`}).join('');root.querySelectorAll('.advanced-card').forEach(card=>{const p=state.products.find(x=>x.id===card.dataset.id);card.querySelectorAll('[data-k]').forEach(el=>el.oninput=()=>{const k=el.dataset.k;p[k]=['taxBasisOverride'].includes(k)?el.value:el.value===''?'':finiteNonNegative(el.value)/(['years'].includes(k)?1:100);save();renderAdvanced()})});renderTaxSettings()}
function renderTaxSettings(){$('#taxBody').innerHTML=Object.entries(settings).map(([k,d])=>`<tr data-type="${k}"><td><b>${esc(d.label)}</b></td><td><select data-k="taxBasis"><option value="real" ${d.taxBasis==='real'?'selected':''}>ריאלי</option><option value="nominal" ${d.taxBasis==='nominal'?'selected':''}>נומינלי</option><option value="exempt" ${d.taxBasis==='exempt'?'selected':''}>פטור</option></select></td><td><input data-k="taxNow" type="number" value="${d.taxNow*100}">%</td><td><input data-k="taxFuture" type="number" value="${d.taxFuture*100}">%</td><td><input data-k="wrapperCost" type="number" value="${d.wrapperCost*100}">%</td><td><textarea data-k="assumption">${esc(d.assumption)}</textarea></td></tr>`).join('');$('#taxBody').querySelectorAll('[data-k]').forEach(el=>el.oninput=()=>{const d=settings[el.closest('tr').dataset.type],k=el.dataset.k;d[k]=['taxNow','taxFuture','wrapperCost'].includes(k)?finiteNonNegative(el.value)/100:el.value;renderAdvanced()})}
function summary(){const r=result();return`תכנית משיכה\nנטו נדרש: ${fmt(r.requiredNet)}\nברוטו: ${fmt(r.totalGross)}\nמס משוער: ${fmt(r.totalTax)}\n${r.rows.filter(x=>x.gross>.01).map(x=>`${settings[x.type].label}: נטו ${fmt(x.net)}, מס ${fmt(x.tax)}`).join('\n')}\nמודל תכנוני בלבד.`}
function exportCsv(){const r=result(),data=[['סוג','שווי','ברוטו','רווח חייב','מס','נטו','יתרה'],...r.rows.map(x=>[settings[x.type].label,x.value,x.gross,x.gainComponent,x.tax,x.net,x.remainingValue]),['סה״כ','',r.totalGross,'',r.totalTax,r.allocatedNet,'']];const csv='\uFEFF'+data.map(a=>a.map(v=>`"${v}"`).join(',')).join('\r\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='withdrawal-plan.csv';a.click()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2000)}
$$('[data-next]').forEach(b=>b.onclick=()=>go(screen+1));$$('[data-back]').forEach(b=>b.onclick=()=>go(screen-1));$$('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));$('#requiredNet').oninput=e=>{state.requiredNet=finiteNonNegative(e.target.value);$('#heroNet').textContent=fmt(state.requiredNet);save()};$('#addProductBtn').onclick=()=>{state.products.push(make());save();renderProducts()};$('#expectedInflation').oninput=e=>{state.expectedInflation=finiteNonNegative(e.target.value);save()};$('#recalcBtn').onclick=()=>go(3);$('#resetTaxBtn').onclick=()=>{if(confirm('לשחזר את כל ברירות המחדל?')){settings=clone(PRODUCT_TYPES);renderAdvanced()}};$('#printBtn').onclick=()=>print();$('#csvBtn').onclick=exportCsv;$('#copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText(summary());toast('הסיכום הועתק')}catch{const t=document.createElement('textarea');t.value=summary();document.body.append(t);t.select();document.execCommand('copy');t.remove();toast('הסיכום הועתק')}};
$('#heroNet').textContent=fmt(state.requiredNet);$('#requiredNet').value=state.requiredNet;$('#expectedInflation').value=state.expectedInflation;renderProducts();

let productStep=0;
document.body.insertAdjacentHTML('afterbegin','<a class="skip-link" href="#mainContent">דלג לתוכן המרכזי</a>');
document.querySelector('main').id='mainContent';
document.querySelector('.brand').insertAdjacentHTML('afterbegin','<img class="client-logo" src="./assets/roei-romano-logo.png" alt="רועי רומנו, מתכנן פיננסי">');
document.querySelector('.brand>span').remove();
document.querySelector('.intro .eyebrow').textContent='מתחילים מהיעד';
document.querySelector('.intro h1').textContent='כמה כסף צריך (נטו)?';

renderProducts=function(){
  if(!state.products.length) state.products.push(make());
  productStep=Math.max(0,Math.min(productStep,state.products.length-1));
  const p=state.products[productStep],d=settings[p.type]||PRODUCT_TYPES.other,noCost=!!d.noCost,total=state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0),root=$('#products');
  root.className='products product-single';
  root.innerHTML=`<div class="product-progress"><div><span>מוצר ${productStep+1} מתוך ${state.products.length}</span><strong> · ${esc(d.label)}</strong></div><div class="current-total"><small>שווי כל המוצרים שהוזנו</small><b>${fmt(total)}</b></div></div><article class="product-card" data-id="${p.id}"><div class="product-head"><h3>${esc(d.label)}</h3>${state.products.length>1?'<button data-remove>מחיקת המוצר</button>':''}</div><div class="product-grid ${noCost?'no-cost':''}"><label>סוג המוצר<select data-k="type">${typeOptions(p.type)}</select></label><label>שווי נוכחי (₪)<input data-k="value" inputmode="decimal" type="number" min="0" value="${p.value}"></label><label>עלות ממוצעת / הפקדות (₪)<input data-k="cost" inputmode="decimal" type="number" min="0" value="${p.cost}"></label></div>${noCost?'<p class="simple-help">במוצר פנסיוני נדרש בשלב זה רק השווי הנוכחי. זמינות הכספים והמס ייבדקו במסך ההתאמות.</p>':''}</article><div class="product-nav"><button class="outline" id="prevProduct" ${productStep===0?'disabled':''}>→ המוצר הקודם</button><div class="center-actions"><button class="outline" id="showPlanNow">הצגת התכנית עכשיו</button><button class="cta" id="nextProduct">${productStep===state.products.length-1?'＋ הוספת מוצר נוסף':'המוצר הבא ←'}</button></div></div>`;
  const card=root.querySelector('.product-card');
  card.querySelector('[data-k="type"]').onchange=e=>{p.type=e.target.value;if(settings[p.type]?.noCost)p.cost=p.value;save();renderProducts()};
  card.querySelector('[data-k="value"]').oninput=e=>{p.value=finiteNonNegative(e.target.value);if(settings[p.type]?.noCost)p.cost=p.value;save();root.querySelector('.current-total b').textContent=fmt(state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0))};
  const cost=card.querySelector('[data-k="cost"]');if(cost)cost.oninput=e=>{p.cost=finiteNonNegative(e.target.value);save()};
  card.querySelector('[data-remove]')?.addEventListener('click',()=>{state.products.splice(productStep,1);productStep=Math.max(0,productStep-1);save();renderProducts()});
  $('#prevProduct').onclick=()=>{productStep--;renderProducts()};
  $('#showPlanNow').onclick=()=>go(3);
  $('#nextProduct').onclick=()=>{if(productStep<state.products.length-1){productStep++;renderProducts()}else{state.products.push(make());productStep=state.products.length-1;save();renderProducts()}};
};

const baseRenderResults=renderResults;
renderResults=function(){baseRenderResults();const total=state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0),cards=$$('#summaryCards .summary-card');if(cards[1]){cards[1].querySelector('small').textContent='שווי נוכחי כולל';cards[1].querySelector('strong').textContent=fmt(total)}const headers=$$('.result-panel thead th');if(headers[3])headers[3].textContent='סכום משיכה (ברוטו)';$('#resultsBody').querySelectorAll('tr').forEach((tr,i)=>{const row=result().rows[i];if(row?.type==='education')tr.lastElementChild?.insertAdjacentHTML('beforeend','<span class="loan-note">כדאי לשקול גם הלוואת בלון/שפיצר כנגד הקרן: הכסף נשאר מושקע, ולעיתים ניתן לקבל ריבית אטרקטיבית. יש לבדוק תנאים וסיכון.</span>')});if(!document.querySelector('.contact-card'))document.querySelector('.result-panel').insertAdjacentHTML('afterend','<div class="contact-card"><div><b>רוצים לבדוק תנאי הלוואה ולעבור יחד על התכנית?</b><p>רועי רומנו, מתכנן פיננסי</p><span class="email-consent">הנתונים ייפתחו בתוכנת הדוא״ל רק לאחר אישורכם.</span></div><button id="emailPlan">שליחת התכנית לרועי</button></div>');$('#emailPlan').onclick=()=>{if(confirm('לפתוח הודעת דוא״ל חדשה אל roeir@ar-fo.co.il עם סיכום התכנית? הנתונים יועברו רק אם תשלחו את ההודעה.'))location.href=`mailto:roeir@ar-fo.co.il?subject=${encodeURIComponent('תכנית משיכה לבדיקה')}&body=${encodeURIComponent(summary())}`}};

const baseAdvanced=renderAdvanced;
renderAdvanced=function(){baseAdvanced();$$('.advanced-card').forEach(card=>{const returnInput=card.querySelector('[data-k="annualReturn"]');if(returnInput){returnInput.step='.01';returnInput.value=Number(returnInput.value).toFixed(2)}const tax=card.querySelector('[data-k="taxNowOverride"]');if(tax)tax.closest('label').childNodes[0].textContent='שיעור מס חלופי (%)';const def=card.querySelector('[data-k="wrapperOverride"]');if(def){def.closest('label').childNodes[0].textContent='חשיבות שמירת הטבת המס (%)';def.closest('label').insertAdjacentHTML('beforeend','<small class="simple-help">אומדן להשפעה העתידית של ויתור על פטור או דחיית מס. ערך גבוה גורם למערכת לשמור את המוצר להמשך.</small>')}})};

document.body.insertAdjacentHTML('beforeend',`<button class="access-btn" aria-label="פתיחת תפריט נגישות" aria-expanded="false">♿</button><div class="access-panel" aria-label="אפשרויות נגישות"><b>התאמות נגישות</b><button data-a="large">הגדלת טקסט</button><button data-a="contrast">ניגודיות גבוהה</button><button data-a="links">הדגשת קישורים</button><button data-a="reset">איפוס התאמות</button></div><div class="modal" id="privacyModal" role="dialog" aria-modal="true" aria-labelledby="privacyTitle"><div class="modal-card"><button class="close">סגירה</button><h2 id="privacyTitle">מדיניות פרטיות</h2><p><b>בעל השליטה והתקשרות:</b> רועי רומנו, roeir@ar-fo.co.il.</p><p>המחשבון פועל מקומית בדפדפן. הנתונים הפיננסיים נשמרים ב־localStorage במכשיר לצורך המשך עבודה ואינם נשלחים לבעל האתר או לצד שלישי. אין חובה חוקית למסור מידע, ואפשר להשתמש במחשבון ללא שם או פרטים מזהים.</p><p>בלחיצה על שליחת התכנית נפתחת תוכנת הדוא״ל שלכם. רק אם תבחרו לשלוח, הפרטים יועברו לרועי רומנו לצורך מעבר על התכנית ויצירת קשר. ניתן לעיין במידע שנשלח, לבקש תיקון או מחיקה בפנייה לדוא״ל.</p><p>האתר אינו משתמש בעוגיות פרסום, ניתוח או מעקב. הוא משתמש באחסון מקומי חיוני בלבד. ניתן למחוק את הנתונים דרך הגדרות הדפדפן.</p><p>אין להזין מידע אישי רגיש שאינו דרוש לחישוב. מדיניות זו נועדה לשקף את עקרונות חוק הגנת הפרטיות ותיקון 13, אך אינה תחליף לייעוץ משפטי פרטני.</p></div></div><div class="modal" id="accessModal" role="dialog" aria-modal="true"><div class="modal-card"><button class="close">סגירה</button><h2>הצהרת נגישות</h2><p>נעשו התאמות להפעלה במקלדת, סימון פוקוס, ניגודיות, הגדלת טקסט, תוויות לשדות והתאמה למסכים שונים. היעד הוא התאמה לת״י 5568 ברמה AA.</p><p>אם נתקלתם בקושי, פנו אל רועי רומנו: roeir@ar-fo.co.il, וציינו את הפעולה שניסיתם לבצע.</p><p>הצהרה זו עודכנה באוגוסט 2026.</p></div></div>${localStorage.getItem('dw-cookie-ok')?'':'<div class="cookie-banner"><b>פרטיות ואחסון מקומי</b><p>אין באתר עוגיות מעקב. נתוני המחשבון נשמרים רק במכשיר באמצעות אחסון מקומי חיוני.</p><button>הבנתי</button></div>'}`);
document.querySelector('footer').insertAdjacentHTML('beforeend','<div class="legal-links"><button id="privacyLink">מדיניות פרטיות</button><button id="accessLink">הצהרת נגישות</button></div>');
const accessBtn=document.querySelector('.access-btn'),accessPanel=document.querySelector('.access-panel');accessBtn.onclick=()=>{accessPanel.classList.toggle('open');accessBtn.setAttribute('aria-expanded',accessPanel.classList.contains('open'))};accessPanel.onclick=e=>{const a=e.target.dataset.a;if(a==='large')document.body.classList.toggle('large-text');if(a==='contrast')document.body.classList.toggle('high-contrast');if(a==='links')document.body.classList.toggle('underline-links');if(a==='reset')document.body.classList.remove('large-text','high-contrast','underline-links')};
function openModal(id){document.querySelector(id).classList.add('open');document.querySelector(id+' .close').focus()}$('#privacyLink').onclick=()=>openModal('#privacyModal');$('#accessLink').onclick=()=>openModal('#accessModal');$$('.modal .close').forEach(b=>b.onclick=()=>b.closest('.modal').classList.remove('open'));document.querySelector('.cookie-banner button')?.addEventListener('click',e=>{localStorage.setItem('dw-cookie-ok','1');e.target.closest('.cookie-banner').remove()});
renderProducts();

const MAX_WITHDRAWAL=99000000;
const parseMoney=v=>Math.min(MAX_WITHDRAWAL,finiteNonNegative(String(v??'').replace(/[^0-9.]/g,'')));
const formatInput=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(finiteNonNegative(n));
const requiredField=$('#requiredNet');requiredField.type='text';requiredField.inputMode='numeric';requiredField.maxLength=12;requiredField.value=formatInput(state.requiredNet);requiredField.setAttribute('aria-describedby','requiredLimit');requiredField.insertAdjacentHTML('afterend','<small id="requiredLimit" class="simple-help">עד 99,000,000 ₪</small>');requiredField.oninput=e=>{const caret=e.target.selectionStart,raw=e.target.value,parsed=parseMoney(raw);state.requiredNet=parsed;e.target.value=formatInput(parsed);$('#heroNet').textContent=fmt(parsed);save()};requiredField.onblur=e=>e.target.value=formatInput(state.requiredNet);

const luxuryRenderProducts=renderProducts;
renderProducts=function(){luxuryRenderProducts();const root=$('#products'),ledger=state.products.map((x,i)=>`<div class="ledger-item"><span>${i+1}. ${esc(settings[x.type]?.label||'טרם נבחר סוג')}</span><b>${fmt(x.value)}</b></div>`).join('');root.querySelector('.product-progress').insertAdjacentHTML('afterend',`<aside class="product-ledger"><h3>המוצרים שכבר הוזנו</h3>${ledger||'<div class="ledger-empty">עדיין לא הוזנו מוצרים</div>'}</aside>`);const value=root.querySelector('[data-k="value"]'),cost=root.querySelector('[data-k="cost"]');[value,cost].filter(Boolean).forEach(input=>{const key=input.dataset.k;input.type='text';input.inputMode='numeric';input.value=formatInput(state.products[productStep][key]);input.oninput=e=>{const p=state.products[productStep],parsed=parseMoney(e.target.value);p[key]=parsed;if(key==='value'&&settings[p.type]?.noCost)p.cost=parsed;e.target.value=formatInput(parsed);save();root.querySelector('.current-total b').textContent=fmt(state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0));const item=root.querySelectorAll('.ledger-item')[productStep]?.querySelector('b');if(item)item.textContent=fmt(parsed)}})};

const luxuryAdvanced=renderAdvanced;
renderAdvanced=function(){luxuryAdvanced();$$('.advanced-card').forEach(card=>{const input=card.querySelector('[data-k="wrapperOverride"]');if(!input)return;const p=state.products.find(x=>x.id===card.dataset.id),d=settings[p.type],current=p.wrapperOverride===''?d.wrapperCost:p.wrapperOverride;const select=document.createElement('select');select.className='benefit-select';select.innerHTML=`<option value="0" ${current===0?'selected':''}>ללא חשיבות מיוחדת</option><option value="0.05" ${current>.001&&current<.1?'selected':''}>חשוב לשמור להמשך</option><option value="0.15" ${current>=.1&&current<.2?'selected':''}>חשוב מאוד לשמור</option><option value="0.25" ${current>=.2?'selected':''}>עדיפות גבוהה להשאיר</option>`;select.onchange=()=>{p.wrapperOverride=Number(select.value);save()};input.replaceWith(select);const label=select.closest('label');label.childNodes[0].textContent='כמה חשוב להשאיר את המוצר להמשך?';label.querySelector('.simple-help')?.remove();label.insertAdjacentHTML('beforeend','<small class="simple-help">הבחירה משקפת את החשיבות של שמירת פטור או דחיית מס עתידית. היא משפיעה על סדר המשיכה, ולא על סכום המס עצמו.</small>')});const reset=$('#resetTaxBtn');reset.onclick=()=>{if(confirm('להחזיר את כל הנחות המס, האינפלציה והתאמות המוצרים לברירות המחדל?')){settings=clone(PRODUCT_TYPES);state.expectedInflation=2.5;state.products.forEach(p=>{p.annualReturn=.07;p.years=10;p.cpiAdjustment=0;p.taxNowOverride='';p.taxFutureOverride='';p.wrapperOverride='';p.taxBasisOverride=''});$('#expectedInflation').value='2.5';save();renderAdvanced();toast('כל ההגדרות שוחזרו')}}};

const luxuryResults=renderResults;
renderResults=function(){luxuryResults();$$('.loan-note').forEach(n=>n.textContent='כדאי לשקול הלוואה כנגד הקרן: הכסף נשאר מושקע, ולעיתים ניתן לקבל ריבית אטרקטיבית. יש לבדוק תנאים וסיכון.')};

document.querySelector('footer').insertAdjacentHTML('afterbegin','<div class="contact-footer"><strong>רועי רומנו · מתכנן פיננסי</strong><a href="tel:0528089808">052-8089808</a><a href="mailto:roeir@ar-fo.co.il">roeir@ar-fo.co.il</a></div>');
const headerAdvanced=renderAdvanced;renderAdvanced=function(){headerAdvanced();const heads=$$('.type-settings thead th');if(heads[4])heads[4].textContent='שמירת הטבת מס (%)'};
document.querySelector('[data-screen="1"] [data-next]').onclick=()=>go(2);
renderProducts();

const originalMake=make;make=function(type='',value=0,cost=0){return originalMake(type,value,cost)};
const originalTypeOptions=typeOptions;typeOptions=function(selected){return`<option value="" ${!selected?'selected':''} disabled>בחרו סוג תכנית</option>`+originalTypeOptions(selected)};
if(state.products.length===1&&state.products[0].value===0&&state.products[0].cost===0)state.products[0].type='';
const brand=document.querySelector('.brand');if(!brand.querySelector('.dw-mark'))brand.insertAdjacentHTML('afterbegin','<span class="dw-mark" aria-hidden="true">DW</span>');
const netInput=$('#requiredNet');netInput.value=state.requiredNet?formatInput(state.requiredNet):'';netInput.placeholder='הכנס סכום';netInput.autocomplete='off';setTimeout(()=>netInput.focus(),50);
document.querySelector('.steps [data-go="2"] span').textContent='התכניות';
document.querySelector('[data-screen="2"] h1').textContent='אילו תכניות עומדות לרשותך?';
document.querySelector('[data-screen="2"] .screen-head p').textContent='בחרו סוג תכנית, הזינו שווי ועלות, והוסיפו תכניות לפי הצורך.';
document.querySelector('#addProductBtn').textContent='＋ הוספת תכנית';
document.querySelector('.result-panel thead th:nth-child(2)').textContent='סוג תכנית';

const revisionProducts=renderProducts;
renderProducts=function(){revisionProducts();const root=$('#products'),p=state.products[productStep],ledger=root.querySelector('.product-ledger'),total=state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0);ledger.querySelector('h3').textContent='התכניות שהוזנו';ledger.insertAdjacentHTML('beforeend',`<div class="product-ledger-total"><span>שווי כולל</span><b>${fmt(total)}</b></div>`);const prev=$('#prevProduct'),next=$('#nextProduct'),plan=$('#showPlanNow');prev.textContent=productStep===0?'חזור':'→ התכנית הקודמת';prev.disabled=false;prev.onclick=()=>{if(productStep===0)go(1);else{productStep--;renderProducts()}};next.textContent=productStep<state.products.length-1?'התכנית הבאה ←':'＋ הוספת תכנית';plan.textContent='הצגת תכנית המשיכה';const type=root.querySelector('[data-k="type"]');if(!p.type){root.querySelector('.product-card').classList.add('awaiting-type')}type.onchange=e=>{p.type=e.target.value;if(settings[p.type]?.noCost)p.cost=p.value;save();renderProducts()};root.querySelector('[data-remove]')?.setAttribute('aria-label','מחיקת תכנית')};

let disclaimerAccepted=false;const directGo=go;
go=function(n){if(n===3&&screen===2){const missing=state.products.findIndex(p=>!p.type||finiteNonNegative(p.value)<=0);if(missing>=0){productStep=missing;renderProducts();toast('יש לבחור סוג תכנית ולהזין שווי נוכחי');return}if(!disclaimerAccepted){showDisclaimer();return}}directGo(n)};
document.body.insertAdjacentHTML('beforeend',`<div class="modal disclaimer-modal" id="disclaimerModal" role="dialog" aria-modal="true" aria-labelledby="disclaimerTitle"><div class="modal-card"><div class="loading-ring"></div><h2 id="disclaimerTitle">מכינים את תכנית המשיכה...</h2><p class="loading-label">מחשבים את המס והחלוקה בין התכניות</p><div class="disclaimer-copy"><h3>לפני הצגת התוצאה</h3><p>המחשבון הוא כלי סימולציה כללי להשוואת חלופות בלבד. הוא אינו מהווה ייעוץ מס, ייעוץ השקעות, ייעוץ פנסיוני, שיווק פנסיוני או המלצה לביצוע פעולה.</p><p>החישוב עשוי שלא לכלול נתוני מדד מדויקים, תקרות פטור, כספים שאינם נזילים, קצבה מזכה, הפקדות מעל תקרה, קיזוז הפסדים, הטבות אישיות ותנאים של הגוף המנהל. יש לבדוק את הנתונים עם מתכנן פיננסי ובעל מקצוע מוסמך לפני פעולה.</p><label class="consent-row"><input id="disclaimerConsent" type="checkbox"><span>קראתי והבנתי שמדובר בסימולציה כללית ולא בייעוץ או תחליף לייעוץ אישי.</span></label><button id="acceptDisclaimer" class="cta" disabled>הבנתי — הצגת התכנית</button></div></div></div><div class="modal" id="leadModal" role="dialog" aria-modal="true" aria-labelledby="leadTitle"><div class="modal-card"><button class="close" type="button">סגירה</button><h2 id="leadTitle">שליחת התכנית לרועי</h2><p>הפרטים יתווספו להודעת הדוא״ל. ההודעה תישלח רק לאחר שתאשרו אותה בתוכנת הדוא״ל שלכם.</p><form class="modal-form" id="leadForm"><label>שם מלא<input id="leadName" type="text" autocomplete="name" required></label><label>טלפון<input id="leadPhone" type="tel" autocomplete="tel" inputmode="tel" required></label><label class="consent-row"><input id="leadConsent" type="checkbox" required><span>אני מאשר/ת להעביר את הפרטים ואת סיכום התכנית לרועי רומנו לצורך יצירת קשר ומעבר על התכנית. מסירת הפרטים היא מרצון.</span></label><div class="form-error" id="leadError"></div><button class="cta" type="submit">פתיחת הודעת הדוא״ל</button></form></div></div>`);
function showDisclaimer(){const modal=$('#disclaimerModal'),copy=modal.querySelector('.disclaimer-copy');modal.classList.add('open');modal.querySelector('.loading-ring').style.display='block';modal.querySelector('.loading-label').style.display='block';copy.classList.remove('ready');setTimeout(()=>{modal.querySelector('.loading-ring').style.display='none';modal.querySelector('.loading-label').style.display='none';copy.classList.add('ready');$('#disclaimerConsent').focus()},850)}
$('#disclaimerConsent').onchange=e=>$('#acceptDisclaimer').disabled=!e.target.checked;$('#acceptDisclaimer').onclick=()=>{disclaimerAccepted=true;$('#disclaimerModal').classList.remove('open');directGo(3)};
const revisionResults=renderResults;
renderResults=function(){revisionResults();$$('.loan-note').forEach(n=>{const small=n.parentElement.querySelector('small');if(small){small.append(' '+n.textContent);n.remove()}});const email=$('#emailPlan');if(email)email.onclick=()=>{$('#leadModal').classList.add('open');$('#leadName').focus()};$('#leadModal .close').onclick=()=>$('#leadModal').classList.remove('open')};
$('#leadForm').onsubmit=e=>{e.preventDefault();const name=$('#leadName').value.trim(),phone=$('#leadPhone').value.trim();if(!name||!phone||!$('#leadConsent').checked){$('#leadError').textContent='יש למלא שם וטלפון ולאשר את העברת המידע.';return}const body=`שם: ${name}\nטלפון: ${phone}\n\n${summary()}\n\nהלקוח אישר העברת מידע ויצירת קשר.`;location.href=`mailto:roeir@ar-fo.co.il?subject=${encodeURIComponent('תכנית משיכה לבדיקה')}&body=${encodeURIComponent(body)}`};
renderProducts();

document.querySelector('[data-screen="3"]').id='results';
document.querySelector('#results .screen-head')?.classList.add('section-header');
document.querySelector('.secure')?.remove();
const stepLabels=['הצורך','הנתונים','התכנית'];$$('.steps button').slice(0,3).forEach((b,i)=>b.querySelector('span').textContent=stepLabels[i]);
document.querySelector('.intro h1').textContent='כמה כסף צריך?';netInput.placeholder='הכנס סכום נטו';
const orb=document.querySelector('.orb');orb.querySelector('span').textContent='סכום היעד';orb.querySelector('i').textContent='נטו';
document.querySelector('[data-screen="2"] .eyebrow').textContent='שלב 2 מתוך 3';document.querySelector('[data-screen="3"] .eyebrow').textContent='שלב 3 מתוך 3';
function replaceTerminology(root=document.body){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement?.matches('script,style'))continue;node.nodeValue=node.nodeValue.replaceAll('מוצרים','תכניות').replaceAll('מוצר','תכנית')}}
replaceTerminology();
const correctionProducts=renderProducts;
renderProducts=function(){correctionProducts();const root=$('#products'),p=state.products[productStep],screen2=document.querySelector('[data-screen="2"]');if(!screen2.querySelector('.step-goal-orb'))screen2.insertAdjacentHTML('afterbegin',`<div class="step-goal-orb"><small>סכום היעד</small><strong>${fmt(state.requiredNet)}</strong><small>נטו</small></div>`);else screen2.querySelector('.step-goal-orb strong').textContent=fmt(state.requiredNet);const del=root.querySelector('[data-remove]');if(del){del.innerHTML='🗑️';del.title='מחיקת תכנית';del.setAttribute('aria-label','מחיקת תכנית')};const nav=root.querySelector('.product-nav');nav.innerHTML=`<button class="outline" id="nextProduct">${productStep<state.products.length-1?'התכנית הבאה ←':'＋ הוספת תכנית'}</button><button class="outline" id="showPlanNow">הצגת תכנית המשיכה</button><button class="outline" id="prevProduct">${productStep===0?'חזור':'→ התכנית הקודמת'}</button>`;$('#nextProduct').onclick=()=>{if(productStep<state.products.length-1)productStep++;else{state.products.push(make());productStep=state.products.length-1;save()}renderProducts()};$('#showPlanNow').onclick=()=>go(3);$('#prevProduct').onclick=()=>{if(productStep===0)go(1);else{productStep--;renderProducts()}};const type=root.querySelector('[data-k="type"]');type.onchange=e=>{p.type=e.target.value;if(settings[p.type]?.noCost)p.cost=p.value;save();renderProducts();setTimeout(()=>$('#products [data-k="value"]')?.focus(),0)};replaceTerminology(root)};

function futureNetCost(x){const outsideTax=.25;return Math.max(0,x.futureGainPerShekel*Math.max(0,outsideTax-x.taxFuture))}
naturalReason=function(r){const immediate=r.taxCostPerNet*100,future=r.futureOpportunityCostPerNet||0;let text=immediate<.1?'אין מס מיידי צפוי לפי ההנחות.':`עלות המס המיידית היא כ־${immediate.toFixed(2)}% מכל שקל נטו.`;if(future>.005)text+=` בנוסף, כל 1 ₪ נטו שנמשך מוותר על שווי עתידי נטו מוערך של ${future.toFixed(2)} ₪, לפי התשואה, התקופה והמס העתידי שהוגדרו.`;else text+=' לפי ההנחות לא זוהה אובדן עתידי מהותי.';return text}
const correctionResults=renderResults;
renderResults=function(){correctionResults();const r=result(),total=state.products.reduce((s,x)=>s+finiteNonNegative(x.value),0),zone=$('#results');if(!zone.querySelector('.priority-heading'))zone.querySelector('.section-header').insertAdjacentHTML('afterend','<div class="priority-heading"><span class="rank-icon">1</span><div><h3>סדר עדיפות מומלץ למשיכה</h3><p>שורה 1 היא התכנית שממנה מומלץ להתחיל. לאחר מיצוי הסכום הנדרש עוברים לשורה הבאה.</p></div></div>');$('#summaryCards').className='kpis';$('#summaryCards').innerHTML=`<div class="summary-card"><small>שווי נוכחי כולל</small><strong>${fmt(total)}</strong></div><div class="summary-card"><small>סכום משיכה מומלץ</small><strong>${fmt(r.totalGross)}</strong></div><div class="summary-card"><small>מס משוער</small><strong>${fmt(r.totalTax)}</strong></div><div class="summary-card net-target"><small>נטו מבוקש</small><strong>${fmt(r.requiredNet)}</strong></div><div class="summary-card shortfall ${r.shortfall>.01?'positive':'zero'}"><small>חוסר</small><strong>${fmt(r.shortfall)}</strong></div>`;const headers=$$('.result-panel thead th');if(headers[3])headers[3].textContent='סכום משיכה מומלץ';if(!headers.some(h=>h.dataset.future)){const reason=headers[headers.length-1],th=document.createElement('th');th.dataset.future='1';th.innerHTML='עלות עתידית נטו לכל 1 ₪<span class="future-help">אומדן ליתרון המס העתידי שאובד במשיכה היום</span>';reason.before(th)}const rows=r.rows;$$('#resultsBody tr').forEach((tr,i)=>{const reason=tr.lastElementChild;if(!tr.querySelector('.future-cost')){const td=document.createElement('td'),cost=futureNetCost(rows[i]);td.className='future-cost';td.innerHTML=`${cost.toFixed(2)} ₪<span class="future-help">לכל 1 ₪ שנמשך</span>`;reason.before(td)}});const foot=$('#resultsFoot tr');if(foot&&!foot.querySelector('[data-future-foot]')){const last=foot.lastElementChild,td=document.createElement('td');td.dataset.futureFoot='1';td.textContent='—';last.before(td)}replaceTerminology(zone)};

const inflation=()=>finiteNonNegative(state.expectedInflation)/100;function realReturnText(){const nominal=.07,real=(1+nominal)/(1+inflation())-1;return`בדוגמה של תשואה נומינלית 7.00% ואינפלציה ${state.expectedInflation.toFixed(2)}%, התשואה הריאלית היא ${Math.max(0,real*100).toFixed(2)}%. הנתון משפיע רק על תכניות שבהן המס מחושב על רווח ריאלי ועל אומדן העלות העתידית.`}
const correctionAdvanced=renderAdvanced;
renderAdvanced=function(){correctionAdvanced();const card=document.querySelector('.inflation-card');card.querySelector('p').textContent='האינפלציה מפחיתה את הרווח החייב במס בתכניות שממוסות על רווח ריאלי, ומשפיעה על אומדן היתרון העתידי של השארת הכסף בתכנית.';let exp=card.querySelector('.inflation-explainer');if(!exp){card.insertAdjacentHTML('beforeend',`<div class="inflation-explainer"><span class="inflation-result">${realReturnText()}</span></div>`);exp=card.querySelector('.inflation-explainer')}else exp.querySelector('.inflation-result').textContent=realReturnText();$('#expectedInflation').oninput=e=>{state.expectedInflation=finiteNonNegative(e.target.value);save();exp.querySelector('.inflation-result').textContent=realReturnText()};replaceTerminology(document.querySelector('[data-screen="4"]'))};
renderProducts();

const BANK_OF_ISRAEL_FALLBACK=.035;
const AMENDMENT_190_LOCKED_2025=38412;
let bankOfIsraelRate=(()=>{const cached=Number(localStorage.getItem('dw-boi-rate'));return cached>0&&cached<.2?cached:BANK_OF_ISRAEL_FALLBACK})();
const bankDepositRate=()=>Math.max(0,bankOfIsraelRate-.015);
let mobileProductField=0;

async function refreshBankOfIsraelRate(){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    let percent;
    try{
      const response=await fetch('https://www.boi.org.il/PublicApi/GetInterest',{signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw new Error('official endpoint unavailable');
      percent=Number((await response.json()).currentInterest);
    }catch{
      const response=await fetch('https://r.jina.ai/https://www.boi.org.il/PublicApi/GetInterest',{signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw new Error('read endpoint unavailable');
      const match=(await response.text()).match(/"currentInterest"\s*:\s*([0-9.]+)/);
      percent=Number(match?.[1]);
    }
    if(!(percent>0&&percent<20))throw new Error('invalid interest rate');
    bankOfIsraelRate=percent/100;
    localStorage.setItem('dw-boi-rate',String(bankOfIsraelRate));
    localStorage.setItem('dw-boi-rate-date',new Date().toISOString());
    let changed=false;
    state.products.forEach(plan=>{if(plan.type==='moneyFund'&&plan.moneyFundRateMode!=='manual'){plan.annualReturn=bankOfIsraelRate;plan.moneyFundRateInitialized=true;plan.moneyFundRateMode='auto';changed=true}if(plan.type==='bankDeposit'&&plan.bankDepositRateMode!=='manual'){plan.annualReturn=bankDepositRate();plan.bankDepositRateInitialized=true;plan.bankDepositRateMode='auto';changed=true}});
    if(changed){save();if(screen===4)renderAdvanced()}
  }catch{
    // נשמרת הריבית האחרונה שנמשכה בהצלחה; 3.50% משמשת רק כשאין עדיין ערך שמור.
  }finally{clearTimeout(timer)}
}

function alignPlanGoalToCard(){
  const tools=document.querySelector('[data-screen="2"] .screen-head-tools');if(tools)tools.style.transform='none';
}

function clearAllPlans(){
  if(!confirm('למחוק את סכום היעד ואת כל התכניות שהוזנו ולהתחיל מחדש?'))return;
  state.requiredNet=0;
  state.expectedInflation=2.5;
  state.products=[make()];
  settings=clone(PRODUCT_TYPES);
  productStep=0;
  disclaimerAccepted=false;
  netInput.value='';
  $('#heroNet').textContent=fmt(0);
  save();
  go(1);
  updateFirstScreenReset();
  toast('הטופס נוקה ואפשר להתחיל מחדש');
}

function installFirstScreenReset(){
  const art=document.querySelector('.hero-art');
  if(!art||art.querySelector('.hero-reset'))return;
  const button=document.createElement('button');
  button.className='hero-reset';button.type='button';button.title='ניקוי הטופס';button.setAttribute('aria-label','ניקוי כל נתוני הטופס');
  button.innerHTML='<span aria-hidden="true">↻</span><small>ניקוי</small>';button.onclick=clearAllPlans;art.append(button);updateFirstScreenReset();
}
function updateFirstScreenReset(){const button=document.querySelector('.hero-reset');if(button)button.hidden=!(finiteNonNegative(state.requiredNet)>0||state.products.some(plan=>finiteNonNegative(plan.value)>0||finiteNonNegative(plan.cost)>0))}

function ensurePrecisionModal(){
  let modal=$('#planPrecisionModal');if(modal)return modal;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal precision-modal" id="planPrecisionModal" role="dialog" aria-modal="true" aria-labelledby="precisionTitle"><div class="modal-card"><button class="close" type="button">סגירה</button><span class="eyebrow">דיוק נתוני התכנית</span><h2 id="precisionTitle"></h2><p>הנתונים כאן זהים להתאמות המס והאינפלציה, ומתעדכנים מיד בחישוב.</p><div class="precision-grid"></div><div class="precision-actions"><button class="outline precision-cancel" type="button">ביטול</button><button class="cta precision-save" type="button">שמירת ההתאמות</button></div></div></div>`);
  modal=$('#planPrecisionModal');modal.querySelectorAll('.close,.precision-cancel').forEach(button=>button.onclick=()=>modal.classList.remove('open'));modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};return modal;
}

function openPrecisionModal(plan){
  const modal=ensurePrecisionModal(),defaults=settings[plan.type]||PRODUCT_TYPES.other,basis=plan.taxBasisOverride||defaults.taxBasis||'nominal';
  modal.querySelector('#precisionTitle').textContent=`התאמות מדויקות — ${defaults.label}`;
  const pensionFields=defaults.pensionEarlyWithdrawal?`<div class="pension-fields-title">חלוקת הכספים והמיסוי במשיכה מוקדמת</div><label>רכיב תגמולים (%)<input data-p="rewardsRatio" type="number" min="0" max="100" step="1" value="${finiteNonNegative(plan.rewardsRatio??.67)*100}"></label><label>רכיב פיצויים (%)<input data-p="severanceRatio" type="number" min="0" max="100" step="1" value="${finiteNonNegative(plan.severanceRatio??.33)*100}"></label><label>מס על רכיב התגמולים (%)<input data-p="rewardsTaxRate" type="number" min="0" max="100" step="1" value="${finiteNonNegative(plan.rewardsTaxRate??.35)*100}"></label><label class="check-field"><input data-p="severanceWithdrawable" type="checkbox" ${plan.severanceWithdrawable?'checked':''}><span>כספי הפיצויים זמינים למשיכה</span></label><div class="pension-legal-note"><b>חשוב לדעת לפני משיכה</b><p><strong>כספי תגמולים:</strong> משיכה מוקדמת לפני גיל פרישה חייבת בדרך כלל בניכוי מס הכנסה של 35% על כל הסכום הנמשך. משיכת הכספים, כולם או חלקם, תקטין בהתאמה את הקצבה הצפויה במועד הפרישה.</p><p><strong>כספי פיצויים:</strong> ברירת המחדל במחשבון היא שאינם זמינים למשיכה. ניתן למשוך בעת סיום עבודה ובכפוף לאישור המעסיק (טופס 161) או אישור פקיד שומה.</p><p><strong>חריגים:</strong> ניתן לבקש משיכה ללא הקנס במצבים מיוחדים, כגון נכות רפואית מעל 75% או הוצאות רפואיות חריגות, בכפוף לאישור פקיד שומה.</p><p><b>יש להתייעץ עם בעל רישיון לפני ביצוע פעולה כזאת.</b></p></div>`:'';
  const amendmentField=plan.type==='amendment190'?`<label class="wide-field">סכום שאינו זמין למשיכה הונית (₪)<input data-p="lockedAmount" type="number" min="0" step="1" value="${finiteNonNegative(plan.lockedAmount??AMENDMENT_190_LOCKED_2025)}"><small>ברירת המחדל לקצבה המזכה היא 38,412 ₪ (לפי תקרת שנת 2025), מחושב לפי הנחה כללית של הפקדה אחת בשנת 2025. יש להזין את הסכום המצטבר בפועל בהתאם לתקרה, לשנות ההפקדה ולאישור הקופה.</small></label>`:'';
  modal.querySelector('.precision-grid').innerHTML=`<label>בסיס המס<select data-p="taxBasisOverride"><option value="" ${!plan.taxBasisOverride?'selected':''}>אוטומטי</option><option value="real" ${plan.taxBasisOverride==='real'?'selected':''}>ריאלי</option><option value="nominal" ${plan.taxBasisOverride==='nominal'?'selected':''}>נומינלי</option><option value="exempt" ${plan.taxBasisOverride==='exempt'?'selected':''}>פטור</option></select></label><label>הצמדה מצטברת מאז הרכישה (%)<input data-p="cpiAdjustment" type="number" min="0" step=".1" value="${finiteNonNegative(plan.cpiAdjustment)*100}" ${basis!=='real'?'disabled':''}></label><label>תשואה שנתית צפויה (%)<input data-p="annualReturn" type="number" min="0" step=".01" value="${(finiteNonNegative(plan.annualReturn)*100).toFixed(2)}"></label><label>שנים קדימה<input data-p="years" type="number" min="0" step="1" value="${finiteNonNegative(plan.years)}"></label><label>שיעור המס לשימוש במקום ברירת המחדל (%)<input data-p="taxNowOverride" type="number" min="0" step=".1" value="${plan.taxNowOverride===''?'':finiteNonNegative(plan.taxNowOverride)*100}" placeholder="${defaults.taxNow*100}"><small>אם השדה ריק, החישוב משתמש בשיעור המס המוגדר לסוג התכנית.</small></label><label>כמה חשוב להשאיר את התכנית להמשך?<select data-p="wrapperOverride"><option value="0">ללא חשיבות מיוחדת</option><option value="0.05">חשוב לשמור להמשך</option><option value="0.15">חשוב מאוד לשמור</option><option value="0.25">עדיפות גבוהה להשאיר</option></select></label>${pensionFields}${amendmentField}`;
  modal.querySelector('[data-p="taxBasisOverride"] option[value=""]').textContent=basis==='real'?'ריאלי':basis==='exempt'?'פטור':'נומינלי';
  if(defaults.liquiditySetting)modal.querySelector('.precision-grid').insertAdjacentHTML('beforeend',`<label>האם הקרן נזילה?<select data-liquid><option value="true" ${plan.isLiquid!==false?'selected':''}>כן</option><option value="false" ${plan.isLiquid===false?'selected':''}>לא — 47% מס על מלוא המשיכה</option></select></label>`);
  const benefit=modal.querySelector('[data-p="wrapperOverride"]'),current=plan.wrapperOverride===''?defaults.wrapperCost:plan.wrapperOverride;benefit.value=current>=.2?'0.25':current>=.1?'0.15':current>.001?'0.05':'0';
  if(defaults.pensionEarlyWithdrawal){benefit.insertAdjacentHTML('beforeend','<option value="0.5">אסור לגעת!</option>');benefit.value=current>=.4?'0.5':benefit.value}
  const basisControl=modal.querySelector('[data-p="taxBasisOverride"]');basisControl.onchange=e=>{modal.querySelector('[data-p="cpiAdjustment"]').disabled=(e.target.value||defaults.taxBasis)!=='real'};
  if(defaults.pensionEarlyWithdrawal){basisControl.closest('label').remove();modal.querySelector('[data-p="cpiAdjustment"]').closest('label').remove()}
  modal.querySelector('.precision-save').onclick=()=>{modal.querySelectorAll('[data-p]').forEach(control=>{const key=control.dataset.p,value=control.value;if(key==='taxBasisOverride')plan[key]=value;else if(key==='severanceWithdrawable')plan[key]=control.checked;else if(key==='years'||key==='lockedAmount')plan[key]=finiteNonNegative(value);else plan[key]=value===''?'':finiteNonNegative(value)/100});const liquid=modal.querySelector('[data-liquid]');if(liquid)plan.isLiquid=liquid.value==='true';if(plan.type==='moneyFund')plan.moneyFundRateMode='manual';if(plan.type==='bankDeposit')plan.bankDepositRateMode='manual';save();modal.classList.remove('open');renderProducts();toast('ההתאמות נשמרו')};
  modal.classList.add('open');modal.querySelector('.close').focus();
}

function enhancePlanScreen(){
  const screen2=document.querySelector('[data-screen="2"]'),head=screen2?.querySelector('.screen-head'),root=$('#products');
  if(!screen2||!head||!root)return;
  let tools=head.querySelector('.screen-head-tools');
  if(!tools){
    tools=document.createElement('div');
    tools.className='screen-head-tools';
    head.append(tools);
  }
  const goal=screen2.querySelector('.step-goal-orb');
  if(goal&&goal.parentElement!==tools)tools.prepend(goal);
  if(!tools.querySelector('#clearPlanForm')){
    tools.insertAdjacentHTML('beforeend','<button id="clearPlanForm" class="clear-plan-form" type="button" title="ניקוי כל נתוני הטופס">↻ ניקוי הטופס</button>');
    tools.querySelector('#clearPlanForm').onclick=clearAllPlans;
  }
  alignPlanGoalToCard();
  if(!screen2.dataset.goalResizeBound){window.addEventListener('resize',alignPlanGoalToCard,{passive:true});screen2.dataset.goalResizeBound='1'}
  const ledger=root.querySelector('.product-ledger');
  if(!ledger)return;
  let scroll=ledger.querySelector('.ledger-scroll');
  if(!scroll){
    scroll=document.createElement('div');
    scroll.className='ledger-scroll';
    const total=ledger.querySelector('.product-ledger-total');
    ledger.querySelectorAll('.ledger-item,.ledger-empty').forEach(item=>scroll.append(item));
    ledger.insertBefore(scroll,total||null);
  }
  scroll.querySelectorAll('.ledger-item').forEach((item,i)=>{
    item.classList.toggle('active',i===productStep);
    item.tabIndex=0;
    item.setAttribute('role','button');
    item.setAttribute('aria-label',`מעבר לתכנית ${i+1}`);
    const open=()=>{productStep=i;renderProducts();setTimeout(()=>$('#products [data-k="type"]')?.focus(),0)};
    item.onclick=open;
    item.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
  });
  scroll.querySelector('.ledger-item.active')?.scrollIntoView({block:'nearest'});
  const syncLedgerAmounts=()=>{
    const active=scroll.querySelectorAll('.ledger-item')[productStep]?.querySelector('b');
    if(active)active.textContent=fmt(state.products[productStep]?.value);
    const total=ledger.querySelector('.product-ledger-total b');
    if(total)total.textContent=fmt(state.products.reduce((sum,plan)=>sum+finiteNonNegative(plan.value),0));
  };
  const plan=state.products[productStep];
  const ledgerTitle=root.querySelector('.product-ledger h3');if(ledgerTitle)ledgerTitle.textContent='שווי התכניות שהוזנו';
  const productGrid=root.querySelector('.product-grid');
  if(plan&&productGrid&&!productGrid.querySelector('.precision-trigger')){const precision=document.createElement('button');precision.className='precision-trigger';precision.type='button';precision.title='דיוק נתוני התכנית';precision.setAttribute('aria-label','פתיחת התאמות מס ואינפלציה לתכנית');precision.innerHTML='<span aria-hidden="true">⚙</span>';precision.onclick=()=>openPrecisionModal(plan);productGrid.children[0]?.after(precision)}
  if(productGrid&&!productGrid.querySelector('.delete-slot')){
    const slot=document.createElement('div');slot.className='delete-slot';
    const remove=root.querySelector('.product-head [data-remove]');
    if(remove){remove.innerHTML='🗑️';remove.title='מחיקת תכנית';remove.setAttribute('aria-label','מחיקת תכנית');remove.tabIndex=-1;slot.append(remove)}else{slot.classList.add('empty');slot.setAttribute('aria-hidden','true')}
    productGrid.append(slot);
  }
  root.querySelector('.product-head')?.classList.add('fields-actions-moved');
  if(plan&&settings[plan.type]?.pensionEarlyWithdrawal){plan.rewardsRatio=plan.rewardsRatio??.67;plan.severanceRatio=plan.severanceRatio??.33;plan.rewardsTaxRate=plan.rewardsTaxRate??.35;plan.severanceTaxRate=plan.severanceTaxRate??0;plan.severanceWithdrawable=plan.severanceWithdrawable===true;if(!plan.pensionReturnInitialized){plan.annualReturn=.0374;plan.pensionReturnInitialized=true;save()}}
  if(plan?.type==='amendment190'&&plan.lockedAmount==null){plan.lockedAmount=AMENDMENT_190_LOCKED_2025;save()}
  if(plan?.type==='amendment190'&&!plan.amendmentReturnInitialized){plan.annualReturn=.07;plan.amendmentReturnInitialized=true;save()}
  if(plan?.type==='moneyFund'&&plan.moneyFundRateMode!=='manual'){
    plan.annualReturn=bankOfIsraelRate;
    plan.moneyFundRateInitialized=true;
    plan.moneyFundRateMode='auto';
    save();
  }
  if(plan?.type==='bankDeposit'&&plan.bankDepositRateMode!=='manual'){plan.annualReturn=bankDepositRate();plan.bankDepositRateInitialized=true;plan.bankDepositRateMode='auto';save()}
  const typeInput=root.querySelector('[data-k="type"]');
  const mobileFlow=matchMedia('(max-width:1100px)').matches;
  const applyPlanType=(selected,advance=false)=>{
    if(!selected)return false;
    plan.type=selected;
    if(settings[plan.type]?.noCost)plan.cost=plan.value;
    if(plan.type==='moneyFund'){
      plan.annualReturn=bankOfIsraelRate;
      plan.moneyFundRateInitialized=true;
      plan.moneyFundRateMode='auto';
    }
    if(plan.type==='bankDeposit'){plan.annualReturn=bankDepositRate();plan.bankDepositRateInitialized=true;plan.bankDepositRateMode='auto'}
    if(plan.type==='amendment190'&&plan.lockedAmount==null)plan.lockedAmount=AMENDMENT_190_LOCKED_2025;
    if(plan.type==='amendment190'){plan.annualReturn=.07;plan.amendmentReturnInitialized=true}
    if(plan.type==='education')plan.isLiquid=true;
    if(settings[plan.type]?.pensionEarlyWithdrawal){plan.rewardsRatio=.67;plan.severanceRatio=.33;plan.rewardsTaxRate=.35;plan.severanceTaxRate=0;plan.severanceWithdrawable=false;plan.annualReturn=.0374;plan.pensionReturnInitialized=true}
    save();
    if(advance||!mobileFlow){mobileProductField=1;renderProducts();setTimeout(()=>$('#products [data-k="value"]')?.focus(),80)}
    return true;
  };
  if(typeInput){const rememberType=e=>applyPlanType(e.target.value,false);typeInput.oninput=rememberType;typeInput.onchange=rememberType}
  root.querySelectorAll('[data-k="value"],[data-k="cost"]').forEach(input=>{
    const key=input.dataset.k;
    input.value=finiteNonNegative(plan[key])?formatInput(plan[key]):'';
    input.placeholder='הזינו סכום';
    input.oninput=e=>{
      const raw=e.target.value.replace(/[^0-9]/g,'').slice(0,11);
      const parsed=Math.min(MAX_WITHDRAWAL,finiteNonNegative(raw));
      plan[key]=parsed;
      if(key==='value'&&settings[plan.type]?.noCost)plan.cost=parsed;
      save();
      syncLedgerAmounts();
      const note=root.querySelector('.locked-amount-note b');
      if(note)note.textContent=fmt(Math.min(finiteNonNegative(plan.value),finiteNonNegative(plan.lockedAmount)));
    };
    input.onblur=e=>{e.target.value=finiteNonNegative(plan[key])?formatInput(plan[key]):''};
  });
  const nav=root.querySelector('.product-nav'),productCard=root.querySelector('.product-card');
  if(plan?.type==='amendment190'&&productCard&&!productCard.querySelector('.locked-amount-note')){
    const locked=Math.min(finiteNonNegative(plan.value),finiteNonNegative(plan.lockedAmount));
    productCard.insertAdjacentHTML('beforeend',`<div class="locked-amount-note"><span>לא זמין למשיכה הונית בסימולציה</span><b>${fmt(locked)}</b><small>ברירת המחדל לקצבה המזכה היא 38,412 ₪ (לפי תקרת שנת 2025), מחושב לפי הנחה כללית של הפקדה אחת בשנת 2025. ניתן לדייק במסך ההתאמות.</small></div>`);
    productCard.classList.add('has-locked-amount');
  }
  if(nav&&productCard&&!productCard.querySelector('.card-inline-actions')){
    const inline=document.createElement('div');
    inline.className='card-inline-actions';
    const next=nav.querySelector('#nextProduct'),show=nav.querySelector('#showPlanNow'),prev=nav.querySelector('#prevProduct');
    if(next){const addHandler=next.onclick;next.onclick=event=>{addHandler?.call(next,event);setTimeout(()=>$('#products [data-k="type"]')?.focus(),0)};inline.append(next)}if(show)inline.append(show);if(prev)inline.append(prev);
    productCard.append(inline);
    nav.classList.add('plan-only-nav');
  }
  if(matchMedia('(max-width:1100px)').matches&&productCard&&productGrid){
    const fields=[productGrid.querySelector('[data-k="type"]')?.closest('label'),productGrid.querySelector('[data-k="value"]')?.closest('label'),productGrid.querySelector('[data-k="cost"]')?.closest('label')];
    const hasCost=!settings[plan.type]?.noCost;
    if(!hasCost&&mobileProductField>1)mobileProductField=1;
    fields.forEach((field,index)=>{if(field){field.classList.add('mobile-field');field.classList.toggle('mobile-field-active',index===mobileProductField)}});
    productGrid.dataset.mobileStep=String(mobileProductField);
    let selectedType=productCard.querySelector('.mobile-selected-type');
    if(mobileProductField>0&&plan.type){
      if(!selectedType){selectedType=document.createElement('div');selectedType.className='mobile-selected-type';productCard.prepend(selectedType)}
      selectedType.innerHTML=`<small>סוג התכנית שנבחר</small><strong>${esc((settings[plan.type]||PRODUCT_TYPES.other).label)}</strong>`;
    }else selectedType?.remove();
    let mobileNav=productCard.querySelector('.mobile-field-nav');
    if(!mobileNav){mobileNav=document.createElement('div');mobileNav.className='mobile-field-nav';productGrid.after(mobileNav)}
    const goBack=()=>{if(mobileProductField>0){mobileProductField--;renderProducts()}else go(1)};
    const goForward=()=>{mobileProductField=Math.min(hasCost?2:1,mobileProductField+1);renderProducts();setTimeout(()=>root.querySelector(mobileProductField===1?'[data-k="value"]':'[data-k="cost"]')?.focus(),80)};
    if(mobileProductField===0){
      mobileNav.innerHTML='<button class="outline mobile-back" type="button">חזרה</button><button class="cta mobile-type-next" type="button">המשך <span>←</span></button><small>בחרו סוג תכנית ולחצו על המשך</small>';
      mobileNav.querySelector('.mobile-back').onclick=goBack;
      mobileNav.querySelector('.mobile-type-next').onclick=()=>{const select=root.querySelector('[data-k="type"]');if(!select?.value){toast('יש לבחור סוג תכנית');select?.focus();return}applyPlanType(select.value,true)};
    }else if(mobileProductField===1&&hasCost){
      mobileNav.innerHTML='<button class="outline mobile-back" type="button">חזור</button><button class="cta mobile-forward" type="button">התקדם <span>←</span></button>';
      mobileNav.querySelector('.mobile-back').onclick=goBack;mobileNav.querySelector('.mobile-forward').onclick=goForward;
    }else{
      mobileNav.innerHTML='<button class="outline mobile-back" type="button">חזור</button><button class="outline mobile-add" type="button">＋ הוספת תכנית</button><button class="cta mobile-show" type="button">הצגת תכנית המשיכה <span>←</span></button>';
      mobileNav.querySelector('.mobile-back').onclick=goBack;
      mobileNav.querySelector('.mobile-add').onclick=()=>{state.products.push(make());productStep=state.products.length-1;mobileProductField=0;save();renderProducts()};
      mobileNav.querySelector('.mobile-show').onclick=()=>go(3);
    }
    productCard.classList.add('mobile-wizard-card');
    productCard.querySelector('.card-inline-actions')?.classList.add('desktop-product-actions');
    let summary=root.querySelector('.mobile-plan-summary');
    if(!summary){summary=document.createElement('div');summary.className='mobile-plan-summary';root.append(summary)}
    summary.innerHTML=`<span><small>שווי התכניות שהוזנו</small><b>${fmt(state.products.reduce((sum,item)=>sum+finiteNonNegative(item.value),0))}</b></span><span><small>היעד המבוקש</small><b>${fmt(state.requiredNet)}</b></span><button class="mobile-reset-small" type="button" aria-label="איפוס וניקוי הטופס">↻ איפוס</button>`;
    summary.querySelector('.mobile-reset-small').onclick=clearAllPlans;
  }else root.querySelector('.mobile-plan-summary')?.remove();
  syncLedgerAmounts();updateFirstScreenReset();
}

const finalRenderProducts=renderProducts;
function renderMobileProductsRebuilt(){
  const root=$('#products');
  if(!state.products.length)state.products.push(make());
  productStep=Math.max(0,Math.min(productStep,state.products.length-1));
  const plan=state.products[productStep];
  if(!plan.type)mobileProductField=0;
  const defaults=settings[plan.type]||PRODUCT_TYPES.other;
  const hasCost=!defaults.noCost;
  if(!hasCost&&mobileProductField>1)mobileProductField=1;
  const total=state.products.reduce((sum,item)=>sum+finiteNonNegative(item.value),0);
  const selectedType=mobileProductField>0&&plan.type?`<div class="m2-selected"><small>סוג התכנית שנבחר</small><strong>${esc(defaults.label)}</strong></div>`:'';
  const settingsButton=plan.type?`<button class="m2-settings" type="button" aria-label="הגדרות התכנית" title="הגדרות התכנית">⚙</button>`:'';
  let field='';
  if(mobileProductField===0)field=`<label class="m2-field">סוג התכנית<select id="m2Type">${typeOptions(plan.type)}</select></label>`;
  if(mobileProductField===1)field=`<label class="m2-field">שווי נוכחי (₪)<input id="m2Value" type="text" inputmode="numeric" placeholder="הזינו סכום" value="${finiteNonNegative(plan.value)?formatInput(plan.value):''}"></label>`;
  if(mobileProductField===2)field=`<label class="m2-field">עלות ממוצעת / הפקדות (₪)<input id="m2Cost" type="text" inputmode="numeric" placeholder="הזינו סכום" value="${finiteNonNegative(plan.cost)?formatInput(plan.cost):''}"></label>`;
  let actions='';
  if(mobileProductField===0)actions='<button class="outline" id="m2Back" type="button">חזרה</button><button class="cta" id="m2Continue" type="button">המשך <span>←</span></button><small>בחרו סוג תכנית ולחצו על המשך</small>';
  else if(mobileProductField===1&&hasCost)actions='<button class="outline" id="m2Back" type="button">חזור</button><button class="cta" id="m2Continue" type="button">התקדם <span>←</span></button>';
  else actions='<button class="outline" id="m2Back" type="button">חזור</button><button class="outline" id="m2Add" type="button">＋ הוספת תכנית</button><button class="cta" id="m2Show" type="button">הצגת תכנית המשיכה <span>←</span></button>';
  root.className='products m2-products';
  root.innerHTML=`<article class="m2-card">${selectedType}<div class="m2-input-row">${field}${settingsButton}</div><div class="m2-actions">${actions}</div></article><div class="m2-bottom"><span><small>שווי התכניות שהוזנו</small><b data-m2-total>${fmt(total)}</b></span><span><small>היעד המבוקש</small><b>${fmt(state.requiredNet)}</b></span><button id="m2Reset" type="button" aria-label="איפוס וניקוי הטופס">↻ איפוס</button></div>`;
  const storeType=selected=>{if(!selected)return false;plan.type=selected;const d=settings[selected]||PRODUCT_TYPES.other;if(d.noCost)plan.cost=plan.value;if(selected==='moneyFund'){plan.annualReturn=bankOfIsraelRate;plan.moneyFundRateMode='auto'}if(selected==='bankDeposit'){plan.annualReturn=bankDepositRate();plan.bankDepositRateMode='auto'}if(selected==='amendment190'){plan.lockedAmount=plan.lockedAmount??AMENDMENT_190_LOCKED_2025;plan.annualReturn=.07}if(d.pensionEarlyWithdrawal){plan.rewardsRatio=.67;plan.severanceRatio=.33;plan.rewardsTaxRate=.35;plan.severanceTaxRate=0;plan.severanceWithdrawable=false;plan.annualReturn=.0374}save();return true};
  const type=root.querySelector('#m2Type');if(type)type.onchange=()=>storeType(type.value);
  const moneyInput=root.querySelector('#m2Value,#m2Cost');if(moneyInput){const key=moneyInput.id==='m2Value'?'value':'cost';moneyInput.oninput=()=>{plan[key]=Math.min(MAX_WITHDRAWAL,finiteNonNegative(moneyInput.value.replace(/[^0-9]/g,'')));if(key==='value'&&(settings[plan.type]||{}).noCost)plan.cost=plan.value;save();root.querySelector('[data-m2-total]').textContent=fmt(state.products.reduce((sum,item)=>sum+finiteNonNegative(item.value),0))};moneyInput.onblur=()=>{moneyInput.value=finiteNonNegative(plan[key])?formatInput(plan[key]):''}};
  root.querySelector('.m2-settings')?.addEventListener('click',()=>openPrecisionModal(plan));
  root.querySelector('#m2Back').onclick=()=>{if(mobileProductField===0)go(1);else{mobileProductField--;renderProducts()}};
  root.querySelector('#m2Continue')?.addEventListener('click',()=>{if(mobileProductField===0){if(!storeType(type?.value)){toast('יש לבחור סוג תכנית');type?.focus();return}mobileProductField=1}else{if(finiteNonNegative(plan.value)<=0){toast('יש להזין שווי נוכחי');moneyInput?.focus();return}mobileProductField=2}renderProducts();setTimeout(()=>root.querySelector(mobileProductField===1?'#m2Value':'#m2Cost')?.focus(),80)});
  root.querySelector('#m2Add')?.addEventListener('click',()=>{if(finiteNonNegative(plan.value)<=0){toast('יש להזין שווי נוכחי');return}state.products.push(make());productStep=state.products.length-1;mobileProductField=0;save();renderProducts()});
  root.querySelector('#m2Show')?.addEventListener('click',()=>go(3));
  root.querySelector('#m2Reset').onclick=clearAllPlans;
  updateFirstScreenReset();
}
renderProducts=function(){if(matchMedia('(max-width:1100px)').matches)renderMobileProductsRebuilt();else{finalRenderProducts();enhancePlanScreen()}};

function ensurePlanDetailsModal(){
  let modal=$('#planDetailsModal');if(modal)return modal;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal plan-details-modal" id="planDetailsModal" role="dialog" aria-modal="true" aria-labelledby="planDetailsTitle"><div class="modal-card"><button class="close" type="button">סגירה</button><span class="eyebrow">פירוט התכנית והחישוב</span><h2 id="planDetailsTitle"></h2><div class="plan-details-content"></div></div></div>`);
  modal=$('#planDetailsModal');modal.querySelector('.close').onclick=()=>modal.classList.remove('open');modal.onclick=event=>{if(event.target===modal)modal.classList.remove('open')};return modal;
}

function detailItem(label,value,note=''){return`<div class="detail-item"><small>${label}</small><strong>${value}</strong>${note?`<span>${note}</span>`:''}</div>`}
function openPlanDetails(row){
  const modal=ensurePlanDetailsModal(),defaults=settings[row.type]||PRODUCT_TYPES.other,source=state.products.find(plan=>plan.id===row.id)||row,nominalFuture=row.value*row.nominalGrowthFactor,futureAfterTax=row.value*row.realGrowthFactorAfterTax,nominalGain=Math.max(0,row.value-row.cost),nominalGainRate=row.cost>0?Math.max(0,(row.value-row.cost)/row.cost):0;
  const basisLabel=row.taxBasis==='real'?'ריאלי':row.taxBasis==='exempt'?'פטור':'נומינלי';
  const pensionDetails=defaults.pensionEarlyWithdrawal?`<section><h3>חלוקת הכספים הפנסיוניים</h3><div class="details-grid">${detailItem('רכיב תגמולים',`${(row.rewardsRatio*100).toFixed(0)}% · ${fmt(row.value*row.rewardsRatio)}`)}${detailItem('מס על תגמולים',`${(row.rewardsTaxRate*100).toFixed(1)}%`)}${detailItem('רכיב פיצויים',`${(row.severanceRatio*100).toFixed(0)}% · ${fmt(row.value*row.severanceRatio)}`)}${detailItem('פיצויים זמינים למשיכה',row.severanceWithdrawable?'כן':'לא',row.severanceWithdrawable?'המשיכה מחושבת באופן יחסי בין הרכיבים.':'רק רכיב התגמולים נכלל בסכום הזמין למשיכה.')}</div></section>`:'';
  const specialDetails=row.type==='education'?detailItem('נזילות הקרן',row.isLiquid===false?'לא — מס 47% על מלוא המשיכה':'כן'):row.type==='amendment190'?detailItem('סכום שאינו זמין למשיכה הונית',fmt(row.lockedAmount||0)):'';
  modal.querySelector('#planDetailsTitle').textContent=defaults.label;
  modal.querySelector('.plan-details-content').innerHTML=`<section><h3>הנתונים שהוזנו</h3><div class="details-grid">${detailItem('שווי נוכחי',fmt(row.value))}${detailItem('עלות ממוצעת / הפקדות',fmt(row.cost))}${detailItem('בסיס המס',basisLabel)}${detailItem('הצמדה מצטברת',`${(row.cpiAdjustment*100).toFixed(1)}%`)}${detailItem('תשואה שנתית צפויה',`${(row.annualReturn*100).toFixed(2)}%`)}${detailItem('תקופת החישוב',`${row.years} שנים`)}${specialDetails}</div></section>${pensionDetails}<section><h3>פירוט חישוב המס במשיכה</h3><div class="details-grid">${detailItem('סכום למשיכה',fmt(row.gross))}${detailItem('רווח חייב בתוך המשיכה',fmt(row.gainComponent),`שיעור הרווח בתכנית: ${(row.gainRatio*100).toFixed(2)}%`)}${detailItem('שיעור המס האפקטיבי מהמשיכה',`${(row.taxPerGross*100).toFixed(2)}%`,defaults.pensionEarlyWithdrawal?'מחושב לפי זמינות וחלוקת תגמולים ופיצויים.':`שיעור המס שהוגדר: ${(row.taxNow*100).toFixed(2)}%`)}${detailItem('מס משוער',fmt(row.tax))}${detailItem('נטו לאחר מס',fmt(row.net))}${detailItem('יתרה לאחר המשיכה',fmt(row.remainingValue))}</div><div class="calculation-line"><b>נוסחת הנטו:</b><span dir="ltr">${fmt(row.gross)} − ${fmt(row.tax)} = ${fmt(row.net)}</span></div></section><section><h3>תחזית תשואה ורווח</h3><div class="details-grid">${detailItem('מקדם צמיחה ריאלי לאחר מס',`${row.realGrowthFactorAfterTax.toFixed(3)}×`)}${detailItem('שווי עתידי נומינלי לפני מס',fmt(nominalFuture),`${(row.annualReturn*100).toFixed(2)}% לשנה במשך ${row.years} שנים`)}${detailItem('שווי עתידי ריאלי לאחר מס',fmt(futureAfterTax),`לאחר מס עתידי של ${(row.taxFuture*100).toFixed(2)}% והתאמת אינפלציה של ${(row.expectedInflation*100).toFixed(2)}% לשנה`)}${detailItem('תוספת שווי עתידית נטו וריאלית לכל 1 ₪ נטו שנמשך',`${(row.futureOpportunityCostPerNet*100).toFixed(1)}%`)}</div><div class="detail-disclaimer">כל מדדי ההשוואה העתידיים מוצגים בערכים ריאליים ולאחר המס העתידי שהוגדר, כדי לאפשר השוואה אחידה בין תכניות במיסוי ריאלי, נומינלי או פטור. התחזית אינה הבטחת תשואה.</div></section>`;
  const taxSection=[...modal.querySelectorAll('.plan-details-content section')].find(section=>section.querySelector('h3')?.textContent==='פירוט חישוב המס במשיכה'),calculation=taxSection?.querySelector('.calculation-line');
  if(taxSection&&row.taxBasis==='real'){
    const noRealGain=row.gain<=.005;
    const taxableGainItem=[...taxSection.querySelectorAll('.detail-item')].find(item=>item.querySelector('small')?.textContent==='רווח חייב בתוך המשיכה'),gainRateNote=taxableGainItem?.querySelector('span');if(gainRateNote)gainRateNote.textContent=`שיעור הרווח הריאלי בתכנית: ${(row.gainRatio*100).toFixed(2)}%`;
    taxSection.querySelector('.details-grid').insertAdjacentHTML('afterend',`<div class="inflation-tax-explanation ${noRealGain?'no-tax':''}"><b>${noRealGain?'למה לא מחושב מס במקרה הזה?':'כך האינפלציה משפיעה על המס'}</b><p>במס ריאלי מצמידים תחילה את העלות למדד: <span dir="ltr">${fmt(row.cost)} × (1 + ${(row.cpiAdjustment*100).toFixed(1)}%) = ${fmt(row.indexedCost)}</span>.</p><p>${noRealGain?`השווי הנוכחי, ${fmt(row.value)}, אינו גבוה מהעלות המתואמת למדד, ${fmt(row.indexedCost)}. לכן שיעור הרווח הריאלי בתכנית הוא <strong>0.00%</strong>, אין רווח ריאלי חייב במס והמס המשוער הוא 0 ₪.`:`הרווח הריאלי החייב הוא השווי פחות העלות המתואמת למדד: ${fmt(row.value)} פחות ${fmt(row.indexedCost)} = ${fmt(row.gain)}. שיעור הרווח הריאלי בתכנית הוא <strong>${(row.gainRatio*100).toFixed(2)}%</strong>.`}</p></div>`);
  }
  if(taxSection&&row.taxBasis==='nominal'){
    const costComponent=Math.max(0,row.gross-row.gainComponent);
    taxSection.querySelector('.details-grid').insertAdjacentHTML('afterend',`<div class="inflation-tax-explanation"><b>כך חושב המס היחסי</b><p>בתכנית כולה הרווח הנומינלי הוא ${fmt(row.gain)}, שהם ${(row.gainRatio*100).toFixed(2)}% מהשווי. לכן גם במשיכה חלקית רק אותו שיעור מיוחס לרווח.</p><p>מתוך משיכה של ${fmt(row.gross)}, ${fmt(costComponent)} מיוחסים לעלות ואינם מחויבים במס, ו־${fmt(row.gainComponent)} מיוחסים לרווח. המס מחושב רק על הרווח: <span dir="ltr">${fmt(row.gainComponent)} × ${(row.taxNow*100).toFixed(2)}% = ${fmt(row.tax)}</span>.</p></div>`);
  }
  if(calculation)calculation.innerHTML=`<b>כך מתקבל הנטו</b><div><span>סכום למשיכה</span><strong>${fmt(row.gross)}</strong></div><i>פחות</i><div><span>מס משוער</span><strong>${fmt(row.tax)}</strong></div><i>שווה</i><div class="net-result"><span>נטו שמתקבל</span><strong>${fmt(row.net)}</strong></div>`;
  const returnItem=[...modal.querySelectorAll('.detail-item')].find(item=>item.querySelector('small')?.textContent==='תשואה שנתית צפויה');if(returnItem){const enteredReturn=finiteNonNegative(source.annualReturn),realAnnualReturn=(1+enteredReturn)/(1+row.expectedInflation)-1;returnItem.querySelector('small').textContent='תשואה שנתית שהוזנה';returnItem.querySelector('strong').textContent=`${(enteredReturn*100).toFixed(2)}%`;returnItem.insertAdjacentHTML('beforeend',`<span>תשואה שנתית ריאלית לאחר התאמת אינפלציה: ${(realAnnualReturn*100).toFixed(2)}%</span>`)}
  const enteredGrid=modal.querySelector('.plan-details-content section .details-grid');if(enteredGrid){enteredGrid.insertAdjacentHTML('beforeend',`${detailItem('רווח נומינלי',fmt(nominalGain))}${detailItem('תשואה נומינלית',`${(nominalGainRate*100).toFixed(2)}%`,'מחושבת כרווח הנומינלי חלקי העלות המקורית.')}`);const items=[...enteredGrid.querySelectorAll('.detail-item')],basisItem=items.find(item=>item.querySelector('small')?.textContent==='בסיס המס'),nominalGainItem=items.find(item=>item.querySelector('small')?.textContent==='רווח נומינלי');if(basisItem&&nominalGainItem){const marker=document.createComment('swap');basisItem.before(marker);nominalGainItem.before(basisItem);marker.replaceWith(nominalGainItem)}}
  const forecastSection=[...modal.querySelectorAll('.plan-details-content section')].find(section=>section.querySelector('h3')?.textContent==='תחזית תשואה ורווח'),forecastGrid=forecastSection?.querySelector('.details-grid'),periodItem=[...modal.querySelectorAll('.detail-item')].find(item=>item.querySelector('small')?.textContent==='תקופת החישוב');if(forecastGrid){if(periodItem)forecastGrid.prepend(periodItem);if(returnItem)forecastGrid.prepend(returnItem)}
  if(forecastGrid){const growthItem=[...forecastGrid.querySelectorAll('.detail-item')].find(item=>item.querySelector('small')?.textContent==='מקדם צמיחה ריאלי לאחר מס'),futurePerShekelItem=[...forecastGrid.querySelectorAll('.detail-item')].find(item=>item.querySelector('small')?.textContent==='תוספת שווי עתידית נטו וריאלית לכל 1 ₪ נטו שנמשך');if(growthItem)growthItem.insertAdjacentHTML('beforeend',`<span>זהו מקדם צמיחה ריאלי לאחר מס: תחילה מחשבים צמיחה נומינלית, מפחיתים את המס העתידי לפי בסיס המס של התכנית, ואז מנטרלים את האינפלציה. לכן כל 1 ₪ בתכנית שווה בסוף התקופה לכ־${row.realGrowthFactorAfterTax.toFixed(3)} ₪ במונחי כוח הקנייה של היום.</span>`);if(futurePerShekelItem)futurePerShekelItem.insertAdjacentHTML('beforeend',`<span>האומדן לכמה ערך נטו וריאלי נוסף היה נשאר בעתיד אילו הסכום הדרוש למשיכה נשאר מושקע. לדוגמה, ${(row.futureOpportunityCostPerNet*100).toFixed(1)}% פירושם תוספת משוערת של ${row.futureOpportunityCostPerNet.toFixed(2)} ₪ בכוח הקנייה של היום לכל 1 ₪ נטו שנמשך היום.</span>`)}
  modal.classList.add('open');modal.querySelector('.close').focus();
}

function enhancePriorityTable(){
  const zone=$('#results');
  const statusMessage=zone?.querySelector('#statusMessage');if(statusMessage)statusMessage.replaceChildren();
  zone?.querySelector('.priority-heading')?.remove();
  zone?.querySelector('.summary-card.net-target')?.remove();
  zone?.querySelector('#summaryCards')?.classList.add('without-net-target');
  zone?.querySelectorAll('#summaryCards small').forEach(label=>{if(label.textContent.trim()==='חוסר')label.textContent='חוסר להשלמת היעד'});
  zone?.querySelectorAll('#summaryCards small').forEach(label=>{if(label.textContent.trim()==='סכום משיכה מומלץ')label.textContent='סכום למשיכה'});
  zone?.querySelectorAll('.result-panel thead th').forEach(label=>{if(label.textContent.trim()==='סכום משיכה מומלץ')label.textContent='סכום למשיכה'});
  const priorityExplanation=zone?.querySelector('.plain-note span');if(priorityExplanation)priorityExplanation.textContent=priorityExplanation.textContent.replace(/^תכנית מקבל/,'מוצר מקבל');
  let tools=zone?.querySelector('.results-head-tools');
  if(zone&&!tools){
    tools=document.createElement('div');
    tools.className='screen-head-tools results-head-tools';
    tools.innerHTML=`<div class="step-goal-orb result-goal-orb"><small>סכום היעד</small><strong>${fmt(state.requiredNet)}</strong><small>נטו</small></div><button class="clear-plan-form" type="button" title="ניקוי כל נתוני הטופס">↻ ניקוי הטופס</button>`;
    zone.querySelector('.screen-head').append(tools);
    tools.querySelector('button').onclick=clearAllPlans;
  }
  tools?.querySelector('.step-goal-orb strong')?.replaceChildren(document.createTextNode(fmt(state.requiredNet)));
  const firstHeader=zone?.querySelector('.result-panel thead th:first-child');
  if(firstHeader)firstHeader.textContent='עדיפות משיכה';
  zone?.querySelector('.result-panel thead [data-future]')?.remove();
  zone?.querySelectorAll('.future-cost').forEach(cell=>cell.remove());
  zone?.querySelector('[data-future-foot]')?.remove();
  const mobileLabels=[...zone.querySelectorAll('.result-panel thead th')].map(header=>header.textContent.trim());
  $$('#resultsBody tr').forEach((row,i)=>{
    const cell=row.firstElementChild;
    if(cell){cell.className='priority-cell';cell.innerHTML=`<span class="priority-number">${i+1}</span>`}
    const resultRow=result().rows[i],reason=row.lastElementChild;
    if(resultRow){row.classList.add('clickable-result');row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label',`פתיחת פירוט החישוב עבור ${(settings[resultRow.type]||PRODUCT_TYPES.other).label}`);const open=()=>openPlanDetails(resultRow);row.onclick=open;row.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}}}
    if(resultRow&&reason&&!reason.querySelector('.future-impact')){const futureRate=Math.max(0,resultRow.futureOpportunityCostPerNet||0),futureLoss=futureRate*Math.max(0,resultRow.net);reason.insertAdjacentHTML('beforeend',`<div class="future-impact"><div><span>תוספת שווי עתידית נטו שלא תישאר בתכנית</span><b>${fmt(futureLoss)} · ${(futureRate*100).toFixed(1)}%</b><i style="--bar:${Math.min(100,Math.max(futureLoss?4:0,futureRate*100))}%"></i></div><small class="future-impact-explain">אומדן לתוספת הצמיחה נטו שהכסף היה יכול לצבור עד סוף התקופה שהוגדרה אילו נשאר מושקע, לאחר המס העתידי שהוגדר.</small></div>`)}
    [...row.children].forEach((cell,index)=>cell.dataset.label=mobileLabels[index]||'');
  });
  zone?.querySelectorAll('.amount').forEach(cell=>{const number=cell.textContent.trim().replace(/[^0-9.,-]/g,'').trim();if(number)cell.innerHTML=`<span class="table-money"><span class="shekel">₪</span><span>${number}</span></span>`});
}

const finalRenderResults=renderResults;
renderResults=function(){finalRenderResults();enhancePriorityTable()};

const finalRenderAdvanced=renderAdvanced;
renderAdvanced=function(){
  finalRenderAdvanced();
  $$('.advanced-card').forEach(card=>{
    const plan=state.products.find(item=>item.id===card.dataset.id);
    if(!plan)return;
    const basisSelect=card.querySelector('[data-k="taxBasisOverride"]');if(basisSelect){const basis=plan.taxBasisOverride||settings[plan.type]?.taxBasis||'nominal',defaultOption=basisSelect.querySelector('option[value=""]');if(defaultOption)defaultOption.textContent=basis==='real'?'ריאלי':basis==='exempt'?'פטור':'נומינלי'}
    if(settings[plan.type]?.pensionEarlyWithdrawal){card.querySelector('[data-k="taxBasisOverride"]')?.closest('label')?.remove();card.querySelector('[data-k="cpiAdjustment"]')?.closest('label')?.remove();const annual=card.querySelector('[data-k="annualReturn"]');if(annual&&!plan.pensionReturnInitialized){plan.annualReturn=.0374;plan.pensionReturnInitialized=true;annual.value='3.74';save()}}
    if(settings[plan.type]?.pensionEarlyWithdrawal&&!card.querySelector('[data-k="rewardsRatio"]')){const grid=card.querySelector('.advanced-grid');grid.insertAdjacentHTML('beforeend',`<label>רכיב תגמולים (%)<input data-k="rewardsRatio" type="number" min="0" max="100" value="${finiteNonNegative(plan.rewardsRatio??.67)*100}"></label><label>רכיב פיצויים (%)<input data-k="severanceRatio" type="number" min="0" max="100" value="${finiteNonNegative(plan.severanceRatio??.33)*100}"></label><label>מס על התגמולים (%)<input data-k="rewardsTaxRate" type="number" min="0" max="100" value="${finiteNonNegative(plan.rewardsTaxRate??.35)*100}"></label><label class="advanced-check"><span>האם כספי הפיצויים זמינים למשיכה?</span><input data-k="severanceWithdrawable" type="checkbox" ${plan.severanceWithdrawable?'checked':''}><small class="simple-help">אם כן, המשיכה מחושבת יחסית: 67% תגמולים במס 35% ו־33% פיצויים בשיעור המס שהוגדר.</small></label>`)}
    const benefitSelect=card.querySelector('.benefit-select');if(settings[plan.type]?.pensionEarlyWithdrawal&&benefitSelect&&!benefitSelect.querySelector('option[value="0.5"]')){benefitSelect.insertAdjacentHTML('beforeend','<option value="0.5">אסור לגעת!</option>');const currentBenefit=plan.wrapperOverride===''?settings[plan.type].wrapperCost:plan.wrapperOverride;benefitSelect.value=currentBenefit>=.4?'0.5':benefitSelect.value;benefitSelect.onchange=()=>{plan.wrapperOverride=Number(benefitSelect.value);save()}}
    if(settings[plan.type]?.liquiditySetting&&!card.querySelector('[data-k="isLiquid"]'))card.querySelector('.advanced-grid').insertAdjacentHTML('beforeend',`<label>האם הקרן נזילה?<select data-k="isLiquid"><option value="true" ${plan.isLiquid!==false?'selected':''}>כן</option><option value="false" ${plan.isLiquid===false?'selected':''}>לא — 47% מס על מלוא המשיכה</option></select></label>`);
    const overrideInput=card.querySelector('[data-k="taxNowOverride"]'),overrideLabel=overrideInput?.closest('label');if(overrideLabel){overrideLabel.childNodes[0].textContent='שיעור המס לשימוש במקום ברירת המחדל (%)';if(!overrideLabel.querySelector('.override-help'))overrideLabel.insertAdjacentHTML('beforeend','<small class="simple-help override-help">השאירו ריק כדי להשתמש בשיעור המס הרגיל של סוג התכנית.</small>')}
    if(plan.type==='amendment190'&&!card.querySelector('[data-k="lockedAmount"]')){
      if(plan.lockedAmount==null)plan.lockedAmount=AMENDMENT_190_LOCKED_2025;
      card.querySelector('.advanced-grid').insertAdjacentHTML('beforeend',`<label>רובד קצבה מזכה שאינו זמין למשיכה (₪)<input data-k="lockedAmount" type="number" min="0" step="1" value="${finiteNonNegative(plan.lockedAmount)}"><small class="simple-help">ברירת המחדל לקצבה המזכה היא 38,412 ₪ (לפי תקרת שנת 2025), מחושב לפי הנחה כללית של הפקדה אחת בשנת 2025. הזינו את הסכום המצטבר בפועל לפי אישור הקופה.</small></label>`);
    }
    card.querySelectorAll('input[data-k]').forEach(input=>{
      const key=input.dataset.k;
      input.oninput=e=>{
        const raw=e.target.value;
        if(key==='severanceWithdrawable')plan[key]=input.checked;
        else if(key==='years'||key==='lockedAmount')plan[key]=finiteNonNegative(raw);
        else plan[key]=raw===''?'':finiteNonNegative(raw)/100;
    if(plan.type==='moneyFund'&&key==='annualReturn')plan.moneyFundRateMode='manual';
        if(plan.type==='bankDeposit'&&key==='annualReturn')plan.bankDepositRateMode='manual';
        save();
      };
      input.onblur=e=>{
        if(key==='severanceWithdrawable')return;
        if(plan[key]===''){e.target.value='';return}
        e.target.value=key==='years'||key==='lockedAmount'?String(Math.round(finiteNonNegative(plan[key]))):(finiteNonNegative(plan[key])*100).toFixed(key==='annualReturn'?2:1);
      };
    });
    const liquidSelect=card.querySelector('[data-k="isLiquid"]');if(liquidSelect)liquidSelect.onchange=()=>{plan.isLiquid=liquidSelect.value==='true';save()};
    if(plan.type==='bankDeposit'){
      const depositInput=card.querySelector('[data-k="annualReturn"]'),depositLabel=depositInput?.closest('label');
      if(depositLabel&&!depositLabel.querySelector('.boi-rate-note'))depositLabel.insertAdjacentHTML('beforeend',`<small class="simple-help boi-rate-note">מתעדכן אוטומטית: ריבית בנק ישראל ${(bankOfIsraelRate*100).toFixed(2)}% פחות 1.50% = ${(bankDepositRate()*100).toFixed(2)}%. שינוי ידני יישמר לתכנית הזו.</small>`);
      return;
    }
    if(plan.type!=='moneyFund')return;
    const input=card.querySelector('[data-k="annualReturn"]');
    const label=input?.closest('label');
    if(label&&!label.querySelector('.boi-rate-note'))label.insertAdjacentHTML('beforeend',`<small class="simple-help boi-rate-note">מתעדכן אוטומטית לפי ריבית בנק ישראל: ${(bankOfIsraelRate*100).toFixed(2)}%. שינוי ידני יישמר עבור התכנית הזו.</small>`);
  });
  $$('#taxBody [data-k]').forEach(control=>{
    const type=control.closest('tr')?.dataset.type,key=control.dataset.k,d=settings[type];
    if(!d)return;
    const update=()=>{d[key]=['taxNow','taxFuture','wrapperCost'].includes(key)?finiteNonNegative(control.value)/100:control.value;save()};
    control.oninput=update;
    control.onchange=update;
  });
  const reset=$('#resetTaxBtn');
  const advancedHead=document.querySelector('[data-screen="4"] .screen-head');if(advancedHead&&!advancedHead.querySelector('#topBackToPlan')){const back=document.createElement('button');back.id='topBackToPlan';back.type='button';back.className='outline';back.textContent='חזרה לתכנית';back.onclick=()=>go(3);reset?.before(back)}
  if(reset)reset.onclick=()=>{
    if(!confirm('להחזיר את כל הנחות המס, האינפלציה והתאמות התכניות לברירות המחדל?'))return;
    settings=clone(PRODUCT_TYPES);
    state.expectedInflation=2.5;
    state.products.forEach(plan=>{
      plan.annualReturn=plan.type==='moneyFund'?bankOfIsraelRate:plan.type==='bankDeposit'?bankDepositRate():(settings[plan.type]?.pensionEarlyWithdrawal ? .0374 : .07);
      plan.moneyFundRateInitialized=plan.type==='moneyFund';
      plan.moneyFundRateMode=plan.type==='moneyFund'?'auto':'';
      plan.bankDepositRateInitialized=plan.type==='bankDeposit';plan.bankDepositRateMode=plan.type==='bankDeposit'?'auto':'';
      plan.lockedAmount=plan.type==='amendment190'?AMENDMENT_190_LOCKED_2025:0;
      plan.isLiquid=true;plan.severanceWithdrawable=false;plan.years=10;plan.cpiAdjustment=0;plan.taxNowOverride='';plan.taxFutureOverride='';plan.wrapperOverride='';plan.taxBasisOverride='';
    });
    $('#expectedInflation').value='2.5';save();renderAdvanced();toast('כל ההגדרות שוחזרו');
  };
};
renderProducts();
installFirstScreenReset();
const priorNaturalReason=naturalReason;naturalReason=function(row){if(row.type==='education'&&row.isLiquid===false)return 'הקרן הוגדרה כלא נזילה, ולכן החישוב מניח מס של 47% על מלוא סכום המשיכה.';return priorNaturalReason(row).replace(/בנוסף, כל 1 ₪ נטו שנמשך מוותר על שווי עתידי נטו מוערך של [0-9.]+ ₪, לפי התשואה, התקופה והמס העתידי שהוגדרו\./,`בנוסף, המשיכה מוותרת על תוספת שווי עתידית נטו המוערכת בכ־${((row.futureOpportunityCostPerNet||0)*100).toFixed(1)}% מהנטו שנמשך, לפי התשואה, התקופה והמס העתידי שהוגדרו.`)};
const formulaChip=document.querySelector('.formula-chip');if(formulaChip){formulaChip.dir='ltr';formulaChip.innerHTML='<b dir="rtl">תשואה ריאלית</b><span> = (1 + </span><b dir="rtl">תשואה</b><span>) ÷ (1 + </span><b dir="rtl">אינפלציה</b><span>) − 1</span>'}
const accessibilityButton=document.querySelector('.access-btn');if(accessibilityButton){accessibilityButton.title='אפשרויות נגישות';accessibilityButton.setAttribute('aria-controls','accessibilityOptions');const accessibilityPanel=document.querySelector('.access-panel');if(accessibilityPanel){accessibilityPanel.id='accessibilityOptions';accessibilityPanel.setAttribute('role','region')}}
netInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();go(2)}});
netInput.addEventListener('input',updateFirstScreenReset);
refreshBankOfIsraelRate();
