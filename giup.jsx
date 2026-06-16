const { useState: gUS, useMemo: gUM } = React;

/* ============ JUYUB Business Tracker (جيوب) ============
   Mirrors the standalone "محفظتي" GIUP profile inside the store dashboard.
   Data model (stored in Firebase under `giup`):
     products: [{id, name, buyPrice, sellPrice, qty, colors[], image, createdAt}]
     sales:    [{id, productId, price, qty, date, note}]
     expenses: [{id, name, price, qty, date, category}]
     ads:      [{id, platform, cost, date, note}]
     expenseCategories: [string]
==========================================================*/

let giupLang = 'en';
const gMoney = (n) => {
  const v = Math.round(n);
  if (giupLang === 'ar') return v.toLocaleString('ar-EG') + ' ج.م';
  return v.toLocaleString('en-US') + ' EGP';
};
const gToday = () => new Date().toISOString().split('T')[0];

/* ---------- Date field: explicit Year / Month / Day order ---------- */
const GDateField = ({ value, onChange, lang }) => {
  const parts = (value || gToday()).split('-');
  const [y, m, d] = [parts[0], parts[1], parts[2]];
  const now = new Date().getFullYear();
  const years = []; for (let yy = now; yy >= now - 6; yy--) years.push(String(yy));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const set = (ny, nm, nd) => onChange(`${ny}-${nm}-${nd}`);
  const sel = { flex: 1, minWidth: 0 };
  return (
    <div className="g-date-field">
      <select className="g-input" style={sel} value={y} onChange={e => set(e.target.value, m, d)}>
        {years.map(yy => <option key={yy} value={yy}>{yy}</option>)}
      </select>
      <select className="g-input" style={sel} value={m} onChange={e => set(y, e.target.value, d)}>
        {months.map(mm => <option key={mm} value={mm}>{lang === 'ar' ? 'شهر ' + Number(mm) : Number(mm)}</option>)}
      </select>
      <select className="g-input" style={sel} value={d} onChange={e => set(y, m, e.target.value)}>
        {days.map(dd => <option key={dd} value={dd}>{Number(dd)}</option>)}
      </select>
    </div>
  );
};

const GiupPanel = () => {
  const { giup, saveGiup, lang, toast } = useStore();
  giupLang = lang; // keep module-level money formatter in sync
  const [sub, setSub] = gUS('home');
  const [period, setPeriod] = gUS('all');
  const now0 = new Date();
  const [selMonth, setSelMonth] = gUS(String(now0.getMonth() + 1).padStart(2, '0'));
  const [selYear, setSelYear] = gUS(String(now0.getFullYear()));
  const L = (en, ar) => (lang === 'ar' ? ar : en);

  const g = giup || { products: [], sales: [], expenses: [], ads: [], expenseCategories: [] };

  // ---- helpers to mutate + persist ----
  const update = (patch) => saveGiup({ ...g, ...patch });
  const addItem = (key, item) => { update({ [key]: [...(g[key] || []), item] }); toast(L('Saved ✓', 'تم الحفظ ✓')); };
  const addMany = (key, items) => { update({ [key]: [...(g[key] || []), ...items] }); toast(L('Saved ✓', 'تم الحفظ ✓')); };
  const delItem = (key, id) => { update({ [key]: (g[key] || []).filter(x => x.id !== id) }); toast(L('Deleted', 'تم الحذف')); };

  // ---- period filter (returns [from, to] inclusive date-string range) ----
  const range = gUM(() => {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      return [d.toISOString().split('T')[0], '9999-12-31'];
    }
    if (period === 'month') {
      const from = `${selYear}-${selMonth}-01`;
      const to = `${selYear}-${selMonth}-31`;
      return [from, to];
    }
    return ['2000-01-01', '9999-12-31']; // all
  }, [period, selMonth, selYear]);

  // Compare date strings directly (YYYY-MM-DD lexicographic = chronological)
  const inPeriod = (d) => !d || (d >= range[0] && d <= range[1]);

  // ---- totals ----
  const totals = gUM(() => {
    const sales = (g.sales || []).filter(s => inPeriod(s.date)).reduce((a, x) => a + x.price * x.qty, 0);
    const exp = (g.expenses || []).filter(e => inPeriod(e.date)).reduce((a, x) => a + x.price * x.qty, 0);
    const ads = (g.ads || []).filter(a => inPeriod(a.date)).reduce((a, x) => a + x.cost, 0);
    // product purchase cost counted in the period it was bought
    const prodCost = (g.products || []).filter(p => inPeriod(p.date)).reduce((a, p) => a + p.buyPrice * p.qty, 0);
    const totalExp = exp + ads + prodCost;
    return { sales, exp, ads, prodCost, totalExp, profit: sales - totalExp };
  }, [g, range]);

  const tabs = [
    ['home', '🏠', L('Home', 'الرئيسية')],
    ['products', '📦', L('Products', 'المنتجات')],
    ['sales', '💰', L('Sales', 'المبيعات')],
    ['expenses', '🧾', L('Expenses', 'المصروفات')],
    ['ads', '📣', L('Ads', 'الإعلانات')],
    ['reports', '📊', L('Reports', 'التقارير')],
  ];

  return (
    <div className="giup-panel">
      {/* Sub-navigation */}
      <div className="giup-subnav">
        {tabs.map(([id, icon, label]) => (
          <button key={id} className={'giup-subtab' + (sub === id ? ' active' : '')} onClick={() => setSub(id)}>
            <span className="gst-icon">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Period toggle (home + reports) */}
      {(sub === 'home' || sub === 'reports') && (
        <div className="giup-period-wrap">
          <div className="giup-period">
            {[['week', L('Week', 'أسبوع')], ['month', L('Month', 'شهر')], ['all', L('All', 'الكل')]].map(([id, label]) => (
              <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{label}</button>
            ))}
          </div>
          {period === 'month' && (
            <div className="giup-month-pick">
              <select className="g-input" value={selMonth} onChange={e => setSelMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(mm => (
                  <option key={mm} value={mm}>{lang === 'ar' ? 'شهر ' + Number(mm) : Number(mm)}</option>
                ))}
              </select>
              <select className="g-input" value={selYear} onChange={e => setSelYear(e.target.value)}>
                {Array.from({ length: 7 }, (_, i) => String(now0.getFullYear() - i)).map(yy => (
                  <option key={yy} value={yy}>{yy}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {sub === 'home' && <GiupHome g={g} totals={totals} L={L} lang={lang} />}
      {sub === 'products' && <GiupProducts g={g} addItem={addItem} addMany={addMany} delItem={delItem} L={L} />}
      {sub === 'sales' && <GiupSales g={g} addItem={addItem} delItem={delItem} L={L} lang={lang} />}
      {sub === 'expenses' && <GiupExpenses g={g} addItem={addItem} delItem={delItem} update={update} L={L} lang={lang} />}
      {sub === 'ads' && <GiupAds g={g} addItem={addItem} delItem={delItem} L={L} lang={lang} />}
      {sub === 'reports' && <GiupReports g={g} totals={totals} inPeriod={inPeriod} L={L} lang={lang} />}
    </div>
  );
};

/* ---------- stock helper ---------- */
const giupStock = (g, productId) => {
  const p = (g.products || []).find(x => x.id === productId);
  if (!p) return 0;
  const sold = (g.sales || []).filter(s => s.productId === productId).reduce((a, x) => a + x.qty, 0);
  return p.qty - sold;
};

/* ---------- localized product name (with color if present) ---------- */
const giupName = (p, lang) => {
  if (!p) return '';
  const base = lang === 'ar' ? (p.nameAr || p.name || p.nameEn || '') : (p.nameEn || p.name || p.nameAr || '');
  const color = p.colorEn ? (lang === 'ar' ? (p.colorAr || p.colorEn) : p.colorEn) : '';
  return color ? `${base} — ${color}` : base;
};

/* ============ HOME ============ */
const GiupHome = ({ g, totals, L, lang }) => {
  const stat = (label, value, color) => (
    <div className="g-stat">
      <div className="g-stat-label">{label}</div>
      <div className="g-stat-value" style={{ color }}>{gMoney(value)}</div>
    </div>
  );
  return (
    <>
      <div className="giup-stats">
        {stat(L('Total sales', 'إجمالي المبيعات'), totals.sales, 'var(--maroon)')}
        {stat(L('Total expenses', 'إجمالي المصروفات'), totals.totalExp, '#c0392b')}
        {stat(L('Net profit', 'صافي الربح'), totals.profit, totals.profit >= 0 ? '#12996a' : '#c0392b')}
      </div>

      <GiupProfitChart g={g} L={L} lang={lang} />

      <div className="g-card">
        <div className="g-card-title">📦 {L('Stock', 'المخزون')}</div>
        {(g.products || []).length === 0 ? (
          <div className="g-empty">{L('No products yet', 'لا توجد منتجات بعد')}</div>
        ) : (
          (g.products || []).map(p => {
            const stock = giupStock(g, p.id);
            const color = stock <= 0 ? '#c0392b' : stock <= 3 ? '#d68910' : '#12996a';
            return (
              <div key={p.id} className="g-stock-row">
                <span className="g-stock-name">{giupName(p, lang)}</span>
                <span className="g-stock-qty" style={{ color }}>{stock} {L('pcs', 'قطعة')}</span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

/* ---------- Profit chart (last 7 days) — SVG ---------- */
const GiupProfitChart = ({ g, L, lang }) => {
  const loc = lang === 'ar' ? 'ar-EG' : 'en-US';
  const data = gUM(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const sales = (g.sales || []).filter(x => x.date === ds).reduce((s, x) => s + x.price * x.qty, 0);
      const exp = (g.expenses || []).filter(x => x.date === ds).reduce((s, x) => s + x.price * x.qty, 0)
        + (g.ads || []).filter(x => x.date === ds).reduce((s, x) => s + x.cost, 0);
      days.push({ label: d.toLocaleDateString(loc, { weekday: 'short' }), profit: sales - exp });
    }
    return days;
  }, [g, loc]);

  const W = 600, H = 180, pad = { t: 16, b: 28, l: 12, r: 12 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const vals = data.map(d => d.profit);
  const maxV = Math.max(...vals, 1), minV = Math.min(...vals, 0), range = (maxV - minV) || 1;
  const xStep = cW / (data.length - 1);
  const yS = v => pad.t + cH - ((v - minV) / range) * cH;
  const zeroY = yS(0);
  const pts = data.map((d, i) => `${pad.l + i * xStep},${yS(d.profit)}`).join(' ');
  const areaPts = `${pad.l},${zeroY} ${pts} ${pad.l + (data.length - 1) * xStep},${zeroY}`;

  return (
    <div className="g-card">
      <div className="g-card-title">📈 {L('Daily profit (last 7 days)', 'الأرباح اليومية (آخر ٧ أيام)')}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <line x1={pad.l} y1={zeroY} x2={W - pad.r} y2={zeroY} stroke="var(--line)" strokeDasharray="4 4" />
        <polygon points={areaPts} fill="rgba(122,31,53,0.10)" />
        <polyline points={pts} fill="none" stroke="var(--maroon)" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad.l + i * xStep, y = yS(d.profit);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={d.profit >= 0 ? '#12996a' : '#c0392b'} />
              <text x={x} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--ink-soft)" fontFamily="inherit">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ============ PRODUCTS ============ */
const GiupProducts = ({ g, addItem, addMany, delItem, L, lang: panelLang }) => {
  const { products: siteProducts, lang } = useStore();
  const [pickId, setPickId] = gUS('');
  const [buyPrice, setBuy] = gUS('');
  const [sellPrice, setSell] = gUS('');
  const [date, setDate] = gUS(gToday());
  const [colorQty, setColorQty] = gUS({}); // { colorEn: qty }

  const picked = (siteProducts || []).find(p => p.id === pickId);
  const pickedImg = picked && picked.variants && picked.variants[0] ? picked.variants[0].img : null;
  const pickedName = picked ? (lang === 'ar' ? picked.name.ar : picked.name.en) : '';
  const variants = picked ? (picked.variants || []) : [];

  const onPick = (id) => {
    setPickId(id);
    setColorQty({});
    const p = (siteProducts || []).find(x => x.id === id);
    if (p) setSell(String(p.price || ''));
  };

  const setQtyFor = (colorEn, val) => {
    setColorQty(prev => ({ ...prev, [colorEn]: val }));
  };

  const save = () => {
    if (!picked) return;
    // build one inventory entry per color that has qty > 0
    const entries = variants
      .map(v => {
        const q = parseInt(colorQty[v.color.en]) || 0;
        if (q <= 0) return null;
        return {
          id: Date.now().toString() + '-' + v.color.en,
          siteId: picked.id,
          name: pickedName,
          nameEn: picked.name.en,
          nameAr: picked.name.ar,
          colorEn: v.color.en,
          colorAr: v.color.ar,
          colorHex: v.color.hex,
          buyPrice: parseFloat(buyPrice) || 0,
          sellPrice: parseFloat(sellPrice) || (picked.price || 0),
          qty: q,
          image: v.img || pickedImg,
          date: date || gToday(),
          createdAt: new Date().toISOString(),
        };
      })
      .filter(Boolean);

    if (entries.length === 0) { alert(L('Enter quantity for at least one color', 'أدخل كمية للون واحد على الأقل')); return; }

    addMany('products', entries);
    setPickId(''); setBuy(''); setSell(''); setColorQty({}); setDate(gToday());
  };

  const totalToAdd = variants.reduce((a, v) => a + (parseInt(colorQty[v.color.en]) || 0), 0);
  const availableToAdd = (siteProducts || []);
  const imgOf = (p) => (p.variants && p.variants[0] ? p.variants[0].img : null);

  return (
    <>
      <div className="g-card">
        <div className="g-card-title">➕ {L('Add a product you bought', 'أضف منتج اشتريته')}</div>
        <div className="g-form">
          <div className="g-pick-label">{L('Choose a product from the store', 'اختر منتج من المتجر')}</div>
          <div className="g-pick-grid">
            {availableToAdd.map(p => (
              <button key={p.id} type="button"
                className={'g-pick-card' + (pickId === p.id ? ' on' : '')}
                onClick={() => onPick(p.id)}>
                <div className="g-pick-img">{imgOf(p) ? <img src={imgOf(p)} alt="" onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML='<span>🛍️</span>';}} /> : <span>🛍️</span>}</div>
                <div className="g-pick-cap">{lang === 'ar' ? p.name.ar : p.name.en}</div>
                <div className="g-pick-price">{gMoney(p.price)}</div>
              </button>
            ))}
          </div>

          {picked && (
            <>
              <div className="g-pick-selected">
                {pickedImg && <img src={pickedImg} alt="" onError={e=>{e.target.style.display='none';}} />}
                <div>
                  <div className="g-pick-name">{pickedName}</div>
                  <div className="g-pick-sub">{L('Store price', 'سعر المتجر')}: {gMoney(picked.price)}</div>
                </div>
              </div>

              {/* Color quantities */}
              <div className="g-pick-label">{L('Quantity per color you bought', 'الكمية لكل لون اشتريته')}</div>
              <div className="g-color-list">
                {variants.map(v => (
                  <div key={v.color.en} className={'g-color-row' + ((parseInt(colorQty[v.color.en]) || 0) > 0 ? ' on' : '')}>
                    <span className="g-color-dot" style={{ background: v.color.hex }} />
                    <span className="g-color-name">{lang === 'ar' ? v.color.ar : v.color.en}</span>
                    <input className="g-color-qty" type="number" min="0" placeholder="0"
                      value={colorQty[v.color.en] || ''}
                      onChange={e => setQtyFor(v.color.en, e.target.value)} />
                  </div>
                ))}
              </div>
              {totalToAdd > 0 && (
                <div className="g-total-hint">{L('Total to add', 'الإجمالي للإضافة')}: <strong>{totalToAdd} {L('pcs', 'قطعة')}</strong></div>
              )}
            </>
          )}

          <div className="g-form-row">
            <input className="g-input" type="number" placeholder={L('Buy price (cost)', 'سعر الشراء (التكلفة)')} value={buyPrice} onChange={e => setBuy(e.target.value)} />
            <input className="g-input" type="number" placeholder={L('Sell price', 'سعر البيع')} value={sellPrice} onChange={e => setSell(e.target.value)} />
          </div>
          <div className="g-field">
            <label className="g-pick-label">{L('Purchase date', 'تاريخ الشراء')}</label>
            <GDateField value={date} onChange={setDate} lang={lang} />
          </div>
          <button className="g-btn-primary" onClick={save}>{L('Add to inventory', 'أضف للمخزون')}</button>
        </div>
      </div>

      <div className="g-card">
        <div className="g-card-title">📦 {L('Inventory', 'المخزون')} ({(g.products || []).length})</div>
        {(g.products || []).length === 0 ? (
          <div className="g-empty">{L('No products yet', 'لا توجد منتجات')}</div>
        ) : (g.products || []).map(p => {
          const stock = giupStock(g, p.id);
          const margin = p.sellPrice - p.buyPrice;
          const dispName = p.nameAr && lang === 'ar' ? p.nameAr : (p.nameEn || p.name);
          const colorName = p.colorEn ? (lang === 'ar' ? (p.colorAr || p.colorEn) : p.colorEn) : null;
          return (
            <div key={p.id} className="g-list-row">
              <div className="g-list-main g-list-withimg">
                {p.image && <img className="g-thumb" src={p.image} alt="" onError={e=>{e.target.style.display='none';}} />}
                <div style={{ minWidth: 0 }}>
                  <div className="g-list-name">
                    {dispName}
                    {colorName && <span className="g-color-tag"><span className="g-color-dot sm" style={{ background: p.colorHex }} />{colorName}</span>}
                  </div>
                  <div className="g-list-sub">
                    {L('Buy', 'شراء')}: {gMoney(p.buyPrice)} · {L('Sell', 'بيع')}: {gMoney(p.sellPrice)} ·
                    <span style={{ color: margin >= 0 ? '#12996a' : '#c0392b' }}> {L('Margin', 'الهامش')}: {gMoney(margin)}</span>
                  </div>
                  {p.date && <div className="g-list-sub">{L('Bought', 'تاريخ الشراء')}: {p.date}</div>}
                </div>
              </div>
              <div className="g-list-side">
                <span className="g-stock-pill" style={{ color: stock <= 0 ? '#c0392b' : stock <= 3 ? '#d68910' : '#12996a' }}>{stock} {L('left', 'متبقي')}</span>
                <button className="g-del" onClick={() => { if (confirm(L('Delete this product?', 'حذف هذا المنتج؟'))) delItem('products', p.id); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ============ SALES ============ */
const GiupSales = ({ g, addItem, delItem, L, lang }) => {
  const [productId, setProductId] = gUS('');
  const [price, setPrice] = gUS('');
  const [qty, setQty] = gUS('1');
  const [date, setDate] = gUS(gToday());

  const onPick = (id) => {
    setProductId(id);
    const p = (g.products || []).find(x => x.id === id);
    if (p) setPrice(String(p.sellPrice || ''));
  };
  const save = () => {
    if (!productId) return;
    if (!(parseInt(qty) > 0)) return;
    addItem('sales', {
      id: Date.now().toString(),
      productId,
      price: parseFloat(price) || 0,
      qty: parseInt(qty) || 0,
      date: date || gToday(),
    });
    setProductId(''); setPrice(''); setQty('1'); setDate(gToday());
  };
  const sorted = [...(g.sales || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div className="g-card">
        <div className="g-card-title">➕ {L('Record a sale', 'سجل بيعة')}</div>
        <div className="g-form">
          <div className="g-pick-label">{L('Choose what you sold', 'اختر اللي بعته')}</div>
          {(g.products || []).filter(p => giupStock(g, p.id) > 0).length === 0 ? (
            <div className="g-empty">{L('No products in stock', 'لا توجد منتجات في المخزون')}</div>
          ) : (
            <div className="g-pick-grid">
              {(g.products || []).filter(p => giupStock(g, p.id) > 0).map(p => {
                const stock = giupStock(g, p.id);
                const colorName = p.colorEn ? (lang === 'ar' ? (p.colorAr || p.colorEn) : p.colorEn) : null;
                const baseName = lang === 'ar' ? (p.nameAr || p.name) : (p.nameEn || p.name);
                return (
                  <button key={p.id} type="button"
                    className={'g-pick-card' + (productId === p.id ? ' on' : '')}
                    onClick={() => onPick(p.id)}>
                    <div className="g-pick-img">{p.image ? <img src={p.image} alt="" onError={e=>{e.target.style.display='none';e.target.parentElement.innerHTML='<span>🛍️</span>';}} /> : <span>🛍️</span>}</div>
                    <div className="g-pick-cap">{baseName}</div>
                    {colorName && <div className="g-pick-color"><span className="g-color-dot sm" style={{ background: p.colorHex }} />{colorName}</div>}
                    <div className="g-pick-price">{stock} {L('left', 'متبقي')}</div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="g-form-row">
            <input className="g-input" type="number" placeholder={L('Sell price', 'سعر البيع')} value={price} onChange={e => setPrice(e.target.value)} />
            <input className="g-input" type="number" placeholder={L('Qty', 'الكمية')} value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <GDateField value={date} onChange={setDate} lang={lang} />
          <button className="g-btn-primary" onClick={save}>{L('Save sale', 'حفظ البيعة')}</button>
        </div>
      </div>

      <div className="g-card">
        <div className="g-card-title">📋 {L('Sales log', 'سجل المبيعات')}</div>
        {sorted.length === 0 ? <div className="g-empty">{L('No sales yet', 'لا توجد مبيعات')}</div> : sorted.map(s => {
          const p = (g.products || []).find(x => x.id === s.productId);
          return (
            <div key={s.id} className="g-list-row">
              <div className="g-list-main g-list-withimg">
                {p && p.image && <img className="g-thumb" src={p.image} alt="" onError={e=>{e.target.style.display='none';}} />}
                <div style={{ minWidth: 0 }}>
                  <div className="g-list-name">{p ? giupName(p, lang) : L('Deleted product', 'منتج محذوف')}</div>
                  <div className="g-list-sub">{gMoney(s.price)} × {s.qty} · {s.date}</div>
                </div>
              </div>
              <div className="g-list-side">
                <span className="g-amount" style={{ color: '#12996a' }}>+{gMoney(s.price * s.qty)}</span>
                <button className="g-del" onClick={() => { if (confirm(L('Delete sale?', 'حذف البيعة؟'))) delItem('sales', s.id); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ============ EXPENSES ============ */
const GiupExpenses = ({ g, addItem, delItem, update, L, lang }) => {
  const [name, setName] = gUS('');
  const [price, setPrice] = gUS('');
  const [qty, setQty] = gUS('1');
  const [date, setDate] = gUS(gToday());

  const save = () => {
    if (!name.trim()) return;
    addItem('expenses', {
      id: Date.now().toString(),
      name: name.trim(),
      price: parseFloat(price) || 0,
      qty: parseInt(qty) || 1,
      date: date || gToday(),
    });
    setName(''); setPrice(''); setQty('1'); setDate(gToday());
  };
  const sorted = [...(g.expenses || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div className="g-card">
        <div className="g-card-title">➕ {L('Add expense', 'أضف مصروف')}</div>
        <div className="g-form">
          <input className="g-input" placeholder={L('Expense name', 'اسم المصروف')} value={name} onChange={e => setName(e.target.value)} />
          <div className="g-form-row">
            <input className="g-input" type="number" placeholder={L('Price', 'السعر')} value={price} onChange={e => setPrice(e.target.value)} />
            <input className="g-input" type="number" placeholder={L('Qty', 'الكمية')} value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <GDateField value={date} onChange={setDate} lang={lang} />
          <button className="g-btn-primary" onClick={save}>{L('Save expense', 'حفظ المصروف')}</button>
        </div>
      </div>

      <div className="g-card">
        <div className="g-card-title">🧾 {L('Expenses', 'المصروفات')}</div>
        {sorted.length === 0 ? <div className="g-empty">{L('No expenses yet', 'لا توجد مصروفات')}</div> : sorted.map(e => (
          <div key={e.id} className="g-list-row">
            <div className="g-list-main">
              <div className="g-list-name">{e.name}</div>
              <div className="g-list-sub">{gMoney(e.price)} × {e.qty} · {e.date}</div>
            </div>
            <div className="g-list-side">
              <span className="g-amount" style={{ color: '#c0392b' }}>−{gMoney(e.price * e.qty)}</span>
              <button className="g-del" onClick={() => { if (confirm(L('Delete?', 'حذف؟'))) delItem('expenses', e.id); }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ============ ADS ============ */
const GiupAds = ({ g, addItem, delItem, L, lang }) => {
  const PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'Google'];
  const [platforms, setPlatforms] = gUS([]);
  const [cost, setCost] = gUS('');
  const [date, setDate] = gUS(gToday());
  const [note, setNote] = gUS('');

  const togglePlatform = (p) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const save = () => {
    if (!(parseFloat(cost) > 0)) return;
    if (platforms.length === 0) return;
    addItem('ads', {
      id: Date.now().toString(),
      platforms: [...platforms],
      platform: platforms.join('، '),
      cost: parseFloat(cost) || 0,
      date: date || gToday(),
      note: note.trim(),
    });
    setPlatforms([]); setCost(''); setNote(''); setDate(gToday());
  };
  const sorted = [...(g.ads || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div className="g-card">
        <div className="g-card-title">➕ {L('Add ad spend', 'أضف مصروف إعلان')}</div>
        <div className="g-form">
          <div className="g-check-label">{L('Platforms (choose one or more)', 'المنصات (اختر واحدة أو أكثر)')}</div>
          <div className="g-checks">
            {PLATFORMS.map(p => (
              <button key={p} type="button"
                className={'g-check' + (platforms.includes(p) ? ' on' : '')}
                onClick={() => togglePlatform(p)}>
                <span className="g-check-box">{platforms.includes(p) ? '✓' : ''}</span>{p}
              </button>
            ))}
          </div>
          <div className="g-form-row">
            <input className="g-input" type="number" placeholder={L('Cost', 'التكلفة')} value={cost} onChange={e => setCost(e.target.value)} />
            <GDateField value={date} onChange={setDate} lang={lang} />
          </div>
          <input className="g-input" placeholder={L('Note (optional)', 'ملاحظة (اختياري)')} value={note} onChange={e => setNote(e.target.value)} />
          <button className="g-btn-primary" onClick={save}>{L('Save ad', 'حفظ الإعلان')}</button>
        </div>
      </div>

      <div className="g-card">
        <div className="g-card-title">📣 {L('Ad spend log', 'سجل الإعلانات')}</div>
        {sorted.length === 0 ? <div className="g-empty">{L('No ads yet', 'لا توجد إعلانات')}</div> : sorted.map(a => (
          <div key={a.id} className="g-list-row">
            <div className="g-list-main">
              <div className="g-list-name">{a.platform}</div>
              <div className="g-list-sub">{a.date}{a.note ? ' · ' + a.note : ''}</div>
            </div>
            <div className="g-list-side">
              <span className="g-amount" style={{ color: '#c0392b' }}>−{gMoney(a.cost)}</span>
              <button className="g-del" onClick={() => { if (confirm(L('Delete?', 'حذف؟'))) delItem('ads', a.id); }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ============ REPORTS ============ */
const GiupReports = ({ g, totals, inPeriod, L, lang }) => {
  // profit per product
  const perProduct = gUM(() => {
    return (g.products || []).map(p => {
      const sales = (g.sales || []).filter(s => s.productId === p.id && inPeriod(s.date));
      const revenue = sales.reduce((a, s) => a + s.price * s.qty, 0);
      const unitsSold = sales.reduce((a, s) => a + s.qty, 0);
      const cogs = unitsSold * p.buyPrice;
      return { name: giupName(p, lang), unitsSold, revenue, profit: revenue - cogs };
    }).filter(x => x.unitsSold > 0).sort((a, b) => b.profit - a.profit);
  }, [g, inPeriod]);

  const margin = totals.sales > 0 ? (totals.profit / totals.sales) * 100 : 0;

  const line = (label, value, color) => (
    <div className="g-report-line">
      <span>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{typeof value === 'number' ? gMoney(value) : value}</span>
    </div>
  );

  return (
    <>
      <div className="g-card">
        <div className="g-card-title">📊 {L('Summary', 'الملخص')}</div>
        {line(L('Revenue (sales)', 'الإيرادات (المبيعات)'), totals.sales, '#12996a')}
        {line(L('Product cost', 'تكلفة المنتجات'), totals.prodCost, '#c0392b')}
        {line(L('Expenses', 'المصروفات'), totals.exp, '#c0392b')}
        {line(L('Ad spend', 'مصروف الإعلانات'), totals.ads, '#c0392b')}
        <div className="g-report-divider" />
        {line(L('Net profit', 'صافي الربح'), totals.profit, totals.profit >= 0 ? '#12996a' : '#c0392b')}
        {line(L('Profit margin', 'هامش الربح'), margin.toFixed(1) + '%', margin >= 0 ? '#12996a' : '#c0392b')}
      </div>

      <div className="g-card">
        <div className="g-card-title">🏆 {L('Profit per product', 'ربح كل منتج')}</div>
        {perProduct.length === 0 ? <div className="g-empty">{L('No sales in this period', 'لا مبيعات في هذه الفترة')}</div> : perProduct.map((p, i) => (
          <div key={i} className="g-list-row">
            <div className="g-list-main">
              <div className="g-list-name">{p.name}</div>
              <div className="g-list-sub">{p.unitsSold} {L('sold', 'مباع')} · {L('revenue', 'إيراد')} {gMoney(p.revenue)}</div>
            </div>
            <div className="g-list-side">
              <span className="g-amount" style={{ color: p.profit >= 0 ? '#12996a' : '#c0392b' }}>{p.profit >= 0 ? '+' : ''}{gMoney(p.profit)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

Object.assign(window, { GiupPanel });
