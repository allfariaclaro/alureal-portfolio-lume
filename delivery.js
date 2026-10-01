const DATA=window.LUME_DATA||{products:[],reviews:[],restaurant:{}};
const CART_KEY='lume-delivery-cart-v1';
const FAV_KEY='lume-delivery-favs-v1';
const ORDERS_KEY='lume-delivery-orders-v1';
const STORE_FAV='lume-store-favorite';
const THEME_KEY='lume-theme';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
const storageGet=(storage,k)=>{try{return storage.getItem(k)}catch{return null}};
const storageSet=(storage,k,v)=>{try{storage.setItem(k,v);return true}catch{return false}};
const storageRemove=(storage,k)=>{try{storage.removeItem(k);return true}catch{return false}};
const read=(k,f)=>{try{return JSON.parse(storageGet(localStorage,k))??f}catch{return f}};
const write=(k,v)=>storageSet(localStorage,k,JSON.stringify(v));
const getCart=()=>read(CART_KEY,[]);
const setCart=c=>{write(CART_KEY,c);renderCartUI();renderCartPage();};
const getFavs=()=>read(FAV_KEY,[]);
const setFavs=f=>{write(FAV_KEY,f);renderFavoritesState();};
const toast=(msg)=>{let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(window.__lumeToast);window.__lumeToast=setTimeout(()=>t.classList.remove('show'),2200)};
const productById=id=>DATA.products.find(p=>p.id===id);
function safeCatalogReturn(value){
  if(typeof value!=='string'||/[\\\r\n]/.test(value))return 'menu.html';
  const match=/^(index|menu)\.html(?:\?([^#]*))?$/.exec(value);
  if(!match)return 'menu.html';
  const params=new URLSearchParams(match[2]||'');
  const allowed=new URLSearchParams();
  for(const key of ['q','category','filters','sort']){
    const value=params.get(key);if(value)allowed.set(key,value);
  }
  const query=allowed.toString();
  return match[1]+'.html'+(query?'?'+query:'');
}
function productHref(id){
  const page=location.pathname.split('/').pop();
  const returnTo=['index.html','menu.html'].includes(page)?safeCatalogReturn(page+location.search):'';
  return 'produto.html?id='+encodeURIComponent(id)+(returnTo?'&return='+encodeURIComponent(returnTo):'');
}
const cardMarkup=p=>{
  const fav=getFavs().includes(p.id);
  const promo=p.oldPrice?'<span class="badge promo">-'+Math.round((1-p.price/p.oldPrice)*100)+'%</span>':'';
  const badges=(p.badges||[]).map(b=>'<span class="badge">'+b+'</span>').join('');
  return '<article class="product-card" data-product-card="'+p.id+'" data-category="'+p.category+'">'+
    '<div class="product-photo"><a href="'+productHref(p.id)+'"><img src="'+p.image+'" alt="'+p.name+'" loading="lazy"></a>'+
    '<div class="badges">'+promo+badges+'</div>'+
    '<button class="favorite-btn '+(fav?'active':'')+'" data-favorite="'+p.id+'" aria-label="Favoritar '+p.name+'">'+(fav?'♥':'♡')+'</button></div>'+
    '<div class="product-body"><div class="product-title-row"><h3><a href="'+productHref(p.id)+'">'+p.name+'</a></h3><span class="mini-rating">★ '+p.rating+'</span></div>'+
    '<p>'+p.description+'</p><div class="product-bottom"><div class="price-stack"><span class="price">'+money(p.price)+'</span>'+(p.oldPrice?'<span class="old-price">'+money(p.oldPrice)+'</span>':'')+'</div>'+
    '<button class="add-btn" data-quick-add="'+p.id+'" aria-label="Adicionar '+p.name+'">+</button></div></div></article>';
};
function renderProductGrids(){
  $$('[data-product-grid]').forEach(grid=>{
    const category=grid.dataset.productGrid;
    let items=DATA.products;
    if(category&&category!=='all'){
      if(category==='destaques') items=DATA.products.filter(p=>(p.badges||[]).some(x=>/pedido|chef|favorito/i.test(x))).slice(0,6);
      else items=DATA.products.filter(p=>p.category===category);
    }
    grid.innerHTML=items.map(cardMarkup).join('');
  });
  bindProductActions();
}
function bindProductActions(){
  $$('[data-quick-add]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();quickAdd(b.dataset.quickAdd)});
  $$('[data-favorite]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();toggleFavorite(b.dataset.favorite)});
}
function quickAdd(id){
  const p=productById(id);if(!p)return;
  if((p.options||[]).some(g=>g.required)){location.href=productHref(id);return}
  const cart=getCart();const existing=cart.find(i=>i.id===id&&!i.options?.length);
  if(existing)existing.qty+=1;else cart.push({id,qty:1,options:[],note:'',unitPrice:p.price});
  setCart(cart);toast(p.name+' adicionado ao carrinho');
}
function toggleFavorite(id){
  let f=getFavs();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];setFavs(f);
  toast(f.includes(id)?'Adicionado aos favoritos':'Removido dos favoritos');
}
function renderFavoritesState(){
  const f=getFavs();
  $$('[data-favorite]').forEach(b=>{const on=f.includes(b.dataset.favorite);b.classList.toggle('active',on);b.textContent=on?'♥':'♡'});
  const grid=$('[data-favorites-grid]');
  if(grid){
    const items=DATA.products.filter(p=>f.includes(p.id));
    grid.innerHTML=items.length?items.map(cardMarkup).join(''):'<div class="empty-state">Você ainda não salvou nenhum prato.<br><a class="rating-link" href="menu.html">Explorar cardápio</a></div>';
    bindProductActions();
  }
}
function cartTotals(c=getCart()){
  const subtotal=c.reduce((s,i)=>s+(i.unitPrice||productById(i.id)?.price||0)*i.qty,0);
  let discount=Number(sessionStorage.getItem('lume-discount')||0);
  const fee=subtotal>=60?0:(subtotal?DATA.restaurant.deliveryFee||6.9:0);
  discount=Math.min(discount,subtotal);
  return {subtotal,fee,discount,total:Math.max(0,subtotal+fee-discount)};
}
function cartItemMarkup(i,index){
  const p=productById(i.id);if(!p)return '';
  const options=(i.options||[]).map(o=>o.name).join(', ');
  return '<article class="cart-item"><img src="'+p.image+'" alt=""><div><strong>'+p.name+'</strong><small>'+(options||'Sem adicionais')+'</small>'+
    '<div class="qty"><button class="qty-btn" data-cart-dec="'+index+'">−</button><span>'+i.qty+'</span><button class="qty-btn" data-cart-inc="'+index+'">+</button></div></div>'+
    '<strong>'+money((i.unitPrice||p.price)*i.qty)+'</strong></article>';
}
function renderCartUI(){
  const cart=getCart();const count=cart.reduce((n,i)=>n+i.qty,0);const totals=cartTotals(cart);
  $$('[data-cart-count]').forEach(el=>el.textContent=count);
  $$('[data-cart-total]').forEach(el=>el.textContent=money(totals.total));
  const fab=$('[data-cart-fab]');if(fab){fab.classList.toggle('visible',count>0);$('[data-cart-fab-label]')&&( $('[data-cart-fab-label]').textContent=count+' '+(count===1?'item':'itens') );}
  const list=$('[data-cart-items]');if(list)list.innerHTML=cart.length?cart.map(cartItemMarkup).join(''):'<div class="empty-state">Seu carrinho está vazio.</div>';
  $$('[data-cart-subtotal]').forEach(el=>el.textContent=money(totals.subtotal));
  $$('[data-cart-fee]').forEach(el=>el.textContent=totals.fee?money(totals.fee):'Grátis');
  $$('[data-cart-discount]').forEach(el=>el.textContent=totals.discount?'- '+money(totals.discount):money(0));
  $$('[data-cart-grand]').forEach(el=>el.textContent=money(totals.total));
  bindCartButtons();
}
function bindCartButtons(){
  $$('[data-cart-inc]').forEach(b=>b.onclick=()=>{const c=getCart();c[+b.dataset.cartInc].qty++;setCart(c)});
  $$('[data-cart-dec]').forEach(b=>b.onclick=()=>{const c=getCart();const i=+b.dataset.cartDec;c[i].qty--;if(c[i].qty<=0)c.splice(i,1);setCart(c)});
}
function openCart(){document.body.classList.add('drawer-open');$('[data-cart-drawer]')?.classList.add('open');$('[data-drawer-scrim]')?.classList.add('open')}
function closeCart(){document.body.classList.remove('drawer-open');$('[data-cart-drawer]')?.classList.remove('open');$('[data-drawer-scrim]')?.classList.remove('open')}
function initGlobalCart(){
  $$('[data-open-cart]').forEach(b=>b.onclick=openCart);
  $$('[data-close-cart], [data-drawer-scrim]').forEach(b=>b.onclick=closeCart);
  $$('[data-go-cart]').forEach(b=>b.onclick=()=>location.href='carrinho.html');
  $$('[data-go-checkout]').forEach(b=>b.onclick=()=>location.href='checkout.html');
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
}
function initStoreFavorite(){
  const b=$('[data-store-favorite]');if(!b)return;
  const render=()=>{const on=localStorage.getItem(STORE_FAV)==='1';b.textContent=on?'♥ Restaurante salvo':'♡ Salvar restaurante';b.classList.toggle('active',on)};
  b.onclick=()=>{localStorage.setItem(STORE_FAV,localStorage.getItem(STORE_FAV)==='1'?'0':'1');render();toast(localStorage.getItem(STORE_FAV)==='1'?'LUME salvo nos favoritos':'LUME removido dos favoritos')};render();
}
const normalizeCatalogText=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const catalogFilters={
  promotion:p=>p.oldPrice>p.price,
  popular:p=>(p.badges||[]).some(b=>/mais pedido/i.test(b)),
  vegetarian:p=>(p.badges||[]).includes('Vegetariano'),
  alcoholFree:p=>(p.badges||[]).includes('Sem álcool'),
  under40:p=>p.price<=40
};
function selectCatalogProducts(state){
  const query=normalizeCatalogText(state.query.trim());
  const items=DATA.products.filter(p=>
    (state.category==='all'||p.category===state.category)&&
    (!query||normalizeCatalogText([p.name,p.description,p.category,...(p.tags||[])].join(' ')).includes(query))&&
    state.filters.every(key=>catalogFilters[key](p))
  );
  if(state.sort==='price')items.sort((a,b)=>a.price-b.price);
  else if(state.sort==='rating')items.sort((a,b)=>b.rating-a.rating);
  else if(state.sort==='popular')items.sort((a,b)=>Number(catalogFilters.popular(b))-Number(catalogFilters.popular(a)));
  return items;
}
function initCatalog(){
  const grid=$('[data-menu-catalog]')||$('[data-catalog-results]');
  if(!grid)return false;
  const home=!!$('[data-catalog-results]');
  let state;
  const readState=()=>{
    const params=new URLSearchParams(location.search);
    state={query:params.get('q')||'',category:params.get('category')||'all',
      filters:(params.get('filters')||'').split(',').filter(key=>Object.hasOwn(catalogFilters,key)),
      sort:params.get('sort')|| (home?'default':'popular')};
    if(!['all',...DATA.categories.map(c=>c.id)].includes(state.category)||state.category==='destaques')state.category='all';
    if(!(home?['default','popular','price','rating']:['popular','price','rating']).includes(state.sort))state.sort=home?'default':'popular';
  };
  const render=()=>{
    const items=selectCatalogProducts(state);
    const active=!!state.query.trim()||state.category!=='all'||state.filters.length>0||state.sort!==(home?'default':'popular');
    $$('[data-search]').forEach(input=>input.value=state.query);
    $$('[data-category-filter]').forEach(button=>{
      const on=button.dataset.categoryFilter===state.category;
      button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));
    });
    $$('[data-catalog-filter]').forEach(input=>input.checked=state.filters.includes(input.dataset.catalogFilter));
    const sort=$('[data-catalog-sort]');if(sort)sort.value=state.sort;
    $$('[data-product-grid]').forEach(editorial=>editorial.closest('.content-section').hidden=home&&active);
    const section=$('[data-catalog-results-section]');if(section)section.hidden=!active;
    $$('[data-catalog-count]').forEach(count=>count.textContent=items.length+' '+(items.length===1?'item':'itens'));
    $$('[data-clear-catalog]').forEach(button=>button.hidden=!active);
    grid.innerHTML=home&&!active?'':items.length?items.map(cardMarkup).join(''):
      '<div class="empty-state">Nenhum item encontrado. Ajuste a busca ou limpe os filtros.</div>';
    bindProductActions();
  };
  const update=()=>{
    const url=new URL(location.href);
    for(const [key,value] of Object.entries({q:state.query,category:state.category==='all'?'':state.category,
      filters:state.filters.join(','),sort:state.sort===(home?'default':'popular')?'':state.sort})){
      if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
    }
    history.replaceState(null,'',url);render();
  };
  readState();render();
  $$('[data-search]').forEach(input=>input.addEventListener('input',()=>{state.query=input.value;update()}));
  $$('[data-category-filter]').forEach(button=>button.onclick=()=>{state.category=button.dataset.categoryFilter;update()});
  $$('[data-catalog-filter]').forEach(input=>input.onchange=()=>{
    state.filters=$$('[data-catalog-filter]:checked').map(i=>i.dataset.catalogFilter);update();
  });
  const sort=$('[data-catalog-sort]');if(sort)sort.onchange=()=>{state.sort=sort.value;update()};
  $$('[data-clear-catalog]').forEach(button=>button.onclick=()=>{
    state={query:'',category:'all',filters:[],sort:home?'default':'popular'};update();$('[data-search]')?.focus();
  });
  window.addEventListener('popstate',()=>{readState();render()});
  window.addEventListener('pageshow',()=>{readState();render();renderFavoritesState();renderCartUI()});
  return true;
}
function initSearch(){
  if(initCatalog())return;
  $$('[data-search]').forEach(input=>input.addEventListener('input',()=>{
    const q=normalizeCatalogText(input.value.trim());
    $$('[data-product-card]').forEach(card=>{
      const p=productById(card.dataset.productCard);
      card.style.display=!q||normalizeCatalogText([p.name,p.description,p.category,...(p.tags||[])].join(' ')).includes(q)?'':'none';
    });
  }));
}
function renderReviews(){
  const preview=$('[data-reviews-preview]');if(preview)preview.innerHTML=DATA.reviews.slice(0,3).map(reviewMarkup).join('');
  const full=$('[data-reviews-list]');if(full)full.innerHTML=DATA.reviews.map(reviewMarkup).join('');
}
function reviewMarkup(r){return '<article class="'+($('[data-reviews-list]')?'review-full':'review')+'"><div class="review-head"><div><strong>'+r.name+'</strong><small>'+r.date+'</small></div><span class="stars">'+'★'.repeat(r.rating)+'☆'.repeat(5-r.rating)+'</span></div><p>'+r.text+'</p><span class="review-order">'+r.order+'</span></article>'}
function renderMenuCatalog(){
  const grid=$('[data-menu-catalog]');if(!grid)return;
  grid.innerHTML=DATA.products.map(cardMarkup).join('');bindProductActions();
}
function renderProductDetail(){
  const root=$('[data-product-detail]');if(!root)return;
  const id=new URLSearchParams(location.search).get('id')||DATA.products[0]?.id;const p=productById(id);if(!p)return;
  const back=$('[data-catalog-return]');if(back)back.setAttribute('href',safeCatalogReturn(new URLSearchParams(location.search).get('return')));
  document.title='LUME — '+p.name;
  const groups=(p.options||[]).map((g,gi)=>'<section class="option-group" data-option-group="'+gi+'" data-max="'+g.max+'" data-required="'+(g.required?'1':'0')+'"><div class="option-head"><strong>'+g.title+'</strong>'+(g.required?'<span class="required">Obrigatório</span>':'<span class="required">Opcional</span>')+'</div>'+g.items.map((o,oi)=>'<div class="option-item"><label><input '+(g.max===1?'type="radio" name="option-'+gi+'"':'type="checkbox"')+' data-option="'+gi+'-'+oi+'" data-price="'+o.price+'" data-name="'+o.name+'"> '+o.name+'</label><span>'+(o.price?'+'+money(o.price):'Incluso')+'</span></div>').join('')+'</section>').join('');
  root.innerHTML='<div class="product-detail-grid"><div class="detail-photo"><img src="'+p.image+'" alt="'+p.name+'"></div><div class="detail-info"><div class="product-title-row"><span class="cover-badge" style="color:var(--brand);background:#eef3ef;border-color:#dae5dd">★ '+p.rating+' · '+p.reviews+' avaliações</span><button class="favorite-btn '+(getFavs().includes(p.id)?'active':'')+'" data-favorite="'+p.id+'">'+(getFavs().includes(p.id)?'♥':'♡')+'</button></div><h1>'+p.name+'</h1><p>'+p.description+'</p><div class="detail-price">'+money(p.price)+'</div>'+groups+'<section class="option-group"><div class="option-head"><strong>Alguma observação?</strong><span class="required">Opcional</span></div><textarea class="note-box" data-note maxlength="140" placeholder="Ex.: tirar cebola, molho separado..."></textarea></section><div class="detail-footer"><div class="quantity-control"><button class="qty-btn" data-detail-dec>−</button><strong data-detail-qty>1</strong><button class="qty-btn" data-detail-inc>+</button></div><button class="primary-btn" data-detail-add>Adicionar · <span data-detail-total>'+money(p.price)+'</span></button></div></div></div>';
  bindProductActions();
  let qty=1;
  const total=()=>{let extras=0;$$('[data-price]',root).forEach(i=>{if(i.checked)extras+=Number(i.dataset.price)});$('[data-detail-total]',root).textContent=money((p.price+extras)*qty)};
  $$('[data-price]',root).forEach(i=>i.onchange=total);
  $('[data-detail-inc]',root).onclick=()=>{qty++;$('[data-detail-qty]',root).textContent=qty;total()};
  $('[data-detail-dec]',root).onclick=()=>{qty=Math.max(1,qty-1);$('[data-detail-qty]',root).textContent=qty;total()};
  $('[data-detail-add]',root).onclick=()=>{
    for(const g of $$('[data-option-group][data-required="1"]',root)){if(!g.querySelector('input:checked')){toast('Escolha: '+g.querySelector('strong').textContent);g.scrollIntoView({behavior:'smooth',block:'center'});return}}
    const opts=$$('input[data-option]:checked',root).map(i=>({name:i.dataset.name,price:Number(i.dataset.price)}));
    const unitPrice=p.price+opts.reduce((s,o)=>s+o.price,0);const c=getCart();c.push({id:p.id,qty,options:opts,note:$('[data-note]',root).value,unitPrice});setCart(c);toast('Adicionado ao carrinho');openCart();
  };
}
function renderCartPage(){
  const root=$('[data-cart-page-items]');if(!root)return;
  const cart=getCart();
  root.innerHTML=cart.length?cart.map((i,idx)=>{const p=productById(i.id);return '<article class="cart-item" style="grid-template-columns:90px 1fr auto"><img src="'+p.image+'" alt=""><div><strong>'+p.name+'</strong><small>'+((i.options||[]).map(o=>o.name).join(', ')||'Sem adicionais')+'</small><div class="qty"><button class="qty-btn" data-cart-dec="'+idx+'">−</button><span>'+i.qty+'</span><button class="qty-btn" data-cart-inc="'+idx+'">+</button></div></div><strong>'+money(i.unitPrice*i.qty)+'</strong></article>'}).join(''):'<div class="empty-state">Seu carrinho está vazio.<br><a class="rating-link" href="menu.html">Escolher pratos</a></div>';
  bindCartButtons();
  const suggestions=$('[data-cart-suggestions]');if(suggestions)suggestions.innerHTML=DATA.products.filter(p=>p.category==='bebidas'||p.category==='sobremesas').slice(0,4).map(cardMarkup).join('');
  bindProductActions();
}
function initCoupon(){
  const btn=$('[data-apply-coupon]');if(!btn)return;
  btn.onclick=()=>{
    const code=$('[data-coupon]').value.trim().toUpperCase();const totals=cartTotals();
    if(code==='LUME15'){sessionStorage.setItem('lume-discount',(totals.subtotal*.15).toFixed(2));toast('Cupom LUME15 aplicado')}
    else if(code==='ENTREGA0'){sessionStorage.setItem('lume-discount',(DATA.restaurant.deliveryFee||6.9).toFixed(2));toast('Cupom ENTREGA0 aplicado')}
    else{sessionStorage.removeItem('lume-discount');toast('Cupom não encontrado')}
    renderCartUI();
  };
}
function initCheckout(){
  const form=$('[data-checkout-form]');if(!form)return;
  $$('[data-choice]').forEach(c=>c.onclick=()=>{const group=c.dataset.choiceGroup;$$('[data-choice-group="'+group+'"]').forEach(x=>x.classList.remove('active'));c.classList.add('active')});
  form.onsubmit=e=>{
    e.preventDefault();const cart=getCart();if(!cart.length){toast('Seu carrinho está vazio');return}
    const totals=cartTotals(cart);const id='LM'+Date.now().toString().slice(-6);const order={id,created:new Date().toISOString(),status:'preparing',items:cart,total:totals.total,eta:'25–35 min',address:'Av. Paulista, 1000 · Jardins'};
    const orders=read(ORDERS_KEY,[]);orders.unshift(order);write(ORDERS_KEY,orders);localStorage.setItem('lume-last-order',id);localStorage.removeItem(CART_KEY);sessionStorage.removeItem('lume-discount');location.href='pedido.html?id='+id;
  };
}
function currentOrder(){
  const id=new URLSearchParams(location.search).get('id')||localStorage.getItem('lume-last-order');
  return read(ORDERS_KEY,[]).find(o=>o.id===id)||read(ORDERS_KEY,[])[0];
}
function renderTracking(){
  const root=$('[data-track-order]');if(!root)return;const o=currentOrder();
  if(!o){root.innerHTML='<div class="empty-state">Nenhum pedido em andamento.<br><a class="rating-link" href="menu.html">Fazer um pedido</a></div>';return}
  root.innerHTML='<section class="track-hero"><span>Pedido #'+o.id+'</span><h1>Seu pedido está em preparo.</h1><p>Previsão de entrega: <strong>'+o.eta+'</strong></p></section><div class="progress-steps"><div class="step done">Pedido confirmado</div><div class="step done">Em preparo</div><div class="step">Saiu para entrega</div><div class="step">Entregue</div></div><section class="track-grid"><div class="map-placeholder"><i class="map-road"></i><i class="map-pin"></i></div><aside class="support-card"><h2>Entrega</h2><p>'+o.address+'</p><p>Entregador será definido quando o pedido sair do restaurante.</p><button class="secondary-btn" style="width:100%">Falar com a LUME</button><hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><div class="summary-line"><span>Total</span><strong>'+money(o.total)+'</strong></div></aside></section>';
}
function renderOrders(){
  const root=$('[data-orders-list]');if(!root)return;const orders=read(ORDERS_KEY,[]);
  root.innerHTML=orders.length?orders.map(o=>'<article class="order-card"><div><strong>Pedido #'+o.id+'</strong><p>'+o.items.map(i=>i.qty+'× '+(productById(i.id)?.name||i.id)).join(' · ')+'</p><small>'+new Date(o.created).toLocaleDateString('pt-BR')+' · '+money(o.total)+'</small></div><div><button class="secondary-btn" data-repeat-order="'+o.id+'">Pedir novamente</button></div></article>').join(''):'<div class="empty-state">Você ainda não tem pedidos anteriores.</div>';
  $$('[data-repeat-order]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>x.id===b.dataset.repeatOrder);if(o){setCart(o.items);toast('Itens adicionados ao carrinho');setTimeout(()=>location.href='carrinho.html',500)}});
}
function initLocation(){
  $$('[data-location]').forEach(b=>b.onclick=()=>toast('Endereço de entrega: Av. Paulista, 1000 · Jardins'));
}
function applyTheme(theme){
  const next=theme==='dark'?'dark':'light';
  document.documentElement.dataset.theme=next;
  storageSet(localStorage,THEME_KEY,next);
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
    const dark=next==='dark';
    button.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');
    button.setAttribute('title',dark?'Modo claro':'Modo escuro');
    const icon=button.querySelector('.theme-icon');
    if(icon) icon.textContent=dark?'☀':'☾';
  });
}
function initTheme(){
  const raw=storageGet(localStorage,THEME_KEY);
  const stored=raw==='dark'||raw==='light'?raw:null;
  let system='light';
  try{system=window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{}
  applyTheme(stored||system);
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>button.addEventListener('click',()=>{
    applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  }));
}
function renderShell(){
  const header=$('[data-app-header]');
  if(header) header.innerHTML='<header class="delivery-header"><div class="wrap"><div class="top-row"><a class="wordmark" href="index.html"><span class="wordmark-mark"></span><span>LUME</span></a><button class="location-btn" data-location><span>⌖</span><span class="location-copy"><small>Entregar em</small><strong>Av. Paulista, 1000 · Jardins</strong></span></button><div class="header-actions"><button class="icon-btn theme-toggle" data-theme-toggle aria-label="Ativar modo escuro" title="Modo escuro"><span class="theme-icon">☾</span><span class="theme-label">Tema</span></button><a class="icon-btn nav-secondary" href="favoritos.html" aria-label="Favoritos">♡</a><a class="icon-btn nav-secondary" href="pedidos.html" aria-label="Pedidos">⌁</a><button class="icon-btn" data-open-cart aria-label="Carrinho">🛒<span class="count-badge" data-cart-count>0</span></button></div></div><div class="search-row"><label class="search-box"><span>⌕</span><input data-search placeholder="Buscar no cardápio da LUME"></label></div></div></header>';
  const cart=$('[data-app-cart]');
  if(cart) cart.innerHTML='<div class="drawer-scrim" data-drawer-scrim></div><aside class="cart-drawer" data-cart-drawer><div class="drawer-head"><h2>Seu pedido</h2><button class="drawer-close" data-close-cart>×</button></div><div class="cart-items" data-cart-items></div><div class="drawer-summary"><div class="summary-line"><span>Subtotal</span><strong data-cart-subtotal></strong></div><div class="summary-line"><span>Entrega</span><strong data-cart-fee></strong></div><div class="summary-line"><span>Total</span><strong data-cart-grand></strong></div><button class="checkout-btn" data-go-checkout>Continuar para checkout</button></div></aside><button class="cart-fab" data-cart-fab data-open-cart><span data-cart-fab-label>0 itens</span><strong data-cart-total></strong></button>';
  const footer=$('[data-app-footer]');
  if(footer) footer.innerHTML='<nav class="mobile-bottom-nav" aria-label="Navegação principal"><a href="index.html" aria-label="Início"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z"/></svg><span>Início</span></a><a href="menu.html" aria-label="Cardápio"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><span>Cardápio</span></a><a href="pedidos.html" aria-label="Pedidos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg><span>Pedidos</span></a><a href="favoritos.html" aria-label="Favoritos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg><span>Favoritos</span></a></nav><footer class="delivery-footer"><div class="wrap footer-grid"><div><div class="wordmark"><span class="wordmark-mark"></span><span>LUME</span></div><p>Delivery próprio da LUME. Projeto conceitual desenvolvido pela Alureal.</p></div><div><strong>Pedido</strong><p><a href="menu.html">Cardápio</a><br><a href="pedidos.html">Meus pedidos</a><br><a href="favoritos.html">Favoritos</a></p></div><div><strong>Restaurante</strong><p><a href="avaliacoes.html">Avaliações</a><br><a href="experiencia.html">Sobre a LUME</a><br><a href="journal.html">Journal</a></p></div></div></footer>';
}
const safeRun=(name,fn)=>{try{fn()}catch(error){console.error('[LUME] '+name+' failed',error)}};
function init(){
  safeRun('shell',renderShell);
  safeRun('theme',initTheme);
  safeRun('product-grids',renderProductGrids);
  safeRun('menu-catalog',renderMenuCatalog);
  safeRun('product-detail',renderProductDetail);
  safeRun('favorites',renderFavoritesState);
  safeRun('reviews',renderReviews);
  safeRun('cart-ui',renderCartUI);
  safeRun('cart-page',renderCartPage);
  safeRun('tracking',renderTracking);
  safeRun('orders',renderOrders);
  safeRun('global-cart',initGlobalCart);
  safeRun('store-favorite',initStoreFavorite);
  safeRun('search',initSearch);
  safeRun('coupon',initCoupon);
  safeRun('checkout',initCheckout);
  safeRun('location',initLocation);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();