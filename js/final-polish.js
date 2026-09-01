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
