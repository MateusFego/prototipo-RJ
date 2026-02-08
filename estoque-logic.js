// estoque-logic.js

// 1. Inicialização dos dados
let estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
let indexEdicao = null;

/**
 * Redesenha a tabela na tela sem recarregar a página
 */
function renderizarTabela() {
    const corpo = document.getElementById('corpoTabela');
    if (!corpo) return; // Segurança caso o elemento não exista
    
    if (estoque.length === 0) {
        corpo.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:80px; color:#94a3b8; font-size:16px;">
                    Nenhum item cadastrado
                </td>
            </tr>`;
        return;
    }

    corpo.innerHTML = estoque.map((item, index) => `
        <tr>
            <td style="color: #1e293b;"><strong>${item.nome}</strong></td>
            <td style="color: #64748b;">${item.descricao || '-'}</td>
            <td>
                <strong style="color: #1e293b;">${item.quantidade}</strong> 
                <span style="color: #64748b; font-size: 12px; margin-left: 4px;">${item.unidade}</span>
            </td>
            <td style="color: #64748b;">${item.localizacao || '-'}</td>
            <td>
                <div style="display: flex; gap: 10px;">
                    <button onclick="prepararEdicao(${index})" style="background: none; border: 1px solid #cbd5e1; color: #64748b; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Editar
                    </button>
                    <button onclick="remover(${index})" style="background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Funções do Modal
 */
function abrirModal() { 
    document.getElementById('modalEstoque').style.display = 'flex'; 
}

function fecharModal() { 
    document.getElementById('modalEstoque').style.display = 'none';
    indexEdicao = null; 
    document.getElementById('formEstoque').reset(); 
    document.querySelector('#modalEstoque h2').innerText = "Novo Item";
}

function prepararEdicao(index) {
    indexEdicao = index;
    const item = estoque[index];

    // Preenche os campos
    document.getElementById('nomeItem').value = item.nome;
    document.getElementById('descItem').value = item.descricao;
    document.getElementById('qtdItem').value = item.quantidade;
    document.getElementById('unidadeItem').value = item.unidade;
    document.getElementById('locItem').value = item.localizacao;

    document.querySelector('#modalEstoque h2').innerText = "Editar Item";
    abrirModal();
}

/**
 * A função que salva e atualiza a tela na hora
 */
function salvarItem(event) {
    event.preventDefault(); // Impede o refresh da página
    event.stopPropagation(); // Garante que o evento pare aqui

    const dadosItem = {
        nome: document.getElementById('nomeItem').value,
        descricao: document.getElementById('descItem').value,
        quantidade: document.getElementById('qtdItem').value,
        unidade: document.getElementById('unidadeItem').value,
        localizacao: document.getElementById('locItem').value
    };

    if (indexEdicao !== null) {
        estoque[indexEdicao] = dadosItem;
    } else {
        estoque.push(dadosItem);
    }
    // Dentro da função salvarItem no estoque-logic.js, antes de fechar o modal:
const log = {
    data: new Date().toLocaleString(),
    item: dadosItem.nome,
    tipo: indexEdicao !== null ? 'EDIÇÃO' : 'ENTRADA',
    quantidade: dadosItem.quantidade,
    usuario: 'Talita Marques'
};
let h = JSON.parse(localStorage.getItem('historico_rj')) || [];
h.push(log);
localStorage.setItem('historico_rj', JSON.stringify(h));

    // Persistência
    localStorage.setItem('estoque_rj', JSON.stringify(estoque));

    // Atualização Visual Imediata
    renderizarTabela();
    fecharModal();
    
    console.log("Item salvo com sucesso!");
}

function remover(index) {
    if (confirm("Deseja excluir este item?")) {
        estoque.splice(index, 1);
        localStorage.setItem('estoque_rj', JSON.stringify(estoque));
        renderizarTabela();
    }
}

// Renderiza ao carregar
renderizarTabela();