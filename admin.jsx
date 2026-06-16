// ============ JUYUB — owner login + admin dashboard ============
const { useState: adUS } = React;

const handleImageUpload = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.75);
      callback(base64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

/* ---------- Login modal ---------- */
const LoginModal = () => {
  const { setLoginOpen, login, t } = useStore();
  const [u, setU] = adUS('');
  const [p, setP] = adUS('');
  const [err, setErr] = adUS(false);
  const submit = (e) => { e.preventDefault(); if (!login(u, p)) setErr(true); };
  return (
    <div className="modal-scrim" onClick={() => setLoginOpen(false)}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={() => setLoginOpen(false)}><Icon n="close" /></button>
        <img className="modal-emblem" src="https://juyub.odoo.com/web/image/1082" alt="" />
        <h3 className="h3">{t({ en: 'Owner login', ar: 'دخول المالك' })}</h3>
        <p className="sub">{t({ en: 'Sign in to manage your store', ar: 'سجّلي دخولك لإدارة متجرك' })}</p>
        <div className="field">
          <label>{t({ en: 'Username', ar: 'اسم المستخدم' })}</label>
          <input className="input" value={u} autoComplete="username" onChange={e => { setU(e.target.value); setErr(false); }} />
        </div>
        <div className="field">
          <label>{t({ en: 'Password', ar: 'كلمة السر' })}</label>
          <input className="input" type="password" value={p} autoComplete="current-password" onChange={e => { setP(e.target.value); setErr(false); }} />
        </div>
        {err && <p className="msg" style={{ marginBottom: 12 }}>{t({ en: 'Wrong username or password', ar: 'اسم المستخدم أو كلمة السر غلط' })}</p>}
        <button className="btn btn-primary btn-block btn-lg" type="submit">{t({ en: 'Sign in', ar: 'دخول' })}</button>
      </form>
    </div>
  );
};

/* ---------- helpers ---------- */
const blankProduct = () => ({
  id: 'p' + Date.now().toString(36),
  sku: '', cat: 'totes', price: 0, featured: false,
  name: { en: '', ar: '' }, tagline: { en: '', ar: '' }, blurb: { en: '', ar: '' },
  variants: [{ color: { en: 'Default', ar: 'أساسي', hex: '#540b14' }, img: '', stock: true, shots: [] }],
  specs: { size: { en: '', ar: '' }, material: { en: '', ar: '' }, strap: { en: '', ar: '' }, closure: { en: '', ar: '' }, interior: { en: '', ar: '' } },
});

/* ---------- Product editor ---------- */
const ProductEditor = ({ initial, onDone }) => {
  const { t, lang, saveProduct, categories, products } = useStore();
  const [f, setF] = adUS(() => JSON.parse(JSON.stringify(initial)));
  const upd = (patch) => setF(s => ({ ...s, ...patch }));
  const updName = (field, lng, val) => setF(s => ({ ...s, [field]: { ...s[field], [lng]: val } }));
  const updSpec = (key, lng, val) => setF(s => ({ ...s, specs: { ...s.specs, [key]: { ...s.specs[key], [lng]: val } } }));
  const updVar = (i, patch) => setF(s => { const vs = [...s.variants]; vs[i] = { ...vs[i], ...patch }; return { ...s, variants: vs }; });
  const updVarColor = (i, lng, val) => setF(s => { const vs = [...s.variants]; vs[i] = { ...vs[i], color: { ...vs[i].color, [lng]: val } }; return { ...s, variants: vs }; });
  const addVar = () => setF(s => ({ ...s, variants: [...s.variants, { color: { en: '', ar: '', hex: '#888888' }, img: '', stock: true, shots: [] }] }));
  const rmVar = (i) => setF(s => ({ ...s, variants: s.variants.filter((_, j) => j !== i) }));

  const save = () => {
    if (!f.name.en.trim() && !f.name.ar.trim()) { alert(t({ en: 'Please enter a product name', ar: 'اكتبي اسم المنتج' })); return; }
    const latest = products.find(x => x.id === f.id) || {};
    const clean = { ...f, price: Number(f.price) || 0, compareAt: Number(f.compareAt) || 0, variants: f.variants.map(v => ({ ...v, shots: (v.shots || []).filter(Boolean) })),
      sortOrder: latest.sortOrder ?? 0,
      hidden: latest.hidden ?? false,
      featured: f.featured ?? false,
      onSale: f.onSale ?? false,
      juyubPicks: f.juyubPicks ?? false,
      newArrival: f.newArrival ?? false,
      limitedEd: f.limitedEd ?? false,
    };
    saveProduct(clean);
    onDone();
  };

  const L = (en, ar) => t({ en, ar });
  const field = (label, val, on, ph) => (
    <div className="field"><label>{label}</label><input className="input" value={val} placeholder={ph || ''} onChange={e => on(e.target.value)} /></div>
  );

  return (
    <div className="adm-editor">
      <h3 className="h3">{initial.name.en || initial.name.ar ? L('Edit product', 'تعديل منتج') : L('New product', 'منتج جديد')}</h3>

      <div className="adm-grid">
        {field(L('Name (English)', 'الاسم (إنجليزي)'), f.name.en, v => updName('name', 'en', v))}
        {field(L('Name (Arabic)', 'الاسم (عربي)'), f.name.ar, v => updName('name', 'ar', v))}
      </div>
      <div className="adm-grid">
        {field(L('SKU / code', 'الكود'), f.sku, v => upd({ sku: v }), 'B10-001')}
        <div className="field">
          <label>{L('Categories', 'الفئات')}</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
            {categories.filter(c=>c.id!=='all').map(c=>{
              const cats=Array.isArray(f.cats)?f.cats:(f.cat?[f.cat]:[]);
              const sel=cats.includes(c.id);
              return (
                <label key={c.id} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:99,cursor:'pointer',
                  border:'1.5px solid',borderColor:sel?'var(--maroon)':'var(--border)',
                  background:sel?'#fff5f5':'var(--bg)',userSelect:'none'}}>
                  <input type="checkbox" checked={sel} style={{accentColor:'var(--maroon)'}} onChange={()=>{
                    const cur=Array.isArray(f.cats)?f.cats:(f.cat?[f.cat]:[]);
                    const next=sel?cur.filter(x=>x!==c.id):[...cur,c.id];
                    upd({cats:next,cat:next[0]||''});
                  }}/>
                  <span style={{fontSize:13,fontWeight:sel?700:400,color:sel?'var(--maroon)':'var(--ink)'}}>{t(c)}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
      <div className="adm-grid">
        {field(L('Selling price (LE)', 'سعر البيع (ج.م)'), f.price, v => upd({ price: v }))}
        {field(L('Old price (optional)', 'السعر قبل الخصم (اختياري)'), f.compareAt || '', v => upd({ compareAt: v }))}
      </div>
      {Number(f.compareAt) > Number(f.price) && Number(f.price) > 0 && (
        <p className="muted" style={{ marginTop: -4, marginBottom: 6, fontSize: 13.5 }}>
          🏷️ {L('Discount', 'الخصم')}: <strong style={{ color: 'var(--maroon)' }}>-{Math.round((1 - Number(f.price) / Number(f.compareAt)) * 100)}%</strong> — {L('shown as a sale badge on the product.', 'هيظهر كشارة تخفيض على المنتج.')}
        </p>
      )}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-soft)',marginBottom:10}}>{L('Product badges','شارات المنتج')}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
          {[
            {key:'featured',   en:'Bestseller',   ar:'الأكثر مبيعاً', color:'#540b14'},
            {key:'onSale',     en:'On Sale',       ar:'تخفيض',          color:'#d97706'},
            {key:'juyubPicks', en:'JUYUB Picks',   ar:'مختارات جيوب',   color:'#0369a1'},
            {key:'newArrival', en:'New Arrival',   ar:'وصل حديثاً',     color:'#047857'},
            {key:'limitedEd',  en:'Limited Edition',ar:'إصدار محدود',   color:'#7c3aed'},
          ].map(b=>(
            <label key={b.key} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:10,cursor:'pointer',
              border:'2px solid', borderColor:f[b.key]?b.color:'var(--border)',
              background:f[b.key]?b.color+'18':'var(--bg)', userSelect:'none'}}>
              <input type="checkbox" checked={!!f[b.key]} onChange={e=>upd({[b.key]:e.target.checked})} style={{accentColor:b.color}} />
              <span style={{fontSize:13,fontWeight:600,color:f[b.key]?b.color:'var(--ink)'}}>{L(b.en,b.ar)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="adm-grid">
        {field(L('Tagline (EN)', 'سطر تعريفي (EN)'), f.tagline.en, v => updName('tagline', 'en', v))}
        {field(L('Tagline (AR)', 'سطر تعريفي (AR)'), f.tagline.ar, v => updName('tagline', 'ar', v))}
      </div>
      <div className="adm-grid">
        <div className="field"><label>{L('Description (EN)', 'الوصف (EN)')}</label><textarea className="input" rows="2" value={f.blurb.en} onChange={e => updName('blurb', 'en', e.target.value)} /></div>
        <div className="field"><label>{L('Description (AR)', 'الوصف (AR)')}</label><textarea className="input" rows="2" value={f.blurb.ar} onChange={e => updName('blurb', 'ar', e.target.value)} /></div>
      </div>

      {/* variants */}
      <div className="adm-sec">
        <h4>{L('Colors & images', 'الألوان والصور')}</h4>
        {f.variants.map((v, i) => (
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:12}}>
            <div style={{display:'flex',flexDirection:'column',gap:6,paddingTop:8}}>
              <button type="button" disabled={i===0} onClick={()=>{const a=[...f.variants];[a[i-1],a[i]]=[a[i],a[i-1]];upd({variants:a});}} style={{width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:i===0?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',opacity:i===0?0.3:1}}>↑</button>
              <button type="button" disabled={i===f.variants.length-1} onClick={()=>{const a=[...f.variants];[a[i+1],a[i]]=[a[i],a[i+1]];upd({variants:a});}} style={{width:32,height:32,borderRadius:8,border:'1px solid var(--border)',background:'var(--surface)',cursor:i===f.variants.length-1?'not-allowed':'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',opacity:i===f.variants.length-1?0.3:1}}>↓</button>
            </div>
          <div className="adm-variant" style={{flex:1}}>
            {f.variants.length > 1 && <button className="v-remove" onClick={() => rmVar(i)}>{L('Remove', 'حذف')}</button>}
            <div className="adm-grid">
              {field(L('Color name (EN)', 'اللون (EN)'), v.color.en, val => updVarColor(i, 'en', val))}
              {field(L('Color name (AR)', 'اللون (AR)'), v.color.ar, val => updVarColor(i, 'ar', val))}
            </div>
        <div className="adm-row-inline">
              <div className="field" style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{L('Main image URL', 'رابط الصورة الأساسية')}</span>
                  <label style={{ cursor: 'pointer', color: 'var(--maroon)', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    📎 {L('Upload from device', 'رفع من الجهاز')}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImageUpload(file, (base64) => {
                            updVar(i, { img: base64 });
                          });
                        }
                      }}
                    />
                  </label>
                </label>
                <input className="input" value={v.img} placeholder="https://…  ·  assets/products/…" onChange={e => updVar(i, { img: e.target.value })} />
              </div>
              <div className="field" style={{ width: 70 }}>
                <label>{L('Swatch', 'اللون')}</label>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <input className="color-input" type="color" value={(v.color.hex||'#000000').split('/')[0].trim()} onChange={e=>{const parts=(v.color.hex||'').split('/');parts[0]=e.target.value;updVarColor(i,'hex',parts.join('/'));}} />
                  <span style={{fontSize:11,color:'var(--ink-soft)'}}>+</span>
                  <input className="color-input" type="color" value={(v.color.hex||'#000000').split('/')[1]?.trim()||'#ffffff'} onChange={e=>{const parts=(v.color.hex||'#000000').split('/');parts[1]=e.target.value;updVarColor(i,'hex',parts.join('/'));}} />
                  <div style={{width:30,height:30,borderRadius:'50%',overflow:'hidden',border:'1px solid var(--border)',flexShrink:0}}>
                    {(v.color.hex||'').includes('/')
                      ? <><div style={{width:'50%',height:'100%',background:(v.color.hex||'').split('/')[0].trim(),float:'left'}}/><div style={{width:'50%',height:'100%',background:(v.color.hex||'').split('/')[1].trim(),float:'left'}}/></>
                      : <div style={{width:'100%',height:'100%',background:v.color.hex}}/>
                    }
                  </div>
                </div>
              </div>
              <div className="img-preview">{v.img ? <img src={v.img} alt="" /> : <Icon n="box" style={{ width: 20, opacity: .4 }} />}</div>
            </div>
            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{L('Detail image URLs (one per line)', 'روابط صور التفاصيل (كل رابط في سطر)')}</span>
                <label style={{ cursor: 'pointer', color: 'var(--maroon)', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  📎 {L('Upload details', 'رفع صور تفاصيل')}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      let uploadedCount = 0;
                      const newShots = [...(v.shots || [])];
                      files.forEach(file => {
                        handleImageUpload(file, (base64) => {
                          newShots.push(base64);
                          uploadedCount++;
                          if (uploadedCount === files.length) {
                            updVar(i, { shots: newShots.filter(Boolean) });
                          }
                        });
                      });
                    }}
                  />
                </label>
              </label>
              <textarea className="input" rows="2" value={(v.shots || []).join('\n')} onChange={e => updVar(i, { shots: e.target.value.split('\n') })} />
            </div>
            <label className="field-check" style={{ marginBottom: 0 }}>
              <input type="checkbox" checked={v.stock} onChange={e => updVar(i, { stock: e.target.checked })} />
              {L('In stock', 'متوفر')}
            </label>
          </div>
          </div>
        ))}
        <button className="btn btn-outline" onClick={addVar} style={{ marginTop: 4 }}><Icon n="plus" style={{ width: 16 }} />{L('Add color', 'أضف لون')}</button>
      </div>

      {/* specs */}
      <div className="adm-sec">
        <h4>{L('Specifications', 'المواصفات')}</h4>
        {Object.keys(f.specs).map(key => (
          <div className="adm-grid" key={key}>
            {field(SPEC_LABELS[key].en, f.specs[key].en, v => updSpec(key, 'en', v))}
            {field(SPEC_LABELS[key].ar, f.specs[key].ar, v => updSpec(key, 'ar', v))}
          </div>
        ))}
      </div>

      {/* Extra custom specs */}
      <div style={{marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--ink-soft)'}}>{L('Custom specifications','مواصفات مخصصة')}</span>
          <button type="button" className="btn btn-outline" style={{fontSize:12,padding:'5px 12px'}} onClick={()=>upd({extraSpecs:[...(f.extraSpecs||[]),{label:{en:'',ar:''},value:{en:'',ar:''}}]})}>
            + {L('Add row','أضف خانة')}
          </button>
        </div>
        {(f.extraSpecs||[]).map((s,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
            <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              <input className="input" placeholder={L('Label (EN)','الاسم (EN)')} value={s.label.en||''} onChange={e=>{const a=[...f.extraSpecs];a[i]={...a[i],label:{...a[i].label,en:e.target.value}};upd({extraSpecs:a});}} />
              <input className="input" placeholder={L('Label (AR)','الاسم (AR)')} dir="rtl" value={s.label.ar||''} onChange={e=>{const a=[...f.extraSpecs];a[i]={...a[i],label:{...a[i].label,ar:e.target.value}};upd({extraSpecs:a});}} />
              <input className="input" placeholder={L('Value (EN)','القيمة (EN)')} value={s.value.en||''} onChange={e=>{const a=[...f.extraSpecs];a[i]={...a[i],value:{...a[i].value,en:e.target.value}};upd({extraSpecs:a});}} />
              <input className="input" placeholder={L('Value (AR)','القيمة (AR)')} dir="rtl" value={s.value.ar||''} onChange={e=>{const a=[...f.extraSpecs];a[i]={...a[i],value:{...a[i].value,ar:e.target.value}};upd({extraSpecs:a});}} />
            </div>
            <button type="button" onClick={()=>{const a=[...f.extraSpecs];a.splice(i,1);upd({extraSpecs:a});}} style={{background:'none',border:'none',cursor:'pointer',color:'#e53935',fontSize:20,padding:'4px',marginTop:2}}>×</button>
          </div>
        ))}
      </div>

      <div className="adm-foot">
        <button className="btn btn-outline" onClick={onDone}>{L('Cancel', 'إلغاء')}</button>
        <button className="btn btn-primary" onClick={save}>{L('Save product', 'حفظ المنتج')}</button>
      </div>
    </div>
  );
};

/* ---------- Admin dashboard ---------- */
const AdminPage = () => {
  const { t, lang, money, navigate, products, saveProduct, deleteProduct, resetProducts,
    orders, updateOrder, deleteOrder, creds, setCreds, logout, categories } = useStore();
  const [tab, setTab] = adUS('products');
  const [editing, setEditing] = adUS(null);
  const [filterCat, setFilterCat] = adUS('all');
  const [sortProd, setSortProd] = adUS('sku');
  const [showReorder, setShowReorder] = adUS(false);
  const [reorderList, setReorderList] = adUS([]);
  const [dragIdx, setDragIdx] = adUS(null);
  const L = (en, ar) => t({ en, ar });

  return (
    <div className="admin">
      <div className="admin-bar">
        <div className="a-logo"><img src="https://juyub.odoo.com/web/image/1082" alt="" /> JUYUB · {L('Admin', 'الإدارة')}</div>
        <div className="admin-tabs">
          <button className={tab === 'products' ? 'active' : ''} onClick={() => { setTab('products'); setEditing(null); }}>{L('Products', 'المنتجات')}</button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => { setTab('orders'); setEditing(null); }}>{L('Orders', 'الأوردرات')} {orders.length > 0 && `(${orders.length})`}</button>
          <button className={tab === 'content' ? 'active' : ''} onClick={() => { setTab('content'); setEditing(null); }}>{L('Content', 'المحتوى')}</button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => { setTab('settings'); setEditing(null); }}>{L('Settings', 'الإعدادات')}</button>
          <button className={tab === 'analytics' ? 'active' : ''} onClick={() => { setTab('analytics'); setEditing(null); }}>{L('Analytics', 'الإحصائيات')}</button>
          <button className={tab === 'shipping' ? 'active' : ''} onClick={() => { setTab('shipping'); setEditing(null); }}>{L('Shipping', 'الشحن')}</button>
          <button className={tab === 'giup' ? 'active' : ''} onClick={() => { setTab('giup'); setEditing(null); }} style={{color: tab==='giup'?'#fff':'#A8324F', fontWeight:700}}>🦘 {L('JUYUB Biz', 'جيوب')}</button>
        </div>
        <div className="a-actions">
          <button className="a-btn" onClick={() => navigate('home')}>{L('View store', 'المتجر')}</button>
          <button className="a-btn" onClick={logout}>{L('Log out', 'خروج')}</button>
        </div>
      </div>

      <div className="admin-body">
        {tab === 'products' && (editing ? (
          <ProductEditor initial={editing} onDone={() => setEditing(null)} />
        ) : (
          <>
            <div className="admin-head">
              <div><h2 className="h2">{L('Products', 'المنتجات')}</h2><p className="muted">{products.length} {L('items', 'منتج')}</p></div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-outline" onClick={()=>{const feat=products.filter(p=>p.featured).sort((a,b)=>(a.sortOrder??999)-(b.sortOrder??999));setReorderList(feat);setShowReorder(true);}} style={{fontSize:13}}>★ {L('Reorder Featured','رتب المميزين')}</button>
                <button className="btn btn-primary" onClick={() => setEditing(blankProduct())}><Icon n="plus" style={{ width: 16 }} />{L('Add product', 'أضف منتج')}</button>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
              <button onClick={()=>setFilterCat('all')} style={{padding:'5px 14px',borderRadius:99,border:'1px solid',fontSize:13,cursor:'pointer',fontWeight:filterCat==='all'?700:400,borderColor:filterCat==='all'?'var(--maroon)':'var(--border)',background:filterCat==='all'?'var(--maroon)':'transparent',color:filterCat==='all'?'#fff':'var(--ink-soft)'}}>{L('All','الكل')}</button>
              {(categories||[]).filter(cat=>cat.id!=='all').map(cat=>(
                <button key={cat.id} onClick={()=>setFilterCat(cat.id)} style={{padding:'5px 14px',borderRadius:99,border:'1px solid',fontSize:13,cursor:'pointer',fontWeight:filterCat===cat.id?700:400,borderColor:filterCat===cat.id?'var(--maroon)':'var(--border)',background:filterCat===cat.id?'var(--maroon)':'transparent',color:filterCat===cat.id?'#fff':'var(--ink-soft)'}}>
                  {lang==='ar'?cat.ar:cat.en}
                </button>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}>
              <select value={sortProd} onChange={e=>setSortProd(e.target.value)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'inherit',background:'var(--bg)'}}>
                <option value="sku">{L('Sort by SKU (A→Z)','ترتيب بالكود (أ→ي)')}</option>
                <option value="sku_desc">{L('Sort by SKU (Z→A)','ترتيب بالكود (ي→أ)')}</option>
                <option value="name">{L('Sort by name (A→Z)','ترتيب بالاسم (أ→ي)')}</option>
                <option value="price_asc">{L('Price: Low to High','السعر: من الأقل')}</option>
                <option value="price_desc">{L('Price: High to Low','السعر: من الأعلى')}</option>
                <option value="newest">{L('Newest first','الأحدث أولاً')}</option>
                <option value="oldest">{L('Oldest first','الأقدم أولاً')}</option>
              </select>
            </div>
            <div className="adm-table">
              {[...products.filter(p=>filterCat==='all'||(Array.isArray(p.cats)?p.cats.includes(filterCat):p.cat===filterCat))].sort((a,b)=>{
                if(sortProd==='sku') return (a.sku||'').localeCompare(b.sku||'');
                if(sortProd==='sku_desc') return (b.sku||'').localeCompare(a.sku||'');
                if(sortProd==='name') return (a.name&&a.name.en||'').localeCompare(b.name&&b.name.en||'');
                if(sortProd==='price_asc') return (a.price||0)-(b.price||0);
                if(sortProd==='price_desc') return (b.price||0)-(a.price||0);
                if(sortProd==='newest') return (b.sortOrder??999)-(a.sortOrder??999);
                if(sortProd==='oldest') return (a.sortOrder??999)-(b.sortOrder??999);
                return 0;
              }).map(p => {
                const inStock = p.variants.some(v => v.stock);
                return (
                  <div className="adm-row" key={p.id} style={{opacity:p.hidden?0.4:1,filter:p.hidden?'grayscale(0.6)':'none'}}>
                    <div className="a-thumb"><img src={p.variants[0].img} alt="" /></div>
                    <div className="a-info">
                      <div className="a-name">{t(p.name) || L('(untitled)', '(بدون اسم)')}</div>
                      <div className="a-meta">{p.sku || '—'} · {t(categories.find(c => c.id === p.cat) || {})} · {p.variants.length} {L('colors', 'ألوان')}</div>
                    </div>
                    <span className={'a-pill ' + (inStock ? 'in' : 'out')}>{inStock ? L('In stock', 'متوفر') : L('Out', 'نفد')}</span>
                    <span className="a-price">{money(p.price)}</span>
                    <div className="adm-actions">
                      <button onClick={()=>{const latest=products.find(x=>x.id===p.id)||p;saveProduct({...latest,featured:!latest.featured});}} title={p.featured?L('Remove from featured','شيل من المميزين'):L('Add to featured','أضف للمميزين')}
                        style={{background:'none',border:'none',cursor:'pointer',fontSize:20,lineHeight:1,color:p.featured?'#f59e0b':'#ccc'}}>★</button>
                      <button onClick={()=>{const latest=products.find(x=>x.id===p.id)||p;saveProduct({...latest,hidden:!latest.hidden});}} title={p.hidden?L('Show product','إظهار المنتج'):L('Hide product','إخفاء المنتج')}
                        style={{background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                        <div style={{width:36,height:20,borderRadius:99,background:p.hidden?'#ccc':'#22c55e',position:'relative',transition:'background 0.2s'}}>
                          <div style={{position:'absolute',top:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s',left:p.hidden?'2px':'18px',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
                        </div>
                        <span style={{fontSize:9,color:p.hidden?'#999':'#22c55e',fontWeight:600}}>{p.hidden?L('Off','مخفي'):L('On','ظاهر')}</span>
                      </button>
                      <button className="a-iconbtn" onClick={() => setEditing(JSON.parse(JSON.stringify(products.find(x=>x.id===p.id)||p)))} title={L('Edit', 'تعديل')}><Icon n="edit" /></button>
                      <button className="a-iconbtn danger" onClick={() => { if (confirm(L('Delete this product?', 'تحذفي المنتج ده؟'))) deleteProduct(p.id); }} title={L('Delete', 'حذف')}><Icon n="trash" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ))}

        {showReorder && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowReorder(false)}>
            <div style={{background:'var(--bg)',borderRadius:16,padding:28,width:400,maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h3 style={{margin:0,fontSize:18,fontWeight:800}}>{L('Reorder Featured','رتب المميزين')}</h3>
                <button onClick={()=>setShowReorder(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'var(--ink-soft)'}}>×</button>
              </div>
              <p style={{fontSize:13,color:'var(--ink-soft)',marginBottom:16}}>{L('Drag to reorder','اسحب عشان ترتب')}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {reorderList.map((p,i)=>{
                  const img=p.variants&&p.variants[0]&&p.variants[0].img;
                  return (
                    <div key={p.id} draggable
                      onDragStart={()=>setDragIdx(i)}
                      onDragOver={e=>{e.preventDefault();if(dragIdx===null||dragIdx===i)return;const a=[...reorderList];const item=a.splice(dragIdx,1)[0];a.splice(i,0,item);setReorderList(a);setDragIdx(i);}}
                      onDragEnd={()=>setDragIdx(null)}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,border:'1px solid var(--border)',background:dragIdx===i?'var(--surface)':'var(--bg)',cursor:'grab',userSelect:'none'}}>
                      <span style={{color:'var(--ink-soft)',fontSize:16}}>⠿</span>
                      {img&&<img src={img} style={{width:40,height:40,borderRadius:8,objectFit:'cover'}}/>}
                      <span style={{fontSize:14,fontWeight:600,flex:1}}>{t(p.name)}</span>
                      <span style={{fontSize:12,color:'var(--ink-soft)'}}>#{i+1}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex',gap:10,marginTop:20}}>
                <button onClick={()=>setShowReorder(false)} className="btn btn-outline" style={{flex:1}}>{L('Cancel','إلغاء')}</button>
                <button onClick={()=>{reorderList.forEach((p,i)=>saveProduct({...p,sortOrder:i}));setShowReorder(false);}} className="btn btn-primary" style={{flex:1}}>{L('Save order','حفظ الترتيب')}</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && <OrdersPanel />}

        {tab === 'settings' && <AdminSettings />}
        {tab === 'content' && <ContentEditor />}
        {tab === 'analytics' && <AnalyticsPanel />}
        {tab === 'shipping' && <ShippingPanel />}
        {tab === 'giup' && <GiupPanel />}
      </div>
    </div>
  );
};

/* ---------- Analytics Panel ---------- */
const AnalyticsPanel = () => {
  const { t, lang, products } = useStore();
  const L = (en, ar) => t({ en, ar });
  const [data, setData] = adUS({});
  const [loading, setLoading] = adUS(true);
  const [chartRange, setChartRange] = adUS('7');
  const [selectedMonth, setSelectedMonth] = adUS(null);

  React.useEffect(() => {
    const db = window._juyubDb;
    if (!db) { setLoading(false); return; }
    const ref = db.ref('analytics');
    ref.on('value', snap => { setData(snap.val() || {}); setLoading(false); });
    return () => ref.off();
  }, []);

  const clear = () => {
    if (confirm(L('Clear all analytics data?', 'مسح كل بيانات الإحصائيات؟'))) {
      const db = window._juyubDb;
      if (db) db.ref('analytics').remove();
      setData({});
    }
  };

  const pageViews    = data.pageViews    || {};
  const productClicks = data.productClicks || {};
  const totalVisits  = data.totalVisits  || 0;
  const dailyVisits  = data.dailyVisits  || {};

  const sortedPages    = Object.entries(pageViews).sort((a,b) => b[1]-a[1]);
  const sortedProducts = Object.entries(productClicks).sort((a,b) => b[1]-a[1]);
  const sortedDays     = Object.entries(dailyVisits).sort((a,b) => a[0].localeCompare(b[0])).slice(-14);
  const maxDay         = sortedDays.length ? Math.max(...sortedDays.map(d=>d[1])) : 1;
  const maxPage        = sortedPages.length ? sortedPages[0][1] : 1;
  const maxProd        = sortedProducts.length ? sortedProducts[0][1] : 1;

  const productMap = {};
  (products || []).forEach(p => { productMap[p.id] = p; });

  const pageColors = ['#540b14','#7a1a26','#a02535','#c63044','#e03a50','#f06070','#f08090','#f0a0a8'];
  const pageIcons  = { home:'🏠', shop:'🛍️', product:'👜', about:'✨', shipping:'🚚', faq:'❓', checkout:'🛒', admin:'⚙️' };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:'var(--ink-soft)',fontSize:15}}>
      <span>⏳ {L('Loading analytics…','جاري تحميل الإحصائيات…')}</span>
    </div>
  );

  return (
    <div style={{padding:'32px 28px',maxWidth:960,fontFamily:'inherit'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
        <div>
          <h2 style={{margin:0,fontSize:26,fontWeight:800,color:'var(--ink)'}}>{L('Analytics','الإحصائيات')}</h2>
          <p style={{margin:'4px 0 0',fontSize:13,color:'var(--ink-soft)'}}>{L('Live data from Firebase — updates in real time','بيانات حية من Firebase — بتتحدث في الحال')}</p>
        </div>
        <button onClick={clear} style={{fontSize:12,padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--ink-soft)'}}>
          🗑 {L('Clear data','مسح البيانات')}
        </button>
      </div>

      {totalVisits === 0 ? (
        <div style={{textAlign:'center',padding:'80px 24px',color:'var(--ink-soft)'}}>
          <div style={{fontSize:56,marginBottom:16}}>📊</div>
          <p style={{fontSize:16,fontWeight:600}}>{L('No data yet','لا توجد بيانات بعد')}</p>
          <p style={{fontSize:13,marginTop:8}}>{L('Analytics data will appear here as visitors browse your store.','بيانات الإحصائيات هتظهر هنا لما الزوار يبدأوا يتصفحوا المتجر.')}</p>
        </div>
      ) : (<>

        {/* KPI Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:36}}>
          {[
            {icon:'👁', label:L('Total visits','إجمالي الزيارات'),   value:totalVisits, color:'#540b14'},
            {icon:'📄', label:L('Pages tracked','الصفحات'),           value:Object.keys(pageViews).length, color:'#7a3b1a'},
            {icon:'👜', label:L('Products clicked','منتجات اتضغط'), value:Object.keys(productClicks).length, color:'#1a4a7a'},
            {icon:'📅', label:L('Days tracked','أيام متتبعة'),        value:Object.keys(dailyVisits).length, color:'#1a6b3a'},
          ].map((card,i) => (
            <div key={i} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:'20px 22px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:28,marginBottom:8}}>{card.icon}</div>
              <div style={{fontSize:34,fontWeight:800,color:card.color,lineHeight:1}}>{card.value}</div>
              <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:6,fontWeight:500}}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Daily bar chart */}
        {(() => {
          const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
          const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
          const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const today = new Date();
          const todayKey = today.toISOString().slice(0,10);
          const BAR_H = 140;

          // ── Monthly view (when chartRange === 'all' and no month selected) ──
          if (chartRange === 'all' && !selectedMonth) {
            const monthMap = {};
            Object.entries(dailyVisits).forEach(([day, count]) => {
              const m = day.slice(0,7); // "2026-06"
              monthMap[m] = (monthMap[m]||0) + count;
            });
            const months = Object.keys(monthMap).sort();
            const maxM = Math.max(...months.map(m=>monthMap[m]), 1);
            return (
              <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:'24px',marginBottom:28,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                  <h4 style={{margin:0,fontSize:14,fontWeight:700,color:'var(--ink)',textTransform:'uppercase',letterSpacing:1}}>📈 {L('Visits','الزيارات')}</h4>
                  <div style={{display:'flex',gap:6}}>
                    {[['7',L('7 days','٧ أيام')],['14',L('14 days','١٤ يوم')],['30',L('30 days','٣٠ يوم')],['all',L('Months','الشهور')]].map(([v,label])=>(
                      <button key={v} onClick={()=>{setChartRange(v);setSelectedMonth(null);}} style={{padding:'5px 12px',borderRadius:7,border:'1px solid',fontSize:12,fontWeight:600,cursor:'pointer',
                        borderColor:chartRange===v?'#540b14':'var(--border)',background:chartRange===v?'#540b14':'transparent',color:chartRange===v?'#fff':'var(--ink-soft)'}}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {months.length === 0 ? <p style={{textAlign:'center',color:'var(--ink-soft)',padding:32}}>{L('No data yet','لا توجد بيانات بعد')}</p> : (
                  <div style={{display:'flex',alignItems:'flex-end',gap:8,height:BAR_H+'px'}}>
                    {months.map(m=>{
                      const count = monthMap[m];
                      const pct   = count/maxM;
                      const barH  = Math.max(24, Math.round(pct*(BAR_H-16)));
                      const [yr,mo] = m.split('-');
                      const moIdx = parseInt(mo)-1;
                      const isThisMonth = m === todayKey.slice(0,7);
                      return (
                        <div key={m} onClick={()=>setSelectedMonth(m)} title={L('Click to see days','اضغط لتفاصيل الأيام')}
                          style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',gap:0}}>
                          <div style={{width:'100%',borderRadius:'8px 8px 0 0',height:barH+'px',position:'relative',
                            background: isThisMonth?'linear-gradient(180deg,#e53935,#540b14)':'linear-gradient(180deg,#8b1a2a,#540b14)',
                            boxShadow:'0 2px 8px rgba(84,11,20,0.3)',transition:'opacity 0.2s'}}
                            onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
                            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                            {barH>=24 && <span style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',color:'#fff',fontSize:12,fontWeight:700}}>{count}</span>}
                          </div>
                          <div style={{marginTop:6,textAlign:'center'}}>
                            <div style={{fontSize:11,fontWeight:isThisMonth?700:500,color:isThisMonth?'#540b14':'var(--ink-soft)'}}>{lang==='ar'?MONTHS_AR[moIdx]:MONTHS_EN[moIdx]}</div>
                            <div style={{fontSize:10,color:'#bbb'}}>{yr}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p style={{textAlign:'center',fontSize:12,color:'var(--ink-soft)',marginTop:12}}>💡 {L('Click a month to see daily breakdown','اضغط على شهر لتفاصيل الأيام')}</p>
              </div>
            );
          }

          // ── Daily view (7 / 14 / 30 days OR drilled-down month) ──
          const allDays = [];
          if (selectedMonth) {
            // show all days of selected month
            const [yr, mo] = selectedMonth.split('-').map(Number);
            const daysInMonth = new Date(yr, mo, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
              const key = `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const d2  = new Date(yr, mo-1, day);
              allDays.push({ key, count: dailyVisits[key]||0, date: day, month: mo, dow: d2.getDay() });
            }
          } else {
            const rangeDays = parseInt(chartRange);
            for (let i = rangeDays-1; i >= 0; i--) {
              const d2 = new Date(today); d2.setDate(today.getDate()-i);
              const key = d2.toISOString().slice(0,10);
              allDays.push({ key, count: dailyVisits[key]||0, date: d2.getDate(), month: d2.getMonth()+1, dow: d2.getDay() });
            }
          }
          const chartMax = Math.max(...allDays.map(d=>d.count), 1);
          const barW = allDays.length <= 14 ? null : '28px';

          return (
            <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:'24px',marginBottom:28,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:8}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {selectedMonth && (
                    <button onClick={()=>setSelectedMonth(null)} style={{padding:'4px 10px',borderRadius:7,border:'1px solid var(--border)',fontSize:12,cursor:'pointer',background:'var(--surface)',color:'var(--ink-soft)'}}>
                      ← {L('Back to months','رجوع للشهور')}
                    </button>
                  )}
                  <h4 style={{margin:0,fontSize:14,fontWeight:700,color:'var(--ink)',textTransform:'uppercase',letterSpacing:1}}>
                    📈 {L('Visits','الزيارات')} {selectedMonth ? '— '+selectedMonth.slice(0,7) : ''}
                  </h4>
                </div>
                {!selectedMonth && (
                  <div style={{display:'flex',gap:6}}>
                    {[['7',L('7 days','٧ أيام')],['14',L('14 days','١٤ يوم')],['30',L('30 days','٣٠ يوم')],['all',L('Months','الشهور')]].map(([v,label])=>(
                      <button key={v} onClick={()=>{setChartRange(v);setSelectedMonth(null);}} style={{padding:'5px 12px',borderRadius:7,border:'1px solid',fontSize:12,fontWeight:600,cursor:'pointer',
                        borderColor:chartRange===v?'#540b14':'var(--border)',background:chartRange===v?'#540b14':'transparent',color:chartRange===v?'#fff':'var(--ink-soft)'}}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:4,height:BAR_H+'px',overflowX:'auto'}}>
                {allDays.map(({key,count,date,month,dow})=>{
                  const pct  = count>0 ? count/chartMax : 0;
                  const barH = count>0 ? Math.max(24,Math.round(pct*(BAR_H-16))) : 4;
                  const isToday = key===todayKey;
                  return (
                    <div key={key} title={key+': '+count} style={{flex: barW?'0 0 auto':'1',width:barW||'auto',display:'flex',flexDirection:'column',alignItems:'center',gap:0,minWidth:0}}>
                      <div style={{width:'100%',borderRadius:'6px 6px 0 0',height:barH+'px',position:'relative',
                        background: count===0?'#f0ebe6': isToday?'linear-gradient(180deg,#e53935,#540b14)':'linear-gradient(180deg,#8b1a2a,#540b14)',
                        border: isToday?'2px solid #e53935':'none', transition:'height 0.3s'}}>
                        {count>0 && barH>=24 && <span style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',color:'#fff',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{count}</span>}
                      </div>
                      <div style={{marginTop:5,textAlign:'center',lineHeight:1.2}}>
                        <div style={{fontSize:10,fontWeight:isToday?700:400,color:isToday?'#540b14':'var(--ink-soft)'}}>{month+'/'+date}</div>
                        <div style={{fontSize:9,color:isToday?'#540b14':'#ccc'}}>{lang==='ar'?DAYS_AR[dow]:DAYS_EN[dow]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:28}}>

          {/* Top pages horizontal bars */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h4 style={{margin:'0 0 18px',fontSize:14,fontWeight:700,color:'var(--ink)',textTransform:'uppercase',letterSpacing:1}}>
              📄 {L('Top pages','أكتر صفحات')}
            </h4>
            {sortedPages.slice(0,8).map(([page,count],i) => (
              <div key={page} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:13}}>
                  <span>{pageIcons[page]||'📌'} <span style={{textTransform:'capitalize',fontWeight:600}}>{page}</span></span>
                  <span style={{fontWeight:700,color:pageColors[i]||'#540b14'}}>{count}</span>
                </div>
                <div style={{height:6,borderRadius:99,background:'#f0ebe6',overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:99,background:pageColors[i]||'#540b14',width:(count/maxPage*100)+'%',transition:'width 0.5s'}} />
                </div>
              </div>
            ))}
          </div>

          {/* Top products with image */}
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h4 style={{margin:'0 0 18px',fontSize:14,fontWeight:700,color:'var(--ink)',textTransform:'uppercase',letterSpacing:1}}>
              👜 {L('Most clicked products','أكتر منتجات اتضغط')}</h4>
            {sortedProducts.slice(0,6).map(([id,count],i) => {
              const prod = productMap[id];
              const img  = prod && prod.variants && prod.variants[0] && prod.variants[0].img;
              const name = prod ? t(prod.name) : id;
              return (
                <div key={id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,padding:'8px 0',borderBottom:'1px solid #f5f0eb'}}>
                  {img
                    ? <img src={img} alt={name} style={{width:40,height:40,borderRadius:8,objectFit:'cover',background:'#f8f5f0'}} />
                    : <div style={{width:40,height:40,borderRadius:8,background:'#f0ebe6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>👜</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</div>
                    <div style={{height:4,borderRadius:99,background:'#f0ebe6',marginTop:4}}>
                      <div style={{height:'100%',borderRadius:99,background:'linear-gradient(90deg,#540b14,#a02535)',width:(count/maxProd*100)+'%'}} />
                    </div>
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:'#540b14',minWidth:24,textAlign:'right'}}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Analytics CTA */}
        <div style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',borderRadius:16,padding:'24px 28px',color:'#fff',display:'flex',alignItems:'center',gap:20,boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
          <div style={{fontSize:40}}>📊</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{L('Want deeper insights?','عايز تحليلات أعمق؟')}</div>
            <div style={{fontSize:13,opacity:0.8}}>{L('Google Analytics gives you visitor location, session duration, device type and much more.','Google Analytics بيديك موقع الزائر، وقت الجلسة، نوع الجهاز وأكتر بكتير.')}</div>
          </div>
          <a href="https://analytics.google.com" target="_blank" rel="noopener"
            style={{background:'#fff',color:'#1a1a2e',padding:'10px 20px',borderRadius:10,fontWeight:700,fontSize:13,textDecoration:'none',whiteSpace:'nowrap'}}>
            {L('Open Google Analytics','افتح Google Analytics')}
          </a>
        </div>

      </>)}
    </div>
  );
};


const AdminSettings = () => {
  const { t, lang, money, creds, setCreds, resetProducts, toast,
    categories, addCategory, deleteCategory, shipRates, saveShipRate, setAllShipRates,
    sheetUrl, setSheetUrl, firebaseConfig, setFirebaseConfig, db } = useStore();
  const [u, setU] = adUS(creds.user);
  const [p, setP] = adUS(creds.pass);
  const [sUrl, setSUrl] = adUS(sheetUrl || '');
  const [fbConfigStr, setFbConfigStr] = adUS(() => {
    return firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : '';
  });
  const [newCatEn, setNewCatEn] = adUS('');
  const [newCatAr, setNewCatAr] = adUS('');
  const [bulkRate, setBulkRate] = adUS('');
  const [freeAll, setFreeAll] = adUS(() => { try { return JSON.parse(localStorage.getItem('juyub_freeAll')||'false'); } catch{return false;} });
  const [freeGovs, setFreeGovs] = adUS(() => { try { return JSON.parse(localStorage.getItem('juyub_freeGovs')||'{}'); } catch{return {};} });
  const toggleFreeAll = () => { const n=!freeAll; setFreeAll(n); localStorage.setItem('juyub_freeAll', JSON.stringify(n)); };
  const toggleFreeGov = (g) => { const n={...freeGovs,[g]:!freeGovs[g]}; setFreeGovs(n); localStorage.setItem('juyub_freeGovs', JSON.stringify(n)); };
  const L = (en, ar) => t({ en, ar });
  return (
    <div className="adm-editor" style={{ maxWidth: 640 }}>
      <h3 className="h3">{L('Settings', 'الإعدادات')}</h3>

      {/* login */}
      <div className="adm-sec" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
        <h4>{L('Login details', 'بيانات الدخول')}</h4>
        <div className="adm-grid">
          <div className="field"><label>{L('Username', 'اسم المستخدم')}</label><input className="input" value={u} onChange={e => setU(e.target.value)} /></div>
          <div className="field"><label>{L('Password', 'كلمة السر')}</label><input className="input" type="password" value={p} onChange={e => setP(e.target.value)} /></div>
        </div>
        <button className="btn btn-primary" onClick={() => { setCreds({ user: u.trim(), pass: p }); toast(L('Login details saved', 'تم حفظ بيانات الدخول')); }}>{L('Save login', 'حفظ')}</button>
      </div>

      {/* google sheet */}
      <div className="adm-sec">
        <h4>{L('Google Sheet (orders export)', 'جوجل شيت (تصدير الأوردرات)')}</h4>
        <p className="muted" style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>{L('Every new order is added as a row in your sheet automatically. Paste your Apps Script web app link here.', 'كل أوردر جديد بيتسجّل كصف في الشيت أوتوماتيك. الصقي لينك الـ Web App بتاع Apps Script هنا.')}</p>
        <div className="field"><label>{L('Web app URL', 'لينك الـ Web App')}</label><input className="input" value={sUrl} onChange={e => setSUrl(e.target.value)} placeholder="https://script.google.com/macros/s/…/exec" /></div>
        <button className="btn btn-primary" onClick={() => { setSheetUrl(sUrl.trim()); toast(L('Sheet link saved', 'تم حفظ لينك الشيت')); }}>{L('Save sheet link', 'حفظ لينك الشيت')}</button>
      </div>

      {/* firebase database */}
      <div className="adm-sec">
        <h4>{L('Firebase Database (Realtime Database)', 'قاعدة بيانات فايربيس (Realtime Database)')}</h4>
        <p className="muted" style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
          {L('Enables real-time sync across devices. Paste your firebaseConfig object here.', 'لتفعيل المزامنة اللحظية بين الأجهزة. الصق كود firebaseConfig (كائن الـ JavaScript أو الـ JSON) هنا.')}
        </p>
        <div className="field">
          <label>{L('Firebase Configuration (JS object or JSON)', 'كود الإعدادات (firebaseConfig)')}</label>
          <textarea
            className="input"
            rows="6"
            style={{ fontFamily: 'monospace', fontSize: '12.5px', direction: 'ltr', textAlign: 'left' }}
            value={fbConfigStr}
            onChange={e => setFbConfigStr(e.target.value)}
            placeholder={`{\n  apiKey: "...",\n  authDomain: "...",\n  databaseURL: "...",\n  projectId: "...",\n  storageBucket: "...",\n  messagingSenderId: "...",\n  appId: "..."\n}`}
          />
        </div>
        <div className="adm-row-inline" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => {
            try {
              if (!fbConfigStr.trim()) {
                setFirebaseConfig(null);
                toast(L('Firebase disabled', 'تم إيقاف اتصال فايربيس'));
                return;
              }
              // Parse config safely
              let cleaned = fbConfigStr.trim();
              cleaned = cleaned.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
              cleaned = cleaned.replace(/;$/, '');
              const fn = new Function('return (' + cleaned + ')');
              const obj = fn();
              if (obj && typeof obj === 'object' && obj.databaseURL) {
                setFirebaseConfig(obj);
                toast(L('Firebase settings saved!', 'تم حفظ إعدادات فايربيس والاتصال!'));
              } else {
                alert(L('Invalid config object. Make sure databaseURL is present.', 'إعدادات غير صالحة. تأكد من وجود حقل databaseURL.'));
              }
            } catch (err) {
              alert(L('Error parsing config: ' + err.message, 'خطأ في قراءة الإعدادات: ' + err.message));
            }
          }}>{L('Connect to Firebase', 'اتصال بقاعدة البيانات')}</button>
          
          {db ? (
            <span className="a-pill in" style={{ height: '38px', display: 'inline-flex', alignItems: 'center', margin: 0 }}>
              🟢 {L('Connected', 'متصل')}
            </span>
          ) : (
            <span className="a-pill out" style={{ height: '38px', display: 'inline-flex', alignItems: 'center', margin: 0 }}>
              🔴 {L('Disconnected (Local Mode)', 'غير متصل (الوضع المحلي)')}
            </span>
          )}
        </div>
      </div>

      {/* categories moved to General tab in Content Editor */}
      {/* shipping moved to Shipping tab */}
      {/* reset */}
      <div className="adm-sec">
        <h4>{L('Catalog', 'الكتالوج')}</h4>
        <p className="muted" style={{ marginBottom: 14, fontSize: 14 }}>{L('Restore the original products that came with the store.', 'استرجاع المنتجات الأصلية اللي جت مع المتجر.')}</p>
        <button className="btn btn-outline" onClick={() => { if (confirm(L('Reset all products to defaults? Your edits will be lost.', 'استرجاع كل المنتجات للأصل؟ تعديلاتك هتتمسح.'))) { resetProducts(); toast(L('Products reset', 'تم الاسترجاع')); } }}>{L('Reset products to defaults', 'استرجاع المنتجات الأصلية')}</button>
      </div>
    </div>
  );
};

/* ---------- Orders panel ---------- */
const OrdersPanel = () => {
  const { t, lang, money, orders, updateOrder, deleteOrder } = useStore();
  const [sub, setSub] = adUS('new');
  const [openId, setOpenId] = adUS(null);
  const L = (en, ar) => t({ en, ar });

  const fmtDate = (ts) => {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return new Date(ts).toLocaleString(); }
  };
  const newOrders = orders.filter(o => o.status !== 'done');
  const doneOrders = orders.filter(o => o.status === 'done');
  const list = sub === 'new' ? newOrders : doneOrders;

  return (
    <>
      <div className="admin-head" style={{ marginBottom: 16 }}>
        <h2 className="h2">{L('Orders', 'الأوردرات')}</h2>
      </div>
      <div className="content-nav" style={{ marginBottom: 18 }}>
        <button className={sub === 'new' ? 'active' : ''} onClick={() => setSub('new')}>{L('In progress', 'تحت التنفيذ')} ({newOrders.length})</button>
        <button className={sub === 'done' ? 'active' : ''} onClick={() => setSub('done')}>{L('Fulfilled', 'تم تنفيذها')} ({doneOrders.length})</button>
      </div>

      {list.length === 0 ? (
        <div className="admin-empty"><Icon n="bag" style={{ width: 40, margin: '0 auto 12px', opacity: .4 }} /><p>{sub === 'new' ? L('No orders in progress.', 'لا توجد أوردرات تحت التنفيذ.') : L('No fulfilled orders yet.', 'لا توجد أوردرات متنفّذة.')}</p></div>
      ) : (
        <div className="ord-list">
          {list.map(o => {
            const open = openId === o.id;
            const count = (o.items || []).reduce((s, i) => s + i.qty, 0);
            return (
              <div className={'ord-card' + (open ? ' open' : '')} key={o.id}>
                <button className="ord-head" onClick={() => setOpenId(open ? null : o.id)}>
                  <div className="ord-thumbs">
                    {(o.items || []).slice(0, 3).map((it, i) => <span className="ord-thumb" key={i}><img src={it.img} alt="" /></span>)}
                    {(o.items || []).length > 3 && <span className="ord-more">+{o.items.length - 3}</span>}
                  </div>
                  <div className="ord-main">
                    <div className="ord-line1">
                      <strong>#{o.id}</strong>
                      <span className={'a-pill ' + (o.status === 'done' ? 'in' : 'out')}>{o.status === 'done' ? L('Fulfilled', 'تم') : L('New', 'جديد')}</span>
                    </div>
                    <div className="ord-line2">{o.f.name} · {count} {L('item(s)', 'قطعة')}</div>
                    <div className="ord-date">{fmtDate(o.at)}</div>
                  </div>
                  <div className="ord-right">
                    <span className="a-price">{money(o.total)}</span>
                    <Icon n="arrow" className={'ord-chev' + (open ? ' up' : '')} style={{ width: 18 }} />
                  </div>
                </button>

                {open && (
                  <div className="ord-detail">
                    <div className="ord-items">
                      {(o.items || []).map((it, i) => (
                        <div className="ord-item" key={i}>
                          <span className="ord-item-img"><img src={it.img} alt="" /></span>
                          <div className="ord-item-info">
                            <div className="ord-item-name">{t(it.name)}</div>
                            <div className="a-meta">{t(it.color)}{it.size ? ' · ' + t(it.size) : ''} · ×{it.qty}</div>
                          </div>
                          <span className="ord-item-price">{money(it.price * it.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ord-grid">
                      <div className="ord-field"><span className="ord-k">{L('Phone', 'الموبايل')}</span><a className="ord-v" href={'tel:' + o.f.phone} dir="ltr">{o.f.phone}</a></div>
                      <div className="ord-field"><span className="ord-k">{L('Governorate', 'المحافظة')}</span><span className="ord-v">{o.f.gov}{o.f.city ? ' · ' + o.f.city : ''}</span></div>
                      <div className="ord-field" style={{ gridColumn: '1 / -1' }}><span className="ord-k">{L('Address', 'العنوان')}</span><span className="ord-v">{o.f.address}</span></div>
                      {o.f.notes && <div className="ord-field" style={{ gridColumn: '1 / -1' }}><span className="ord-k">{L('Notes', 'ملاحظات')}</span><span className="ord-v">{o.f.notes}</span></div>}
                      <div className="ord-field"><span className="ord-k">{L('Ordered on', 'تاريخ الطلب')}</span><span className="ord-v">{fmtDate(o.at)}</span></div>
                      <div className="ord-field"><span className="ord-k">{L('Payment', 'الدفع')}</span><span className="ord-v">
                        {o.payMethod === 'instapay' ? L('InstaPay', 'انستاباي') : L('Cash on delivery', 'عند الاستلام')}
                      </span></div>
                    </div>

                    <div className="ord-totals">
                      <div className="summary-row"><span>{L('Subtotal', 'الإجمالي الفرعي')}</span><span>{money(o.total - o.shipping)}</span></div>
                      <div className="summary-row"><span>{L('Shipping', 'الشحن')}</span><span>{o.shipping ? money(o.shipping) : L('Free', 'مجاني')}</span></div>
                      <div className="summary-row total"><span>{L('Total', 'الإجمالي')}</span><span>{money(o.total)}</span></div>
                    </div>

                    <div className="ord-actions">
                      <a className="btn btn-wa" href={'https://wa.me/2' + (o.f.phone || '').replace(/^0/, '')} target="_blank" rel="noopener"><Icon n="chat" style={{ width: 18 }} />{L('Contact customer', 'كلّمي العميلة')}</a>
                      <button className="btn btn-outline" onClick={() => updateOrder(o.id, { status: o.status === 'done' ? 'new' : 'done' })}>
                        <Icon n="check" style={{ width: 17 }} />{o.status === 'done' ? L('Mark as in progress', 'رجّعيها تحت التنفيذ') : L('Mark as fulfilled', 'تم تنفيذها')}
                      </button>
                      <button className="btn btn-outline ord-del" onClick={() => { if (confirm(L('Delete this order?', 'تحذفي الأوردر؟'))) deleteOrder(o.id); }}><Icon n="trash" style={{ width: 17 }} />{L('Delete', 'حذف')}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};


/* ---------- Shipping Panel ---------- */
const ShippingPanel = () => {
  const { t, lang, shipRates, saveShipRate, setAllShipRates } = useStore();
  const L = (en, ar) => t({ en, ar });
  const [freeAll,  setFreeAll]  = adUS(() => { try { return JSON.parse(localStorage.getItem('juyub_freeAll') ||'false'); } catch{return false;} });
  const [freeGovs, setFreeGovs] = adUS(() => { try { return JSON.parse(localStorage.getItem('juyub_freeGovs')||'{}');   } catch{return {};} });
  const [bulkRate, setBulkRate] = adUS('');

  const toggleFreeAll = () => {
    const n = !freeAll;
    setFreeAll(n);
    localStorage.setItem('juyub_freeAll', JSON.stringify(n));
    if (n) { const all={}; GOVERNORATES.forEach(g=>all[g]=true); setFreeGovs(all); localStorage.setItem('juyub_freeGovs', JSON.stringify(all)); }
    else   { setFreeGovs({}); localStorage.setItem('juyub_freeGovs', '{}'); }
  };
  const toggleFreeGov = (g) => {
    const n = {...freeGovs, [g]: !freeGovs[g]};
    setFreeGovs(n);
    localStorage.setItem('juyub_freeGovs', JSON.stringify(n));
    const allFree = GOVERNORATES.every(gov => n[gov]);
    setFreeAll(allFree);
    localStorage.setItem('juyub_freeAll', JSON.stringify(allFree));
  };

  return (
    <div style={{padding:'28px 24px', maxWidth:720}}>
      <h3 className="h3" style={{marginBottom:6}}>{L('Shipping Prices', 'أسعار الشحن')}</h3>
      <p className="muted" style={{fontSize:13,marginBottom:24}}>{L('Prices are saved. Free toggle overrides to 0 without losing the price.','الأسعار محفوظة. زرار مجاني بيتجاهل السعر بدون ما يمسحه.')}</p>

      {/* Global free shipping banner */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderRadius:14,marginBottom:24,
        background: freeAll ? 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' : 'linear-gradient(135deg,#fff8f8,#fdecea)',
        border:'2px solid', borderColor: freeAll?'#81c784':'#ef9a9a', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:freeAll?'#1b5e20':'#b71c1c'}}>{freeAll ? '🎉 '+L('Free shipping active for ALL governorates','الشحن المجاني فعّال لكل المحافظات') : '📦 '+L('Free shipping for all governorates','شحن مجاني لكل المحافظات')}</div>
          <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:4}}>{L('Toggle all at once — prices remain saved','فعّل أو قفل الكل دفعة واحدة — الأسعار بتفضل محفوظة')}</div>
        </div>
        <button onClick={toggleFreeAll} style={{padding:'10px 22px',borderRadius:10,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
          background: freeAll?'#2e7d32':'#540b14', color:'#fff', whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
          {freeAll ? L('✓ Disable all','✓ قفل الكل') : L('Enable all free','فعّل الكل مجاني')}
        </button>
      </div>

      {/* Bulk price setter */}
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:24,padding:'14px 18px',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)'}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--ink)',whiteSpace:'nowrap'}}>{L('Set all prices to:','اضبط كل الأسعار على:')}</span>
        <input type="number" value={bulkRate} onChange={e=>setBulkRate(e.target.value)} placeholder="70"
          style={{width:90,padding:'8px 12px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,fontFamily:'inherit'}} />
        <span style={{fontSize:13,color:'var(--ink-soft)'}}>{L('LE','ج.م')}</span>
        <button onClick={()=>{ if(bulkRate!=='') { setAllShipRates(Number(bulkRate)); setBulkRate(''); }}}
          style={{padding:'8px 18px',borderRadius:8,background:'var(--maroon)',color:'#fff',border:'none',cursor:'pointer',fontWeight:600,fontSize:13}}>
          {L('Apply to all','طبّق على الكل')}
        </button>
      </div>

      {/* Governorate cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:10}}>
        {GOVERNORATES.map(g => {
          const isFree = freeAll || freeGovs[g];
          return (
            <div key={g} onClick={()=>toggleFreeGov(g)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 18px', borderRadius:12, cursor:'pointer',
              border:'2px solid', borderColor: isFree?'#81c784':'var(--border)',
              background: isFree?'linear-gradient(135deg,#f1f8f1,#e8f5e9)':'var(--bg)',
              boxShadow: isFree?'0 2px 10px rgba(46,125,50,0.12)':'0 1px 4px rgba(0,0,0,0.04)',
              transition:'all 0.2s'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
                  background: isFree?'#c8e6c9':'var(--surface)'}}>
                  {isFree?'🎉':'📦'}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:'var(--ink)'}}>{lang==='ar'?(GOV_AR[g]||g):g}</div>
                  <div style={{fontSize:12,color: isFree?'#2e7d32':'var(--ink-soft)',marginTop:2}}>
                    {isFree ? L('Free shipping','شحن مجاني') : (shipRates[g]??0)+' '+(lang==='ar'?'ج.م':'LE')}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <input type="number" value={shipRates[g]??0}
                  onClick={e=>e.stopPropagation()}
                  onChange={e=>{e.stopPropagation(); saveShipRate(g,e.target.value);}}
                  style={{width:72,padding:'6px 10px',borderRadius:8,border:'1px solid var(--border)',fontSize:13,fontFamily:'inherit',textAlign:'center',opacity:isFree?0.4:1}} />
                <span style={{fontSize:12,color:'var(--ink-soft)'}}>{lang==='ar'?'ج.م':'LE'}</span>
                <div style={{width:52,height:26,borderRadius:99,position:'relative',cursor:'pointer',transition:'background 0.2s',
                  background: isFree?'#43a047':'#ccc'}}>
                  <div style={{position:'absolute',top:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',
                    left: isFree?'28px':'4px', boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { LoginModal, AdminPage, OrdersPanel });
