const header=document.querySelector('[data-header]');
const toggle=document.querySelector('[data-menu-toggle]');
const nav=document.querySelector('[data-nav]');
const tabs=[...document.querySelectorAll('[data-menu-tab]')];
const panels=[...document.querySelectorAll('[data-menu-panel]')];
const form=document.querySelector('[data-reservation-form]');
const message=document.querySelector('[data-form-message]');

const onScroll=()=>header?.classList.toggle('scrolled',window.scrollY>20);
onScroll();window.addEventListener('scroll',onScroll,{passive:true});

toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav?.classList.toggle('open',!open);document.body.classList.toggle('menu-open',!open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('open');document.body.classList.remove('menu-open')}));

tabs.forEach(tab=>tab.addEventListener('click',()=>{const target=tab.dataset.menuTab;tabs.forEach(t=>{const active=t===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active))});panels.forEach(p=>p.hidden=p.dataset.menuPanel!==target)}));

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

form?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);message.textContent=`Demonstração: mesa para ${data.get('pessoas')} em ${data.get('data')} às ${data.get('horario')} pronta para integração com o sistema de reservas.`;});

// portfolio-polish-2026-09-29
const closeMainMenu=()=>{toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('open');document.body.classList.remove('menu-open');if(toggle)toggle.textContent='Menu'};
toggle?.addEventListener('click',()=>{toggle.textContent=toggle.getAttribute('aria-expanded')==='true'?'Fechar':'Menu'});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){closeMainMenu();toggle?.focus()}});
