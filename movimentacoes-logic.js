// movimentacoes-logic.js

let estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
let historico = JSON.parse(localStorage.getItem('historico_rj')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes_rj')) || []; 
let indexEdicao = null;
let filtroAtual = 'Todas'; // Armazena o estado do filtro

/**
 * Renderiza a tabela principal
 */
function renderizarMovimentacoes() {
    filtrar(filtroAtual); // Aplica o filtro atual ao renderizar
}

/**
 * Função de Filtragem (Todas, Entradas, Saídas)
 */
function filtrar(tipo) {
    filtroAtual = tipo;
    
    // 1. Atualiza visual dos botões
    const botoes = document.querySelectorAll('.btn-filter');
    botoes.forEach(btn => {
        btn.classList.remove('active');
        // Compara o texto do botão com o tipo selecionado
        if (btn.innerText === tipo || (tipo === 'Entrada' && btn.innerText === 'Entradas') || (tipo === 'Saída' && btn.innerText === 'Saídas')) {
            btn.classList.add('active');
        }
    });

    // 2. Filtra os dados
    let dadosParaExibir = historico;
    if (tipo !== 'Todas') {
        dadosParaExibir = historico.filter(m => m.tipo === tipo.toUpperCase());
    }

    // 3. Renderiza a tabela com os dados filtrados
    const corpo = document.getElementById('corpoMovimentacoes');
    if (!corpo) return;

    if (dadosParaExibir.length === 0) {
        corpo.innerHTML = `<tr><td colspan="7" class="empty-state">Nenhuma movimentação ${tipo !== 'Todas' ? tipo.toLowerCase() : ''} encontrada.</td></tr>`;
        return;
    }

    const logs = [...dadosParaExibir].reverse();

    corpo.innerHTML = logs.map((mov) => {
        // Encontra o index real no histórico original para ações de editar/excluir
        const realIndex = historico.findIndex(h => h.data === mov.data && h.item === mov.item);
        
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
                    <button onclick="verDetalhes(${realIndex})" class="btn-details">Detalhes</button>
                    <button onclick="prepararEdicaoMov(${realIndex})" class="btn-details">Editar</button>
                    <button onclick="excluirMovimentacao(${realIndex})" class="btn-delete">Excluir</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Registro e Edição
 */
function registrarMovimentacao(e) {
    e.preventDefault();

    const nomeItem = document.getElementById('itemMov').value;
    const tipo = document.getElementById('tipoMov').value;
    const qtdNova = parseInt(document.getElementById('qtdMov').value);
    const cliente = tipo === 'Saída' ? document.getElementById('clienteMov').value : '---';
    const observacao = document.getElementById('obsMov').value;

    const idxEstoque = estoque.findIndex(i => i.nome === nomeItem);

    if (indexEdicao !== null) {
        const movAntiga = historico[indexEdicao];
        if (idxEstoque !== -1) {
            if (movAntiga.tipo === "ENTRADA") estoque[idxEstoque].quantidade -= movAntiga.quantidade;
            else estoque[idxEstoque].quantidade += movAntiga.quantidade;
        }
    }

    if (idxEstoque !== -1) {
        if (tipo === "Entrada") estoque[idxEstoque].quantidade += qtdNova;
        else {
            if (estoque[idxEstoque].quantidade < qtdNova) {
                alert("Saldo insuficiente!");
                return;
            }
            estoque[idxEstoque].quantidade -= qtdNova;
        }
        localStorage.setItem('estoque_rj', JSON.stringify(estoque));
    }

    const dadosMov = {
        data: indexEdicao !== null ? historico[indexEdicao].data : new Date().toLocaleString('pt-BR'),
        item: nomeItem,
        tipo: tipo.toUpperCase(),
        quantidade: qtdNova,
        cliente: cliente,
        observacao: observacao,
        usuario: "Talita Marques"
    };

    if (indexEdicao !== null) historico[indexEdicao] = dadosMov;
    else historico.push(dadosMov);

    localStorage.setItem('historico_rj', JSON.stringify(historico));
    fecharModalMov();
    renderizarMovimentacoes();
}

/**
 * Exclusão com Estorno
 */
function excluirMovimentacao(index) {
    const mov = historico[index];
    if (!confirm(`Deseja excluir a movimentação de ${mov.item}? O estoque será corrigido.`)) return;

    const idxEstoque = estoque.findIndex(i => i.nome === mov.item);
    if (idxEstoque !== -1) {
        if (mov.tipo === "ENTRADA") estoque[idxEstoque].quantidade -= mov.quantidade;
        else estoque[idxEstoque].quantidade += mov.quantidade;
        localStorage.setItem('estoque_rj', JSON.stringify(estoque));
    }

    historico.splice(index, 1);
    localStorage.setItem('historico_rj', JSON.stringify(historico));
    renderizarMovimentacoes();
}

function prepararEdicaoMov(index) {
    indexEdicao = index;
    const mov = historico[index];
    abrirModalMov();
    document.getElementById('tipoMov').value = mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
    document.getElementById('itemMov').value = mov.item;
    document.getElementById('qtdMov').value = mov.quantidade;
    document.getElementById('obsMov').value = mov.observacao || '';
    toggleCliente();
    if (mov.tipo === 'SAÍDA') document.getElementById('clienteMov').value = mov.cliente;
    document.querySelector('#modalMovimentacao h2').innerText = "Editar Movimentação";
}

function toggleCliente() {
    const tipo = document.getElementById('tipoMov').value;
    const groupCliente = document.getElementById('groupCliente');
    if (groupCliente) groupCliente.style.display = tipo === 'Saída' ? 'block' : 'none';
}

function abrirModalMov() {
    const selectItem = document.getElementById('itemMov');
    const selectCliente = document.getElementById('clienteMov');
    if (estoque.length === 0) { alert("Cadastre itens primeiro."); return; }
    selectItem.innerHTML = '<option value="" disabled selected>Selecione...</option>' + 
        estoque.map(item => `<option value="${item.nome}">${item.nome}</option>`).join('');
    if (selectCliente) {
        selectCliente.innerHTML = '<option value="" disabled selected>Selecione o cliente...</option>' + 
            clientes.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    }
    document.getElementById('modalMovimentacao').style.display = 'flex';
}

function fecharModalMov() {
    document.getElementById('modalMovimentacao').style.display = 'none';
    document.getElementById('formMovimento').reset();
    document.querySelector('#modalMovimentacao h2').innerText = "Nova Movimentação";
    indexEdicao = null;
    if (document.getElementById('groupCliente')) document.getElementById('groupCliente').style.display = 'none';
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

function fecharModalDetalhes() { document.getElementById('modalDetalhes').style.display = 'none'; }

// Inicialização
renderizarMovimentacoes();