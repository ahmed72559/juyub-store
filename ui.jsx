// ============ JUYUB — shared UI components ============
const { useState, useEffect, useRef, useContext } = React;

// store hook — context is created in app.jsx
const useStore = () => useContext(window.JUYUB_CTX);

/* ---------- Icons ---------- */
const Icon = ({ n, ...p }) => {
  const paths = {
    bag: <><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    heart: <path d="M12 20s-7-4.6-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7-1.5C19 10.4 12 20 12 20Z" />,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    arrowL: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
    check: <path d="m4 12 5 5L20 6" />,
    minus: <path d="M5 12h14" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    truck: <><path d="M2 7h11v9H2z" /><path d="M13 10h4l3 3v3h-7" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></>,
    shield: <><path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    chat: <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19l1-4.3A7.5 7.5 0 1 1 20 11.5Z" />,
    whatsapp: <path d="M12.04 2.5a9.4 9.4 0 0 0-8.06 14.2L2.5 21.5l4.93-1.43A9.4 9.4 0 1 0 12.04 2.5Zm0 1.7a7.7 7.7 0 0 1 5.46 13.15A7.7 7.7 0 0 1 7.9 18.4l-.35-.2-2.92.84.83-2.85-.22-.37A7.7 7.7 0 0 1 12.04 4.2Zm-2.6 3.4c-.13 0-.34.05-.52.24-.18.2-.68.67-.68 1.62 0 .96.7 1.88.8 2.01.1.13 1.37 2.18 3.4 2.97 1.68.66 2.02.53 2.39.5.36-.04 1.18-.49 1.35-.95.17-.47.17-.87.12-.95-.05-.09-.18-.14-.38-.24-.2-.1-1.18-.58-1.36-.65-.18-.06-.31-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.42.05-.2-.1-.84-.31-1.6-.99-.59-.53-.99-1.18-1.1-1.38-.12-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.34.06-.13.03-.25-.02-.35-.05-.1-.44-1.1-.62-1.5-.16-.39-.32-.34-.44-.34l-.38-.01Z" fill="currentColor" stroke="none" />,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></>,
    facebook: <path d="M14 8h2V5h-2.2C11.7 5 11 6.5 11 8v1.5H9V12h2v7h3v-7h2.2l.3-2.5H14V8.4c0-.3.3-.4.6-.4Z" fill="currentColor" stroke="none" />,
    tiktok: <path d="M14 4c.4 2.2 1.8 3.6 4 3.8v2.6c-1.4 0-2.7-.4-4-1.2v5.3a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .9.1v2.7a2.6 2.6 0 1 0 1.8 2.4V4H14Z" fill="currentColor" stroke="none" />,
    sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
    leaf: <><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14Z" /><path d="M5 19c4-4 8-6 11-7" /></>,
    return: <><path d="M4 9h11a4 4 0 0 1 0 8h-3" /><path d="m8 5-4 4 4 4" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    gauge: <><path d="M5 18a8 8 0 1 1 14 0" /><path d="M12 14l3.5-3" /></>,
    edit: <><path d="M14 5l4 4-9.5 9.5L4 20l1.5-4.5L14 5Z" /></>,
    trash: <><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 13h8l1-13" /></>,
    box: <><path d="M3 8l9-4 9 4-9 4-9-4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" {...p}>{paths[n]}</svg>
  );
};

/* ---------- Logo ---------- */
const Logo = ({ variant }) => {
  const { navigate, dir } = useStore();
  // dir B header is maroon -> cream logo; else maroon logo
  const src = variant === 'cream' ? 'https://juyub.odoo.com/web/image/1084'
            : (dir === 'b' ? 'https://juyub.odoo.com/web/image/1084' : 'https://juyub.odoo.com/web/image/1085');
  return (
    <button className="brand" onClick={() => navigate('home')} aria-label="JUYUB home">
      <img src="https://juyub.odoo.com/web/image/1082" alt="" style={{ height: 40 }} />
      <span className="brand-word">JUYUB</span>
    </button>
  );
};

/* ---------- Header ---------- */
const Header = () => {
  const { route, navigate, lang, setLang, cart, openCart, t, content, products } = useStore();
  const [mnav, setMnav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchResults = React.useMemo(() => {
    if (!searchQ.trim()) return [];
    const q = searchQ.toLowerCase();
    return (products || []).filter(p =>
      t(p.name).toLowerCase().includes(q) ||
      t(p.tagline || {en:'',ar:''}).toLowerCase().includes(q) ||
      (p.cat || '').toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQ, products, lang]);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const links = [
    ['home', { en: 'Home', ar: 'الرئيسية' }],
    ['shop', { en: 'Shop', ar: 'المتجر' }],
    ['about', { en: 'About', ar: 'عن چيوب' }],
    ['shipping', { en: 'Shipping', ar: 'الشحن' }],
    ['faq', { en: 'Q&A', ar: 'أسئلة' }],
  ];
  const go = (r) => { setMnav(false); navigate(r); };
  return (
    <>
      <div className="announce">{t(content.announce || { en: '', ar: '' })}</div>
      <header className="hdr">
        <div className="hdr-inner">
          <button className="icon-btn burger" onClick={() => setMnav(true)} aria-label="Menu"><Icon n="menu" /></button>
          <Logo />
          <nav className="nav">
            {links.map(([r, l]) => (
              <a key={r} className={route.name === r ? 'active' : ''} onClick={() => navigate(r)}>{t(l)}</a>
            ))}
          </nav>
          <div className="hdr-actions">
            <button className="lang-toggle desk" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
            <button className="icon-btn" aria-label="Search" onClick={() => { setSearchOpen(s => !s); setSearchQ(''); }}><Icon n="search" /></button>
            <button className="icon-btn" onClick={openCart} aria-label="Cart">
              <Icon n="bag" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>
      {searchOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:999,background:'rgba(0,0,0,0.5)'}} onClick={() => setSearchOpen(false)}>
          <div style={{background:'var(--bg)',padding:'20px 24px',boxShadow:'0 4px 24px rgba(0,0,0,0.15)'}} onClick={e => e.stopPropagation()}>
            <div style={{maxWidth:640,margin:'0 auto',position:'relative'}}>
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                onKeyDown={e => { if(e.key==='Escape') setSearchOpen(false); }}
                placeholder={t({en:'Search products…', ar:'ابحث عن منتج…'})}
                style={{width:'100%',padding:'14px 48px 14px 18px',borderRadius:12,border:'2px solid var(--maroon)',fontSize:16,outline:'none',fontFamily:'inherit',boxSizing:'border-box',background:'var(--bg)',color:'var(--ink)'}} />
              <button onClick={() => setSearchOpen(false)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ink-soft)',fontSize:20}}>✕</button>
            </div>
            {searchResults.length > 0 && (
              <div style={{maxWidth:640,margin:'8px auto 0',background:'var(--bg)',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,0.1)'}}>
                {searchResults.map(p => {
                  const img = p.variants && p.variants[0] && p.variants[0].img;
                  return (
                    <div key={p.id} onClick={() => { navigate('product',{id:p.id}); setSearchOpen(false); setSearchQ(''); }}
                      style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',cursor:'pointer',borderBottom:'1px solid var(--border)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--surface)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {img ? <img src={img} alt={t(p.name)} style={{width:44,height:44,borderRadius:8,objectFit:'cover',background:'var(--surface)'}} />
                            : <div style={{width:44,height:44,borderRadius:8,background:'var(--surface)',display:'flex',alignItems:'center',justifyContent:'center'}}>👜</div>}
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:'var(--ink)'}}>{t(p.name)}</div>
                        <div style={{fontSize:12,color:'var(--ink-soft)',marginTop:2}}>{t(p.tagline||{en:'',ar:''})}</div>
                      </div>
                      <div style={{fontWeight:700,color:'var(--maroon)',fontSize:14}}>{p.price} {t({en:'LE',ar:'ج.م'})}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {searchQ.trim() && searchResults.length === 0 && (
              <div style={{maxWidth:640,margin:'8px auto 0',textAlign:'center',padding:'20px',color:'var(--ink-soft)',fontSize:14}}>
                {t({en:'No products found for "'+searchQ+'"', ar:'مفيش منتجات لـ "'+searchQ+'"'})}
              </div>
            )}
          </div>
        </div>
      )}
      {mnav && (
        <div className="mnav">
          <div className="row between" style={{ marginBottom: 20 }}>
            <Logo />
            <button className="icon-btn" onClick={() => setMnav(false)}><Icon n="close" /></button>
          </div>
          {links.map(([r, l]) => <a key={r} onClick={() => go(r)}>{t(l)}</a>)}
          <button className="lang-toggle" style={{ marginTop: 24, alignSelf: 'flex-start' }}
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      )}
    </>
  );
};

/* ---------- Marquee ---------- */
const Marquee = () => {
  const { t, content } = useStore();
  const items = (content.marquee && content.marquee.length) ? content.marquee : [
    { en: 'Carry Your Confidence', ar: 'احملي ثقتك' },
  ];
  const set = (
    <span>{items.map((it, i) => <React.Fragment key={i}>{t(it)}<span className="dot" /></React.Fragment>)}</span>
  );
  return <div className="marquee"><div className="marquee-track">{set}{set}</div></div>;
};

/* ---------- Product card ---------- */

/* Split swatch: if hex contains "/" renders two half-circles */
const SwatchDot = ({ hex, className, style, onClick, title }) => {
  const parts = (hex || '').split('/').map(s => s.trim());
  if (parts.length >= 2) {
    return (
      <span className={className} style={{ ...style, background: 'none', overflow: 'hidden', position: 'relative' }} onClick={onClick} title={title}>
        <span style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)', background: parts[0] }} />
        <span style={{ position: 'absolute', inset: 0, clipPath: 'polygon(50% 0,100% 0,100% 100%,50% 100%)', background: parts[1] }} />
      </span>
    );
  }
  return <span className={className} style={{ ...style, background: hex }} onClick={onClick} title={title} />;
};

const ProductCard = ({ p }) => {
  const { navigate, t, money, addToCart, toast, showBadges, categories } = useStore();
  const v = p.variants[0];
  const anyStock = p.variants.some(x => x.stock);
  const cat = (categories || CATEGORIES).find(c => c.id === p.cat);
  const onSale = p.compareAt > p.price;
  return (
    <article className="card" onClick={() => navigate('product', { id: p.id })}>
      <div className="card-media">
        {onSale && <span className="card-tag sale">-{Math.round((1 - p.price / p.compareAt) * 100)}%{p.onSale ? ' · '+t({en:'On Sale',ar:'تخفيض'}) : ''}</span>}
        {!onSale && p.featured   && showBadges !== false && <span className="card-tag">{t({en:'Bestseller',ar:'الأكثر مبيعاً'})}</span>}
        {!onSale && p.juyubPicks && showBadges !== false && <span className="card-tag">{t({en:'JUYUB Picks',ar:'مختارات جيوب'})}</span>}
        {!onSale && p.newArrival && showBadges !== false && <span className="card-tag">{t({en:'New Arrival',ar:'وصل حديثاً'})}</span>}
        {!onSale && p.limitedEd  && showBadges !== false && <span className="card-tag">{t({en:'Limited Edition',ar:'إصدار محدود'})}</span>}
        <button className="card-fav" onClick={(e) => e.stopPropagation()} aria-label="Save"><Icon n="heart" /></button>
        <img src={v.img} alt={t(p.name)} />
        {!anyStock && <div className="card-oos"><span>{t({ en: 'Out of stock', ar: 'نفد المخزون' })}</span></div>}
        {anyStock && (
          <div className="card-quick" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-primary btn-block" onClick={() => { addToCart(p, p.variants.find(x => x.stock), 1); toast(t({ en: 'Added to cart', ar: 'اتضاف للسلة' })); }}>
              {t({ en: 'Quick add', ar: 'أضف بسرعة' })}
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <span className="card-cat">{t(cat)}</span>
        <h3 className="card-name">{t(p.name)}</h3>
        <div className="row between">
          <span className="card-price">
            {money(p.price)}
            {onSale && <span className="price-was">{money(p.compareAt)}</span>}
          </span>
          {p.variants.length > 1 && (
            <div className="card-swatches">
              {p.variants.map((x, i) => <SwatchDot key={i} className="sw" hex={x.color.hex} title={t(x.color)} />)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/* ---------- Footer ---------- */
const Footer = () => {
  const { t, navigate, isAdmin, setLoginOpen, content, categories } = useStore();
  const fc = content.footer || {};
  const social = fc.social || {};
  const col = (head, links) => (
    <div>
      <h4>{t(head)}</h4>
      {links.map(([l, r], i) => <a key={i} onClick={() => navigate(r)}>{t(l)}</a>)}
    </div>
  );
  const goCat = (catId) => { navigate('shop', catId && catId !== 'all' ? { cat: catId } : {}); };
  const shopCats = (categories || CATEGORIES).filter(c => c.id !== 'all');
  const shopLinks = [{ id: 'all', label: { en: 'All bags', ar: 'كل الشنط' } }, ...shopCats.map(c => ({ id: c.id, label: c }))];
  const socials = [
    ['instagram', 'instagram', 'Instagram'],
    ['tiktok', 'tiktok', 'TikTok'],
    ['facebook', 'facebook', 'Facebook'],
    ['whatsapp', 'whatsapp', 'WhatsApp'],
  ].filter(([key]) => (social[key] || '').trim());
  const wa = (social.whatsapp || '').trim();
  return (
    <footer className="ftr">
      <div className="ftr-pattern" />

      {/* DESKTOP: original 3-col grid — hidden on mobile via CSS */}
      <div className="ftr-inner ftr-desk">
        <div className="ftr-logo">
          <img src="https://juyub.odoo.com/web/image/1084" alt="JUYUB" />
          <p className="ftr-tag">{t(fc.tagline || { en: '', ar: '' })}</p>
        </div>
        <div>
          <h4>{t({ en: 'Shop', ar: 'تسوّقي' })}</h4>
          <div className={'ftr-shoplinks' + (shopLinks.length > 4 ? ' two-col' : '')}>
            {shopLinks.map((l) => <a key={l.id} onClick={() => goCat(l.id)}>{t(l.label)}</a>)}
          </div>
        </div>
        {col({ en: 'Help', ar: 'مساعدة' }, [
          [{ en: 'About JUYUB', ar: 'عن چيوب' }, 'about'],
          [{ en: 'Shipping info', ar: 'معلومات الشحن' }, 'shipping'],
          [{ en: 'Q & A', ar: 'الأسئلة الشائعة' }, 'faq'],
        ])}
      </div>

      {/* MOBILE: centered logo + cards + WA — hidden on desktop via CSS */}
      <div className="ftr-inner ftr-mob">
        <div className="ftr-logo-block">
          <img src="https://juyub.odoo.com/web/image/1084" alt="JUYUB" className="ftr-logo-img" />
          <p className="ftr-tag">{t(fc.tagline || { en: '', ar: '' })}</p>
        </div>
        <div className="ftr-cards">
          <div className="ftr-card">
            <span className="ftr-card-head">{t({ en: 'SHOP', ar: 'تسوّقي' })}</span>
            <div className={'ftr-shoplinks' + (shopLinks.length > 4 ? ' two-col' : '')}>
              {shopLinks.map((l) => <a key={l.id} onClick={() => goCat(l.id)}>{t(l.label)}</a>)}
            </div>
          </div>
          <div className="ftr-card">
            <span className="ftr-card-head">{t({ en: 'HELP', ar: 'مساعدة' })}</span>
            {[[{ en: 'About JUYUB', ar: 'عن چيوب' }, 'about'],[{ en: 'Shipping info', ar: 'معلومات الشحن' }, 'shipping'],[{ en: 'Q & A', ar: 'الأسئلة الشائعة' }, 'faq']].map(([l, r], i) => <a key={i} onClick={() => navigate(r)}>{t(l)}</a>)}
          </div>
        </div>
        {wa && (
          <div className="ftr-wa-row">
            <a className="ftr-wa-btn" href={wa} target="_blank" rel="noopener">
              <Icon n="whatsapp" style={{ width: 19, height: 19 }} />
              {t({ en: 'Chat with us', ar: 'كلمينا على واتساب' })}
            </a>
          </div>
        )}
      </div>

      {/* DESKTOP bottom bar — hidden on mobile */}
      <div className="ftr-bottom ftr-bottom-desk">
        <span>{t(fc.founded) ? t(fc.founded) : <>© {new Date().getFullYear()} JUYUB</>} · <a href="https://www.linkedin.com/in/ahmed-aboshady-55751023a/" target="_blank" rel="noopener" style={{color:'inherit',textDecoration:'underline'}}>{t({ en: 'Made by Ahmed Abo Shady', ar: 'صنع بواسطه احمد ابو شادي' })}</a></span>
        {socials.length > 0 && (
          <div className="ftr-social">
            {socials.map(([key, icon, label]) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener" aria-label={label}><Icon n={icon} /></a>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE bottom bar — hidden on desktop */}
      <div className="ftr-bottom ftr-bottom-mob">
        <div className="ftr-bottom-row">
          {socials.length > 0 && (
            <div className="ftr-social">
              {socials.map(([key, icon, label]) => (
                <a key={key} href={social[key]} target="_blank" rel="noopener" aria-label={label}><Icon n={icon} /></a>
              ))}
            </div>
          )}
        </div>
        <div className="ftr-copy">
          <span>{t(fc.founded) ? t(fc.founded) : <>© {new Date().getFullYear()} JUYUB</>}</span>
          <span className="ftr-copy-sep">·</span>
          <a href="https://www.linkedin.com/in/ahmed-aboshady-55751023a/" target="_blank" rel="noopener" className="ftr-copy-link">{t({ en: 'Made by Ahmed Abo Shady', ar: 'صنع بواسطه احمد ابو شادي' })}</a>
        </div>
      </div>
    </footer>
  );
};

/* ---------- Floating social rail ---------- */
const FloatingSocial = () => {
  const { content, route } = useStore();
  const social = (content.footer && content.footer.social) || {};
  const [open, setOpen] = useState(false);
  if (route.name === 'admin' || route.name === 'checkout') return null;
  const wa = (social.whatsapp || '').trim();
  const others = [
    ['instagram', 'instagram', 'Instagram'],
    ['tiktok', 'tiktok', 'TikTok'],
    ['facebook', 'facebook', 'Facebook'],
  ].filter(([key]) => (social[key] || '').trim());
  if (!wa && others.length === 0) return null;
  return (
    <div className={'fsocial' + (open ? ' open' : '')}>
      {others.length > 0 && (
        <div className="fsocial-stack">
          {others.map(([key, icon, label]) => (
            <a key={key} className={'fsocial-btn fs-' + key} href={social[key]} target="_blank" rel="noopener" aria-label={label} tabIndex={open ? 0 : -1}><Icon n={icon} /></a>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <button className="fsocial-btn fsocial-toggle" onClick={() => setOpen(o => !o)} aria-label="Social links" aria-expanded={open}>
          <Icon n={open ? 'close' : 'plus'} />
        </button>
      )}
      {wa && (
        <a className="fsocial-btn fsocial-wa" href={wa} target="_blank" rel="noopener" aria-label="WhatsApp">
          <span className="fsocial-ping" />
          <Icon n="whatsapp" />
        </a>
      )}
    </div>
  );
};

/* ---------- Cart drawer ---------- */
const CartDrawer = () => {
  const { cart, closeCart, t, money, updateQty, removeItem, navigate, subtotal } = useStore();
  return (
    <>
      <div className="scrim" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-label="Cart">
        <div className="drawer-head">
          <h3 className="h3">{t({ en: 'Your bag', ar: 'سلتك' })}</h3>
          <button className="icon-btn" onClick={closeCart}><Icon n="close" /></button>
        </div>
        {cart.length === 0 ? (
          <div className="drawer-body">
            <div className="cart-empty">
              <img src="https://juyub.odoo.com/web/image/1082" alt="" />
              <p>{t({ en: 'Your bag is empty.', ar: 'سلتك فاضية.' })}</p>
              <button className="btn btn-outline" onClick={() => { closeCart(); navigate('shop'); }}>{t({ en: 'Start shopping', ar: 'ابدئي التسوق' })}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {cart.map((it) => (
                <div className="line-item" key={it.key}>
                  <div className="li-img"><img src={it.img} alt="" /></div>
                  <div className="li-body">
                    <span className="li-name">{t(it.name)}</span>
                    <span className="li-meta">{t(it.color)}{it.size ? ' · ' + t(it.size) : ''}</span>
                    <div className="li-foot">
                      <div className="qty-sm">
                        <button onClick={() => updateQty(it.key, -1)}><Icon n="minus" /></button>
                        <span>{it.qty}</span>
                        <button onClick={() => updateQty(it.key, 1)}><Icon n="plus" /></button>
                      </div>
                      <span className="li-price">{money(it.price * it.qty)}</span>
                    </div>
                    <button className="li-remove" onClick={() => removeItem(it.key)}>{t({ en: 'Remove', ar: 'حذف' })}</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="cod-note"><Icon n="cash" />{t({ en: 'Cash on delivery — no upfront payment', ar: 'الدفع عند الاستلام — من غير أي مقدم' })}</div>
              <div className="summary-row total"><span>{t({ en: 'Subtotal', ar: 'الإجمالي' })}</span><span>{money(subtotal)}</span></div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => { closeCart(); navigate('checkout'); }}>
                {t({ en: 'Checkout', ar: 'إتمام الطلب' })} <Icon n="arrow" style={{ width: 18 }} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

/* ---------- Direction switcher ---------- */
const DirSwitch = () => {
  const { dir, setDir, lang } = useStore();
  return (
    <div className="dir-switch">
      <span className="lab">{lang === 'en' ? 'Design' : 'التصميم'}</span>
      <button className={dir === 'a' ? 'active' : ''} onClick={() => setDir('a')}>A · Maison</button>
      <button className={dir === 'b' ? 'active' : ''} onClick={() => setDir('b')}>B · Boutique</button>
    </div>
  );
};

Object.assign(window, { Icon, Logo, Header, Footer, Marquee, ProductCard, CartDrawer, DirSwitch, FloatingSocial, useStore });


