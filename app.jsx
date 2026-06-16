// ============ JUYUB — app root, state, routing ============
const { useState: aUS, useEffect: aUE, useMemo: aUM, useCallback } = React;

window.JUYUB_CTX = React.createContext(null);

const LS = {
  get: (k, d) => { try { const v = localStorage.getItem('juyub_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('juyub_' + k, JSON.stringify(v)); } catch {} },
};

// default owner login — change from the Admin panel (Settings)
const DEFAULT_CREDS = { user: 'juyub', pass: 'juyub2025' };

// Google Sheet web app (Apps Script) — receives every order. Update in Admin → Settings.
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzPHvZIfR1oBAudvmgt-xi5yMGKo9inSkOePrnfIDV0ox21qywZGHFZOrrz1kPwMhgp/exec';

// fire-and-forget POST of an order to the Google Sheet (no-cors avoids preflight/CORS)
function sendOrderToSheet(url, order) {
  if (!url) return;
  try {
    const f = order.f || {};
    const itemsEn = (order.items || []).map(i => `${(i.name && i.name.en) || ''} (${(i.color && i.color.en) || ''}) x${i.qty} = ${i.price * i.qty} LE`).join(' | ');
    const itemsAr = (order.items || []).map(i => `${(i.name && i.name.ar) || ''} (${(i.color && i.color.ar) || ''}) ×${i.qty}`).join(' | ');
    const payload = {
      date: new Date(order.at || Date.now()).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }),
      id: order.id,
      name: f.name || '', phone: f.phone || '',
      governorate: f.gov || '', city: f.city || '', address: f.address || '', notes: f.notes || '',
      items: itemsEn, itemsAr,
      count: (order.items || []).reduce((s, i) => s + i.qty, 0),
      subtotal: order.total - order.shipping, shipping: order.shipping, total: order.total,
      payment: order.payMethod === 'instapay' ? 'InstaPay' : 'Cash on delivery',
    };
    fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
  } catch (e) { /* never block the order */ }
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name = 'home', param] = raw.split('/');
  const known = ['home', 'shop', 'product', 'about', 'shipping', 'faq', 'checkout', 'confirm', 'admin'];
  const n = known.includes(name) ? name : 'home';
  const params = {};
  if (n === 'product') params.id = param;
  if (n === 'shop' && param) params.cat = param;
  return { name: n, params };
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#540b14",
  "cardBg": "soft",
  "badges": true,
  "marqueeSpeed": 26
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLangState] = aUS(() => LS.get('lang', 'en'));
  const [dir] = aUS('b'); // committed to Direction B · Boutique
  const [route, setRoute] = aUS(parseHash);
  const [cart, setCart] = aUS(() => LS.get('cart', []));
  const [cartOpen, setCartOpen] = aUS(false);
  const [lastOrder, setLastOrder] = aUS(null);
  const [toastMsg, setToastMsg] = aUS(null);

  // editable catalog + orders + auth (all persisted)
  const [products, setProducts] = aUS(() => LS.get('products', PRODUCTS));
  const [categories, setCategories] = aUS(() => LS.get('categories', CATEGORIES));
  const [shipRates, setShipRates] = aUS(() => LS.get('shipRates', SHIP_RATES));
  const [content, setContent] = aUS(() => ({ ...SITE_CONTENT, ...LS.get('content', {}) }));
  const [orders, setOrders] = aUS(() => LS.get('orders', []));
  const [creds, setCreds] = aUS(() => LS.get('creds', DEFAULT_CREDS));
  const [sheetUrl, setSheetUrl] = aUS(() => LS.get('sheetUrl', DEFAULT_SHEET_URL));
  const [isAdmin, setIsAdmin] = aUS(() => LS.get('isAdmin', false));
  const [loginOpen, setLoginOpen] = aUS(false);
  const [giup, setGiup] = aUS(() => LS.get('giup', { products: [], sales: [], expenses: [], ads: [], expenseCategories: [] }));

  // Firebase Realtime Database configuration
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC9taBDXZOc70Nl051t_fdlIYEF-sLaqPs",
    authDomain: "juyub-store.firebaseapp.com",
    databaseURL: "https://juyub-store-default-rtdb.firebaseio.com/",
    projectId: "juyub-store",
    storageBucket: "juyub-store.firebasestorage.app",
    messagingSenderId: "377174545845",
    appId: "1:377174545845:web:ed688817d74bd079acf5fc",
    measurementId: "G-Z829EX953W"
  };
  const [firebaseConfig, setFirebaseConfig] = aUS(() => LS.get('firebaseConfig', DEFAULT_FIREBASE_CONFIG));
  const [db, setDb] = aUS(null);

  // Initialize Firebase Realtime Database
  aUE(() => {
    if (!window.firebase) { console.warn('Firebase SDK not loaded'); return; }
    try {
      const cfg = {
        apiKey: "AIzaSyC9taBDXZOc70Nl051t_fdlIYEF-sLaqPs",
        authDomain: "juyub-store.firebaseapp.com",
        databaseURL: "https://juyub-store-default-rtdb.firebaseio.com/",
        projectId: "juyub-store",
        storageBucket: "juyub-store.firebasestorage.app",
        messagingSenderId: "377174545845",
        appId: "1:377174545845:web:ed688817d74bd079acf5fc"
      };
      const fbApp = firebase.apps.length === 0
        ? firebase.initializeApp(cfg)
        : firebase.app();
      const dbInstance = firebase.database(fbApp);
      setDb(dbInstance);
      window._juyubDb = dbInstance;
      console.log('✅ Firebase connected!');
    } catch (e) {
      console.error('Firebase Init Error:', e);
    }
  }, []);

  // Synchronize Firebase Realtime Database in Real-time
  aUE(() => {
    if (!db) return;

    // 1. Sync products
    const productsRef = db.ref('products');
    const onProducts = productsRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        setProducts(val);
      } else {
        productsRef.set(PRODUCTS);
      }
    });

    // 2. Sync categories
    const categoriesRef = db.ref('categories');
    const onCategories = categoriesRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        setCategories(val);
      } else {
        categoriesRef.set(CATEGORIES);
      }
    });

    // 3. Sync shipRates
    const shipRatesRef = db.ref('shipRates');
    const onShipRates = shipRatesRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        setShipRates(val);
      } else {
        shipRatesRef.set(SHIP_RATES);
      }
    });

    // 4. Sync content
    const contentRef = db.ref('content');
    const onContent = contentRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        setContent(val);
      } else {
        contentRef.set(SITE_CONTENT);
      }
    });

    // 5. Sync orders
    const ordersRef = db.ref('orders');
    const onOrders = ordersRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        const arr = Object.values(val).sort((a, b) => b.at - a.at);
        setOrders(arr);
      } else {
        setOrders([]);
      }
    });

    // 6. Sync giup (business tracker profile)
    const giupRef = db.ref('giup');
    const onGiup = giupRef.on('value', (snap) => {
      const val = snap.val();
      if (val) {
        setGiup({
          products: val.products || [],
          sales: val.sales || [],
          expenses: val.expenses || [],
          ads: val.ads || [],
          expenseCategories: val.expenseCategories || [],
        });
      }
    });

    return () => {
      productsRef.off('value', onProducts);
      categoriesRef.off('value', onCategories);
      shipRatesRef.off('value', onShipRates);
      contentRef.off('value', onContent);
      ordersRef.off('value', onOrders);
      giupRef.off('value', onGiup);
    };
  }, [db]);

  aUE(() => { LS.set('products', products); }, [products]);
  aUE(() => { LS.set('categories', categories); }, [categories]);
  aUE(() => { LS.set('shipRates', shipRates); }, [shipRates]);
  aUE(() => { LS.set('content', content); }, [content]);
  aUE(() => { LS.set('orders', orders); }, [orders]);
  aUE(() => { LS.set('giup', giup); }, [giup]);
  aUE(() => { LS.set('creds', creds); }, [creds]);
  aUE(() => { LS.set('sheetUrl', sheetUrl); }, [sheetUrl]);
  aUE(() => { LS.set('isAdmin', isAdmin); }, [isAdmin]);

  // ── Analytics: track every page/product view ──
  aUE(() => {
    const dbRef = window._juyubDb;
    if (!dbRef || !route || !route.name) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      dbRef.ref('analytics/totalVisits').transaction(v => (v || 0) + 1);
      dbRef.ref('analytics/pageViews/' + route.name).transaction(v => (v || 0) + 1);
      dbRef.ref('analytics/dailyVisits/' + today).transaction(v => (v || 0) + 1);
      if (route.name === 'product' && route.params && route.params.id) {
        dbRef.ref('analytics/productClicks/' + route.params.id).transaction(v => (v || 0) + 1);
      }
    } catch(e) {}
  }, [route.name, route.params && route.params.id]);
  aUE(() => { LS.set('firebaseConfig', firebaseConfig); }, [firebaseConfig]);

  // sync root attributes
  aUE(() => {
    const r = document.documentElement;
    r.setAttribute('data-dir', dir);
    r.setAttribute('data-lang', lang);
    r.setAttribute('lang', lang);
    r.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    LS.set('lang', lang); LS.set('dir', dir);
  }, [lang, dir]);

  aUE(() => { LS.set('cart', cart); }, [cart]);

  // apply tweaks
  aUE(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', tw.accent);
    r.style.setProperty('--marq-dur', tw.marqueeSpeed + 's');
    r.setAttribute('data-cardbg', tw.cardBg);
  }, [tw.accent, tw.marqueeSpeed, tw.cardBg]);

  aUE(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((name, params = {}) => {
    let h = '#/' + (name === 'home' ? '' : name);
    if (name === 'product' && params.id) h = '#/product/' + params.id;
    if (name === 'shop' && params.cat) h = '#/shop/' + params.cat;
    location.hash = h;
    setRoute({ name, params });
    if (name !== 'product') window.scrollTo(0, 0);
    // Analytics tracking — Firebase
    try {
      const dbRef = window._juyubDb;
      const today = new Date(Date.now() + 3*60*60*1000).toISOString().slice(0, 10); // Egypt UTC+3
      if (dbRef) {
        dbRef.ref('analytics/totalVisits').transaction(v => (v || 0) + 1);
        dbRef.ref('analytics/pageViews/' + name).transaction(v => (v || 0) + 1);
        dbRef.ref('analytics/dailyVisits/' + today).transaction(v => (v || 0) + 1);
        if (name === 'product' && params.id) {
          dbRef.ref('analytics/productClicks/' + params.id).transaction(v => (v || 0) + 1);
        }
      }
    } catch (e) {}
  }, []);

  const t = useCallback((obj) => (obj ? (obj[lang] ?? obj.en ?? '') : ''), [lang]);
  const money = useCallback((n) => {
    const num = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(n);
    return lang === 'ar' ? `${num} ${CURRENCY.ar}` : `${num} ${CURRENCY.en}`;
  }, [lang]);

  const setLang = (l) => setLangState(l);

  // cart ops
  const addToCart = useCallback((p, v, qty) => {
    const key = p.id + '__' + v.color.en;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { key, id: p.id, name: p.name, color: v.color, img: v.img, price: p.price, size: p.specs.size, qty }];
    });
  }, []);
  const updateQty = useCallback((key, d) => setCart(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + d) } : i)), []);
  const removeItem = useCallback((key) => setCart(prev => prev.filter(i => i.key !== key)), []);
  const subtotal = aUM(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(window.__jt); window.__jt = setTimeout(() => setToastMsg(null), 1900);
  }, []);

  // place order → save to the orders list (no WhatsApp send), then thank-you
  const placeOrder = useCallback((f, shipping) => {
    const seq = (LS.get('orderSeq', 0) || 0) + 1;
    LS.set('orderSeq', seq);
    const id = 'JY' + String(seq).padStart(4, '0');
    const total = subtotal + shipping;
    const order = { id, f, payMethod: f.payMethod || 'cod', items: cart, total, shipping, at: Date.now(), status: 'new' };
    
    if (db) {
      db.ref('orders/' + id).set(order);
    } else {
      setOrders(prev => [order, ...prev]);
    }
    sendOrderToSheet(sheetUrl, order); // push to Google Sheet
    setLastOrder(order);
    setCart([]);
    navigate('confirm');
  }, [cart, subtotal, navigate, sheetUrl, db]);

  // --- admin ---
  const login = useCallback((u, p) => {
    if (u.trim() === creds.user && p === creds.pass) { setIsAdmin(true); setLoginOpen(false); navigate('admin'); return true; }
    return false;
  }, [creds, navigate]);
  const logout = useCallback(() => { setIsAdmin(false); navigate('home'); }, [navigate]);

  const saveProduct = useCallback((prod) => {
    setProducts(prev => {
      const i = prev.findIndex(x => x.id === prod.id);
      let next = [...prev];
      if (i < 0) next.push(prod);
      else next[i] = prod;
      if (db) db.ref('products').set(next);
      return next;
    });
  }, [db]);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      const next = prev.filter(x => x.id !== id);
      if (db) db.ref('products').set(next);
      return next;
    });
  }, [db]);

  const resetProducts = useCallback(() => {
    const next = PRODUCTS.map(p => JSON.parse(JSON.stringify(p)));
    if (db) db.ref('products').set(next);
    else setProducts(next);
  }, [db]);

  const updateOrder = useCallback((id, patch) => {
    if (db) {
      db.ref('orders/' + id).update(patch);
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    }
  }, [db]);

  const deleteOrder = useCallback((id) => {
    if (db) {
      db.ref('orders/' + id).remove();
    } else {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  }, [db]);

  // categories
  const addCategory = useCallback((en, ar) => {
    const id = (en || ar).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('cat' + Date.now().toString(36));
    setCategories(prev => {
      if (prev.find(c => c.id === id)) return prev;
      const next = [...prev, { id, en: en || ar, ar: ar || en }];
      if (db) db.ref('categories').set(next);
      return next;
    });
    return id;
  }, [db]);

  const deleteCategory = useCallback((id) => {
    if (id === 'all') return;
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      if (db) db.ref('categories').set(next);
      return next;
    });
  }, [db]);

  const saveShipRate = useCallback((gov, val) => {
    setShipRates(prev => {
      const next = { ...prev, [gov]: Number(val) || 0 };
      if (db) db.ref('shipRates').set(next);
      return next;
    });
  }, [db]);

  const setAllShipRates = useCallback((val) => {
    const next = {};
    GOVERNORATES.forEach(g => next[g] = Number(val) || 0);
    if (db) db.ref('shipRates').set(next);
    else setShipRates(next);
  }, [db]);

  const saveContent = useCallback((patch) => {
    setContent(prev => {
      const next = { ...prev, ...patch };
      if (db) db.ref('content').set(next);
      return next;
    });
  }, [db]);

  const resetContent = useCallback(() => {
    const next = JSON.parse(JSON.stringify(SITE_CONTENT));
    if (db) db.ref('content').set(next);
    else setContent(next);
  }, [db]);

  // Save the whole giup profile (business tracker).
  const saveGiup = useCallback((next) => {
    // Firebase rejects `undefined` anywhere in the payload — strip them out.
    const clean = JSON.parse(JSON.stringify(next));
    setGiup(clean);
    LS.set('giup', clean);
    if (db) {
      db.ref('giup').set(clean)
        .then(() => console.log('✅ giup saved to Firebase'))
        .catch((e) => console.error('❌ giup Firebase write FAILED:', e && e.message));
    } else {
      // db not ready yet — keep it pending so it writes once connected
      window._giupPending = clean;
      console.warn('⏳ db not ready, giup write queued');
    }
  }, [db]);

  // Flush any pending giup write once Firebase connects
  aUE(() => {
    if (db && window._giupPending) {
      db.ref('giup').set(window._giupPending)
        .then(() => { console.log('✅ pending giup flushed'); window._giupPending = null; })
        .catch((e) => console.error('❌ pending giup flush failed:', e && e.message));
    }
  }, [db]);

  const store = {
    lang, setLang, dir, route, navigate, t, money,
    cart, addToCart, updateQty, removeItem, subtotal, openCart, closeCart,
    lastOrder, placeOrder, toast,
    showBadges: tw.badges,
    products, orders, categories, shipRates, content,
    isAdmin, loginOpen, setLoginOpen, login, logout,
    creds, setCreds, saveProduct, deleteProduct, resetProducts, updateOrder, deleteOrder,
    addCategory, deleteCategory, saveShipRate, setAllShipRates, saveContent, resetContent,
    sheetUrl, setSheetUrl,
    firebaseConfig, setFirebaseConfig, db,
    giup, saveGiup
  };

  let Page;
  switch (route.name) {
    case 'shop': Page = ShopPage; break;
    case 'product': Page = ProductPage; break;
    case 'about': Page = AboutPage; break;
    case 'shipping': Page = ShippingPage; break;
    case 'faq': Page = FAQPage; break;
    case 'checkout': Page = CheckoutPage; break;
    case 'confirm': Page = ConfirmPage; break;
    case 'admin': Page = isAdmin ? AdminPage : HomePage; break;
    default: Page = HomePage;
  }

  return (
    <window.JUYUB_CTX.Provider value={store}>
      <div className="app">
        <Header />
        <main><Page /></main>
        <Footer />
      </div>
      <FloatingSocial />
      {cartOpen && <CartDrawer />}
      {loginOpen && <LoginModal />}
      {toastMsg && <div className="toast"><Icon n="check" />{toastMsg}</div>}
      <TweaksPanel title="Tweaks">
        <TweakSection label={lang === 'ar' ? 'الألوان' : 'Color'} />
        <TweakColor label={lang === 'ar' ? 'لون الأكسنت' : 'Accent'} value={tw.accent}
          options={['#540b14', '#6e1422', '#7a3b1a', '#2b2422']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label={lang === 'ar' ? 'المنتجات' : 'Products'} />
        <TweakRadio label={lang === 'ar' ? 'خلفية الصورة' : 'Image background'} value={tw.cardBg}
          options={['soft', 'white']} onChange={(v) => setTweak('cardBg', v)} />
        <TweakToggle label={lang === 'ar' ? 'شارات الأكثر مبيعاً' : 'Bestseller badges'} value={tw.badges}
          onChange={(v) => setTweak('badges', v)} />
        <TweakSection label={lang === 'ar' ? 'الحركة' : 'Motion'} />
        <TweakSlider label={lang === 'ar' ? 'سرعة الشريط' : 'Marquee speed'} value={tw.marqueeSpeed}
          min={10} max={45} unit="s" onChange={(v) => setTweak('marqueeSpeed', v)} />
      </TweaksPanel>
    </window.JUYUB_CTX.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
