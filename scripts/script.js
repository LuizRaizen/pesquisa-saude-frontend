// ========== Funções de formatação ==========

// Converte o texto da IA em HTML visual formatado
function formatarHTML(respostaTexto) {
  const blocos = respostaTexto
    .split(/\n+/)
    .map(linha => {
      linha = linha.trim();

      // Detecta padrão: número. **Título:** Conteúdo (com ou sem dois pontos)
      const match = linha.match(/^\d+\.\s\*\*(.*?)\*\*[:\-–—]?\s?(.*)$/);
      if (match) {
        const titulo = match[1];
        const conteudo = match[2];
        return `
          <div class="mb-3">
            <strong class="titulo-dica fs-5 d-block">${titulo}</strong>
            <p class="mb-0">${conteudo}</p>
          </div>`;
      }

      // Detecta: **Título:** Conteúdo (sem número)
      const matchSimples = linha.match(/^\*\*(.*?)\*\*[:\-–—]?\s?(.*)$/);
      if (matchSimples) {
        const titulo = matchSimples[1];
        const conteudo = matchSimples[2];
        return `
          <div class="mb-3">
            <strong class="titulo-dica fs-5 d-block">${titulo}</strong>
            <p class="mb-0">${conteudo}</p>
          </div>`;
      }

      // Parágrafo simples
      return `<p>${linha}</p>`;
    });

  return blocos.join("\n");
}

// Prepara o texto da IA para envio via WhatsApp (sem asteriscos e com espaçamento duplo)
function formatarParaWhatsApp(texto) {
  return texto
    .replace(/\*\*/g, '')         // remove os **
    .replace(/\n/g, '\n\n')       // adiciona espaçamento entre parágrafos
    .trim();
}

// ========== Lógica principal do formulário ==========
document.getElementById("questionario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  if (!nome) {
    alert("Por favor, preencha seu nome.");
    return;
  }
  const email = document.getElementById("email").value.trim();

  const erroEmail = document.getElementById("erroEmail");
  const erroPerguntas = document.getElementById("erroPerguntas");

  // Limpa mensagens anteriores
  [erroEmail, erroPerguntas].forEach(el => {
    el.textContent = "";
    el.classList.add("d-none");
  });

  // Validação de e-mail (opcional)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erroEmail.textContent = "E-mail inválido.";
    erroEmail.classList.remove("d-none");
    return;
  }

  // Captura e validação das perguntas
  const respostas = [];
  let todasRespondidas = true;

  for (let i = 1; i <= 10; i++) {
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    if (checked) {
      respostas.push(checked.nextSibling.textContent.trim());
    } else {
      respostas.push("Não respondeu");
      todasRespondidas = false;
    }
  }

  if (!todasRespondidas) {
    erroPerguntas.textContent = "Por favor, responda todas as perguntas.";
    erroPerguntas.classList.remove("d-none");
    return;
  }

  // Mostrar carregando
  document.getElementById("carregando").classList.remove("d-none");

  // Enviar para a API
  let data;
  try {
    const response = await fetch("https://pesquisa-saude-backend.onrender.com/processar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, respostas })
    });
    data = await response.json();
  } catch (erro) {
    alert("Erro ao enviar dados. Verifique sua conexão ou o servidor.");
    document.getElementById("carregando").classList.add("d-none");
    return;
  }

  // Esconder carregando e formulário
  document.getElementById("carregando").classList.add("d-none");
  document.getElementById("questionario").classList.add("d-none");

  // Mostrar nova tela com a resposta
  document.getElementById("telaResposta").classList.remove("d-none");
  document.getElementById("respostaVisual").innerHTML = formatarHTML(data.resposta);
});
