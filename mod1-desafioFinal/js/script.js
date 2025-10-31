/* UTILITÁRIOS E KEYS */
   const $ = sel => document.querySelector(sel);
   const $$ = sel => Array.from(document.querySelectorAll(sel));
   
   const KEY_CLIENTES = 'pet_clientes';
   const KEY_PRODUTOS = 'pet_produtos';
   const KEY_CARRINHO = 'pet_carrinho';
   const KEY_THEME = 'pet_theme';
   
   /* INICIALIZAÇÃO DE PRODUTOS PADRÃO */
   function initProdutos() {
     if (!localStorage.getItem(KEY_PRODUTOS)) {
       const defaultProducts = [
         {id:1, nome:'Ração Premium 2kg', valor:59.90, img:'assets/racao.png', badge:'Novo'},
         {id:2, nome:'Coleira Confort', valor:29.90, img:'assets/coleira.png'},
         {id:3, nome:'Brinquedo Interativo', valor:19.90, img:'assets/brinquedo.png'}
       ];
       localStorage.setItem(KEY_PRODUTOS, JSON.stringify(defaultProducts));
     }
   }
   
   /* THEME: carregar + registrar botões */
   function applyThemeFromStorage() {
     const t = localStorage.getItem(KEY_THEME);
     if (t === 'dark') document.body.classList.add('dark');
   }
   function registerThemeButtons() {
     $$('[id^="themeToggle"]').forEach(btn => {
       if (!btn) return;
       btn.addEventListener('click', () => {
         document.body.classList.toggle('dark');
         const current = document.body.classList.contains('dark') ? 'dark' : 'light';
         localStorage.setItem(KEY_THEME, current);
       });
     });
   }
   
   /* CARRINHO: contador e adicionar */
   function getCarrinho() {
     return JSON.parse(localStorage.getItem(KEY_CARRINHO) || '[]');
   }
   function setCarrinho(c) {
     localStorage.setItem(KEY_CARRINHO, JSON.stringify(c));
     updateCartCounters();
   }
   function addToCart(prod) {
     const carr = getCarrinho();
     carr.push(prod);
     setCarrinho(carr);
     showToast(`${prod.nome} adicionado ao carrinho!`);
     // anima a bolinha do contador
     $$('.cart-count').forEach(el => {
       el.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:300});
     });
   }
   function updateCartCounters() {
     const count = getCarrinho().length;
     $$('.cart-count').forEach(el => el.textContent = count);
   }
   
   /* TOAST (feedback) */
   function showToast(text, time = 2000) {
     const t = document.createElement('div');
     t.className = 'toast';
     t.textContent = text;
     document.body.appendChild(t);
     // show
     requestAnimationFrame(()=> t.classList.add('show'));
     setTimeout(()=> {
       t.classList.remove('show');
       setTimeout(()=> t.remove(), 300);
     }, time);
   }
   
   /* PÁGINA: cadastro (index.html) */
   function indexPageInit() {
     const form = $('#cadastroForm');
     if (!form) return;
   
     applyThemeFromStorage(); registerThemeButtons(); initProdutos(); updateCartCounters();
   
     const totalClientes = $('#totalClientes');
     const totalAnimais = $('#totalAnimais');
     const proximos = $('#proximosAtendimentos');
   
     function atualizarResumo(){
       const clientes = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
       totalClientes.textContent = clientes.length;
       totalAnimais.textContent = clientes.length; // 1 animal por cliente no modelo
       const hoje = new Date().toISOString().slice(0,10);
       const atendHoje = clientes.filter(c => (c.tutor.dataAtendimento || '').slice(0,10) === hoje).length;
       proximos.textContent = atendHoje;
     }
     atualizarResumo();
   
     form.addEventListener('submit', (e) => {
       e.preventDefault();
       const cliente = {
         id: Date.now(),
         tutor: {
           nome: $('#nomeTutor').value.trim(),
           telefone: $('#telefoneTutor').value.trim(),
           endereco: $('#enderecoTutor').value.trim(),
           dataAtendimento: $('#dataAtendimento').value
         },
         animal: {
           nome: $('#nomeAnimal').value.trim(),
           idade: $('#idadeAnimal').value,
           porte: $('#porteAnimal').value,
           foto: $('#fotoAnimal').value.trim() || 'assets/animal.png'
         }
       };
       const clientes = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
       clientes.push(cliente);
       localStorage.setItem(KEY_CLIENTES, JSON.stringify(clientes));
   
       showToast('Cliente cadastrado com sucesso!', 1600);
       form.reset();
       atualizarResumo();
     });
   
     // limpar todos (apenas para facilitar testes)
     $('#limparClientes').addEventListener('click', () => {
       if (!confirm('Limpar todos os clientes do localStorage?')) return;
       localStorage.removeItem(KEY_CLIENTES);
       showToast('Clientes removidos', 1200);
       atualizarResumo();
     });
   }
   
   /* PÁGINA: clientes (clientes.html) */
   function clientesPageInit() {
     const grid = $('#clientesGrid');
     if (!grid) return;
   
     applyThemeFromStorage(); registerThemeButtons(); initProdutos(); updateCartCounters();
   
     const modal = $('#modal');
     const modalContent = $('#modalContent');
     const closeModal = $('#closeModal');
     const searchInput = $('#searchInput');
     const filtroPorte = $('#filtroPorte');
     const ordenarBtn = $('#ordenarData');
   
     function abrirModal(html) {
       modalContent.innerHTML = html;
       modal.style.display = 'flex';
       modal.setAttribute('aria-hidden','false');
     }
     function fecharModal() {
       modal.style.display = 'none';
       modal.setAttribute('aria-hidden','true');
     }
     closeModal.addEventListener('click', fecharModal);
     modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
   
     function renderClientes() {
       const raw = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
       let clientes = raw.slice();
       const q = (searchInput?.value || '').toLowerCase();
       if (q) clientes = clientes.filter(c => (c.tutor.nome + ' ' + c.animal.nome).toLowerCase().includes(q));
       if (filtroPorte?.value) clientes = clientes.filter(c => c.animal.porte === filtroPorte.value);
       grid.innerHTML = '';
       if (!clientes.length) {
         grid.innerHTML = '<p class="hint">Nenhum cliente encontrado.</p>';
         return;
       }
       clientes.forEach(c => {
         const div = document.createElement('div');
         div.className = 'client-card';
         div.innerHTML = `
           <img src="${c.animal.foto}" alt="${c.animal.nome}" class="card-img" />
           <div class="title">${c.animal.nome}</div>
           <div class="meta">Atendimento: ${c.tutor.dataAtendimento || '—'}</div>
           <div class="actions">
             <button class="btn" data-id="${c.id}">Ver</button>
           </div>
         `;
         grid.appendChild(div);
         div.querySelector('button').addEventListener('click', () => {
           const html = `
             <h2>${c.tutor.nome} — ${c.animal.nome}</h2>
             <p><strong>Telefone:</strong> ${c.tutor.telefone}</p>
             <p><strong>Endereço:</strong> ${c.tutor.endereco}</p>
             <p><strong>Data do atendimento:</strong> ${c.tutor.dataAtendimento}</p>
             <p><strong>Porte:</strong> ${c.animal.porte} • <strong>Idade:</strong> ${c.animal.idade} anos</p>
             <img src="${c.animal.foto}" alt="foto" style="width:100%;border-radius:8px;margin-top:8px">
           `;
           abrirModal(html);
         });
       });
     }
   
     searchInput?.addEventListener('input', renderClientes);
     filtroPorte?.addEventListener('change', renderClientes);
     ordenarBtn?.addEventListener('click', () => {
       const clientes = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
       clientes.sort((a,b) => new Date(a.tutor.dataAtendimento) - new Date(b.tutor.dataAtendimento));
       localStorage.setItem(KEY_CLIENTES, JSON.stringify(clientes));
       renderClientes();
     });
   
     renderClientes();
   }
   
   /* PÁGINA: produtos (produtos.html) */
   function produtosPageInit() {
     const grid = $('#produtosGrid');
     if (!grid) return;
   
     applyThemeFromStorage(); registerThemeButtons(); initProdutos(); updateCartCounters();
   
     const produtos = JSON.parse(localStorage.getItem(KEY_PRODUTOS) || '[]');
   
     function renderProdutos() {
       grid.innerHTML = '';
       produtos.forEach(p => {
         const div = document.createElement('div');
         div.className = 'product-card';
         div.innerHTML = `
           <img src="${p.img}" alt="${p.nome}" class="card-img" />
           <div class="title">${p.nome}</div>
           <div class="meta">R$ ${typeof p.valor === 'number' ? p.valor.toFixed(2) : p.valor}</div>
           <div class="actions">
             <div>
               <button class="btn primary" data-id="${p.id}">Adicionar</button>
             </div>
             ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
           </div>
         `;
         grid.appendChild(div);
         div.querySelector('button').addEventListener('click', () => {
           addToCart(p);
         });
       });
     }
   
     renderProdutos();
   }
   
   /* DASHBOARD: estatísticas simples */
   function dashboardInit() {
     if (!$('#dashClientes') && !$('#dashProdutos')) return;
     applyThemeFromStorage(); registerThemeButtons(); initProdutos(); updateCartCounters();
   
     const clientes = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
     const produtos = JSON.parse(localStorage.getItem(KEY_PRODUTOS) || '[]');
     const carrinho = JSON.parse(localStorage.getItem(KEY_CARRINHO) || '[]');
   
     $('#dashClientes').textContent = clientes.length;
     $('#dashProdutos').textContent = produtos.length;
     $('#dashCarrinho').textContent = carrinho.length;
   }
   
   /* BOOTSTRAP: detecta página e inicializa */
   document.addEventListener('DOMContentLoaded', () => {
     initProdutos();
     updateCartCounters();
     applyThemeFromStorage();
     registerThemeButtons();
   
     indexPageInit();
     clientesPageInit();
     produtosPageInit();
     dashboardInit();
   });
   