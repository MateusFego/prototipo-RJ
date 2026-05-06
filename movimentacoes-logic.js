// movimentacoes-logic.js

let estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
let historico = JSON.parse(localStorage.getItem('historico_rj')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes_rj')) || []; 
let indexEdicao = null;
let filtroAtual = 'Todas'; // Armazena o estado do filtro

/**
 * Renderiza a tabela principal sincronizada com o Storage
 */
function renderizarMovimentacoes() {
    // Sincroniza dados antes de renderizar para garantir valores numéricos reais
    estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
    historico = JSON.parse(localStorage.getItem('historico_rj')) || [];
    filtrar(filtroAtual); 
}

/**
 * Função de Filtragem (Todas, Entradas, Saídas)
 */
function filtrar(tipo) {
    filtroAtual = tipo;
    
    // Atualiza a cor dos botões
    const botoes = document.querySelectorAll('.btn-filter');
    botoes.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === tipo || (tipo === 'Entrada' && btn.innerText === 'Entradas') || (tipo === 'Saída' && btn.innerText === 'Saídas')) {
            btn.classList.add('active');
        }
    });

    // Pega o texto que o usuário digitou
    const inputBusca = document.getElementById('buscaMovimentacao');
    const termoBusca = inputBusca ? inputBusca.value.toLowerCase() : '';

    let dadosParaExibir = historico;

    // Filtra pelos botões (Entrada/Saída)
    if (tipo !== 'Todas') {
        dadosParaExibir = dadosParaExibir.filter(m => m.tipo === tipo.toUpperCase());
    }
    
    // Filtra pelo texto da pesquisa (Nome do item ou Usuário)
    if (termoBusca) {
        dadosParaExibir = dadosParaExibir.filter(m => 
            m.item.toLowerCase().includes(termoBusca) || 
            m.usuario.toLowerCase().includes(termoBusca)
        );
    }

    const corpo = document.getElementById('corpoMovimentacoes');
    if (!corpo) return;

    if (dadosParaExibir.length === 0) {
        corpo.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">Nenhuma movimentação encontrada.</td></tr>`;
        return;
    }

    // Trava a posição real para não bugar ao inverter a lista
    const logsComId = dadosParaExibir.map((mov, indexReal) => {
        return { dados: mov, indexReal: indexReal };
    }).reverse();

    // Desenha a tabela na tela (Apenas com o botão de Detalhes)
    corpo.innerHTML = logsComId.map((itemObj) => {
        const mov = itemObj.dados;
        const realIndex = itemObj.indexReal; 
        
        return `
        <tr>
            <td style="color: #64748b; font-size: 11px;">${mov.data}</td>
            <td><strong>${mov.item}</strong></td>
            <td><span class="badge ${mov.tipo.toLowerCase()}">${mov.tipo}</span></td>
            <td><strong>${mov.quantidade}</strong></td>
            <td>${mov.tipo === 'SAÍDA' ? `👤 ${mov.cliente || 'Consumidor'}` : '---'}</td>
            <td style="color: #64748b; font-size: 13px;">${mov.usuario}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="verDetalhes(${realIndex})" class="btn-details">Ver Detalhes</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}




function verDetalhes(index) {
    const mov = historico[index];
    const modal = document.getElementById('modalDetalhes');
    const container = document.getElementById('conteudoDetalhes');
    if (container) {
        container.innerHTML = `
            <div style="display: grid; gap: 8px; text-align: left;">
                <p><strong>Item:</strong> ${mov.item}</p>
                <p><strong>Tipo:</strong> ${mov.tipo}</p>
                <p><strong>Quantidade:</strong> ${mov.quantidade}</p>
                <p><strong>Responsável:</strong> ${mov.usuario}</p>
                <p><strong>Destino:</strong> ${mov.cliente}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                <p><strong>Observação:</strong></p>
                <p style="color: #64748b;">${mov.observacao || 'Nenhuma observação.'}</p>
            </div>`;
    }
    if (modal) modal.style.display = 'flex';
}

function fecharModalDetalhes() { 
    document.getElementById('modalDetalhes').style.display = 'none'; 
}

// Inicialização
renderizarMovimentacoes();