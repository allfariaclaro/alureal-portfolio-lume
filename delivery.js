const DATA=window.LUME_DATA||{products:[],reviews:[],restaurant:{}};
const CART_KEY='lume-delivery-cart-v1';
const FAV_KEY='lume-delivery-favs-v1';
const ORDERS_KEY='lume-delivery-orders-v1';
const STORE_FAV='lume-store-favorite';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const getCart=()=>read(CART_KEY,[]);
const setCart=c=>{write(CART_KEY,c);renderCartUI();};
const getFavs=()=>read(FAV_KEY,[]);
const setFavs=f=>{write(FAV_KEY,f);renderFavoritesState();};
const toast=(msg)=>{let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(window.__lumeToast);window.__lumeToast=setTimeout(()=>t.classList.remove('show'),2200)};
const productById=id=>DATA.products.find(p=>p.id===id);
const cardMarkup=p=>{
  const fav=getFavs().includes(p.id);
  const promo=p.oldPrice?'<span class="badge promo">-'+Math.round((1-p.price/p.oldPrice)*100)+'%</span>':'';
  const badges=(p.badges||[]).map(b=>'<span class="badge">'+b+'</span>').join('');
  return '<article class="product-card" data-product-card="'+p.id+'" data-category="'+p.category+'">'+
    '<div class="product-photo"><a href="produto.html?id='+encodeURIComponent(p.id)+'"><img src="'+p.image+'" alt="'+p.name+'" loading="lazy"></a>'+
    '<div class="badges">'+promo+badges+'</div>'+
    '<button class="favorite-btn '+(fav?'active':'')+'" data-favorite="'+p.id+'" aria-label="Favoritar '+p.name+'">'+(fav?'♥':'♡')+'</button></div>'+
    '<div class="product-body"><div class="product-title-row"><h3><a href="produto.html?id='+encodeURIComponent(p.id)+'">'+p.name+'</a></h3><span class="mini-rating">★ '+p.rating+'</span></div>'+
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
  if((p.options||[]).some(g=>g.required)){location.href='produto.html?id='+encodeURIComponent(id);return}
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
function initSearch(){
  $$('[data-search]').forEach(input=>input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    $$('[data-product-card]').forEach(card=>{
      const p=productById(card.dataset.productCard);
      card.style.display=!q||[p.name,p.description,p.category,...(p.tags||[])].join(' ').toLowerCase().includes(q)?'':'none';
    });
  }));
}
function initCategoryChips(){
  $$('[data-category-filter]').forEach(b=>b.onclick=()=>{
    $$('[data-category-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const cat=b.dataset.categoryFilter;
    $$('[data-product-card]').forEach(card=>card.style.display=cat==='all'||cat==='destaques'||card.dataset.category===cat?'':'none');
    if(cat!=='all'&&cat!=='destaques') document.querySelector('[data-catalog-anchor]')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
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
function init(){
  renderProductGrids();renderMenuCatalog();renderProductDetail();renderFavoritesState();renderReviews();renderCartUI();renderCartPage();renderTracking();renderOrders();
  initGlobalCart();initStoreFavorite();initSearch();initCategoryChips();initCoupon();initCheckout();initLocation();
}
document.addEventListener('DOMContentLoaded',init);