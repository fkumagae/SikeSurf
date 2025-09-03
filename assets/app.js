// Envolva tudo para garantir que o DOM exista (se não usar 'defer' no <script>)
document.addEventListener('DOMContentLoaded', () => {
  // Cria o banner
  const banner = document.createElement('div');
  banner.id = 'welcome-banner';
  banner.innerHTML = 'Não perca! Última Chance <button id="close-banner" aria-label="Fechar"></button>';
  document.body.appendChild(banner);
  // Fecha o banner ao clicar no botão
  document.getElementById('close-banner').onclick = function() {
    banner.classList.add('hide');
    setTimeout(() => banner.remove(), 400);
  };

  // Relógio digital
  const clock = document.createElement('div');
  clock.id = 'digital-clock';
  document.body.appendChild(clock);
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clock.textContent = `${h}:${m}:${s}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Botões dos tipos de prancha e input hidden que guarda o valor
  const tipoBtns = document.querySelectorAll('#tipoPranchaBtns .thumb');
  const tipoPranchaInput = document.getElementById('tipoPrancha');

  // Opcional: cor e miniatura (adicione no HTML abaixo)
  const corPrancha = document.getElementById('corPrancha');            // <input type="color">
  const miniatura = document.getElementById('miniaturaPrancha');       // <div para exibir o SVG>

  // SVGs para cada tipo (usa placeholder COLOR que será substituída pela cor)
  const svgs = {
    shortboard: `<svg width="180" height="40" viewBox="0 0 180 40"><rect x="10" y="10" width="160" height="20" rx="10" fill="COLOR" stroke="#333" stroke-width="2"/><ellipse cx="20" cy="20" rx="10" ry="10" fill="COLOR" stroke="#333" stroke-width="2"/><ellipse cx="160" cy="20" rx="10" ry="10" fill="COLOR" stroke="#333" stroke-width="2"/></svg>`,
    longboard:  `<svg width="220" height="40" viewBox="0 0 220 40"><rect x="10" y="10" width="200" height="20" rx="15" fill="COLOR" stroke="#333" stroke-width="2"/></svg>`,
    fish:       `<svg width="180" height="40" viewBox="0 0 180 40"><rect x="20" y="10" width="140" height="20" rx="12" fill="COLOR" stroke="#333" stroke-width="2"/><polygon points="10,20 20,10 20,30" fill="COLOR" stroke="#333" stroke-width="2"/><polygon points="170,20 160,10 160,30" fill="COLOR" stroke="#333" stroke-width="2"/></svg>`,
    funboard:   `<svg width="200" height="40" viewBox="0 0 200 40"><rect x="15" y="10" width="170" height="20" rx="13" fill="COLOR" stroke="#333" stroke-width="2"/></svg>`,
    gun:        `<svg width="220" height="40" viewBox="0 0 220 40"><rect x="20" y="12" width="180" height="16" rx="8" fill="COLOR" stroke="#333" stroke-width="2"/></svg>`
  };

  let tipoSelecionado = tipoPranchaInput?.value || '';

  // Atualiza a miniatura (se existir no HTML)
  function atualizarMiniatura() {
    if (!miniatura) return; // caso não tenha área de miniatura na página
    const cor = (corPrancha && corPrancha.value) || '#0ea5e9';
    if (tipoSelecionado && svgs[tipoSelecionado]) {
      miniatura.innerHTML = svgs[tipoSelecionado].replace(/COLOR/g, cor);
      miniatura.style.display = 'block';
    } else {
      miniatura.style.display = 'none';
      miniatura.innerHTML = '';
    }
  }

  // Clique nos botões de tipo
  tipoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tipoSelecionado = btn.getAttribute('data-type') || '';
      if (tipoPranchaInput) tipoPranchaInput.value = tipoSelecionado;

      // Marca visualmente o selecionado
      tipoBtns.forEach(b => b.classList.toggle('selecionado', b === btn));

      atualizarMiniatura();
    });
  });

  // Mudar cor reflete na miniatura (se existir)
  if (corPrancha) {
    corPrancha.addEventListener('input', atualizarMiniatura);
  }

  // Estado inicial
  atualizarMiniatura();

  // Restaurar preferência de tema
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Botão de alternância de tema
  const themeBtn = document.createElement('button');
  themeBtn.className = 'theme-toggle-btn';
  themeBtn.title = 'Alternar tema';
  themeBtn.innerHTML = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  document.body.appendChild(themeBtn);
  themeBtn.onclick = function() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Rolagem suave para seções
  document.querySelectorAll('nav a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Jogo da roleta
  const roletaContainer = document.createElement('div');
  roletaContainer.id = 'roleta-container';
  roletaContainer.innerHTML = `
    <div id="roleta-result">Gire a roleta e ganhe cashback!</div>
    <button id="roleta-btn">Girar roleta</button>
    <div id="roleta-pontos"></div>
  `;
  document.body.appendChild(roletaContainer);

  const roletaBtn = document.getElementById('roleta-btn');
  const roletaResult = document.getElementById('roleta-result');
  const roletaPontos = document.getElementById('roleta-pontos');

  // Pontuação acumulada
  let pontos = Number(localStorage.getItem('cashback-pontos')) || 0;
  roletaPontos.textContent = `Cashback acumulado: ${pontos} pontos`;

  // Controle de tempo
  let podeGirar = true;
  let ultimoGiro = Number(localStorage.getItem('roleta-ultimo-giro')) || 0;
  function atualizarBotao() {
    const agora = Date.now();
    if (agora - ultimoGiro < 10000) {
      podeGirar = false;
      const restante = Math.ceil((10000 - (agora - ultimoGiro)) / 1000);
      roletaBtn.textContent = `Aguarde ${restante}s`;
      roletaBtn.disabled = true;
    } else {
      podeGirar = true;
      roletaBtn.textContent = 'Girar roleta';
      roletaBtn.disabled = false;
    }
  }
  setInterval(atualizarBotao, 1000);
  atualizarBotao();

  roletaBtn.onclick = function() {
    if (!podeGirar) return;
    // Valores possíveis da roleta
    const valores = [5, 10, 15, 20, 25, 50];
    const sorteado = valores[Math.floor(Math.random() * valores.length)];
    pontos += sorteado;
    roletaResult.textContent = `Você ganhou ${sorteado} pontos!`;
    roletaPontos.textContent = `Cashback acumulado: ${pontos} pontos`;
    localStorage.setItem('cashback-pontos', pontos);
    ultimoGiro = Date.now();
    localStorage.setItem('roleta-ultimo-giro', ultimoGiro);
    atualizarBotao();
  };
});


// Calculadora de volume ideal
const idadeInput = document.getElementById('idade');
const alturaInput = document.getElementById('altura');
const pesoInput = document.getElementById('peso');
const nivelInput = document.getElementById('nivel');
const calcularBtn = document.getElementById('calcular-volume');
const resultadoDiv = document.getElementById('resultado-volume');

if (calcularBtn) {
  calcularBtn.onclick = function() {
    const idade = Number(idadeInput.value);
    const altura = Number(alturaInput.value);
    const peso = Number(pesoInput.value);
    const nivel = nivelInput.value;

    if (!idade || !altura || !peso || !nivel) {
      resultadoDiv.textContent = 'Preencha todos os campos!';
      resultadoDiv.style.color = 'red';
      return;
    }

    // Fórmula simplificada para volume ideal (em litros)
    // Iniciante: peso x 0.45, Intermediário: peso x 0.38, Avançado: peso x 0.33
    let fator = 0.45;
    if (nivel === 'intermediario') fator = 0.38;
    if (nivel === 'avancado') fator = 0.33;

    // Ajuste leve por altura e idade
    let ajuste = 1;
    if (altura > 185) ajuste += 0.05;
    if (idade < 16) ajuste += 0.05;
    if (idade > 50) ajuste += 0.05;

    const volume = Math.round(peso * fator * ajuste * 10) / 10;

    resultadoDiv.textContent = `Volume ideal estimado: ${volume} litros`;
    resultadoDiv.style.color = '#0ea5e9';
  };
}

