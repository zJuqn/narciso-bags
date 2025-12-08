/* SIMPLE CART (localStorage) */
const CART_KEY = 'narciso_cart_v1';

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('#cart-count,#cart-count-2,#cart-count-3,#cart-count-4,#cart-count-5,#cart-count-6').forEach(el=>{
    if(el) el.textContent = count;
  });
  const elCount = document.getElementById('cart-items-count');
  if(elCount) elCount.textContent = count;
}

/* Add to cart utility used by pages */
function addToCart(product){
  let cart = getCart();
  const found = cart.find(i=>i.id === product.id && i.size === product.size);
  if(found) found.qty += product.qty;
  else cart.push(product);
  saveCart(cart);
}

/* DOM ready */
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();

  // size selection (global)
  document.querySelectorAll('.sizes .size-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const parent = btn.parentElement;
      parent.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // mini contact forms
  const miniContact = document.getElementById('mini-contact');
  if(miniContact){
    miniContact.addEventListener('submit', function(e){
      e.preventDefault();
      alert('Mensaje enviado. ¡Gracias!');
      miniContact.reset();
    });
  }
  const fullContact = document.getElementById('contact-full');
  if(fullContact){
    fullContact.addEventListener('submit', function(e){
      e.preventDefault();
      alert('Mensaje enviado. Nuestro equipo te responderá pronto.');
      fullContact.reset();
    });
  }

  // render cart if on cart page
  if(document.getElementById('cart-items')){
    renderCart();
  }

  // CHATBOT - Initialize after DOM is ready
  setTimeout(initChatbot, 100);
});

/* renderCart() - dibuja items en cart.html */
function renderCart(){
  const cart = getCart();
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if(cart.length === 0){
    container.innerHTML = '<p class="muted">Tu carrito está vacío.</p>';
  } else {
    cart.forEach((item, index)=>{
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div style="flex:1">
          <div style="font-weight:600">${item.name}</div>
          <div class="muted">$${item.price.toFixed(2)} • ${item.size}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center">
          <div class="qty-controls">
            <button class="decrease" data-index="${index}">-</button>
            <span style="padding:0 12px">${item.qty}</span>
            <button class="increase" data-index="${index}">+</button>
            <button class="remove" data-index="${index}" style="margin-left:8px;background:none;border:0;cursor:pointer">🗑️</button>
          </div>
        </div>
      `;
      container.appendChild(itemEl);
    });

    // attach events
    container.querySelectorAll('.decrease').forEach(b=>{
      b.addEventListener('click', ()=> {
        const idx = +b.dataset.index;
        let cart = getCart();
        if(cart[idx].qty > 1) cart[idx].qty--;
        else cart.splice(idx,1);
        saveCart(cart);
        renderCart();
      });
    });
    container.querySelectorAll('.increase').forEach(b=>{
      b.addEventListener('click', ()=> {
        const idx = +b.dataset.index;
        let cart = getCart();
        cart[idx].qty++;
        saveCart(cart);
        renderCart();
      });
    });
    container.querySelectorAll('.remove').forEach(b=>{
      b.addEventListener('click', ()=>{
        const idx = +b.dataset.index;
        let cart = getCart();
        cart.splice(idx,1);
        saveCart(cart);
        renderCart();
      });
    });
  }

  // update summary
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const subtotal = cart.reduce((s,i)=>s + i.qty * i.price, 0);
  if(subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if(totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
  updateCartCount();

  // CHATBOT
  initChatbot();
}

function initChatbot(){
  // Check if chatbot already exists
  if(document.getElementById('chatbot-widget')) return;
  
  const chatbotHTML = `
    <div id="chatbot-widget" class="chatbot-widget">
      <div id="chatbot-icon" class="chatbot-icon">
        <span>💬</span>
      </div>
      <div id="chatbot-window" class="chatbot-window">
        <div class="chatbot-header">
          <h3>Chatbot</h3>
          <button id="close-chatbot" class="close-chatbot">&times;</button>
        </div>
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chatbot-msg bot-msg">
            <p>¡Hola! Soy un chatbot. ¿En qué puedo ayudarte?</p>
          </div>
        </div>
        <div class="chatbot-input-area">
          <input id="chatbot-input" type="text" placeholder="Escribe un mensaje..." />
          <button id="send-btn" class="send-btn">➤</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  
  // Wait for DOM to be ready
  setTimeout(() => {
    const icon = document.getElementById('chatbot-icon');
    const window_ = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('close-chatbot');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    
    if(!icon || !window_ || !closeBtn || !sendBtn || !input || !messagesContainer) return;
    
    // Toggle chat window
    icon.addEventListener('click', ()=>{
      window_.classList.toggle('active');
      if(window_.classList.contains('active')){
        input.focus();
      }
    });
    
    // Close chat
    closeBtn.addEventListener('click', ()=>{
      window_.classList.remove('active');
    });
    
    // Send message
    function sendMessage(){
      const msg = input.value.trim();
      if(!msg) return;
      
      // User message
      const userMsgEl = document.createElement('div');
      userMsgEl.className = 'chatbot-msg user-msg';
      userMsgEl.innerHTML = `<p>${msg}</p>`;
      messagesContainer.appendChild(userMsgEl);
      input.value = '';
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Bot response
      setTimeout(()=>{
        const botMsgEl = document.createElement('div');
        botMsgEl.className = 'chatbot-msg bot-msg';
        botMsgEl.innerHTML = `<p>⏳ Lo siento, esta función todavía está en proceso. ¡Pronto podremos ayudarte mejor!</p>`;
        messagesContainer.appendChild(botMsgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 600);
    }
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e)=>{
      if(e.key === 'Enter') sendMessage();
    });
  }, 50);
}

