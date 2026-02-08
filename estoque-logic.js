// estoque-logic.js

// 1. Inicialização dos dados com sincronização forçada
let estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
let indexEdicao = null;

/**
 * Redesenha a tabela garantindo que os dados e índices estejam corretos
 */
function renderizarTabela(dadosParaExibir = null) {
    const corpo = document.getElementById('corpoTabela');
    if (!corpo) return;

    // Sincroniza a variável global caso não esteja filtrando
    if (!dadosParaExibir) {
        estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
    }
    
    const lista = dadosParaExibir || estoque;

    if (lista.length === 0) {
        corpo.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:80px; color:#94a3b8; font-size:16px;">
                    Nenhum item encontrado
                </td>
            </tr>`;
        return;
    }

    corpo.innerHTML = lista.map((item) => {
        // Encontra o index real no array original para não editar/excluir item errado ao filtrar
        const realIndex = estoque.findIndex(i => i.nome === item.nome);
        
        return `
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
                        <button onclick="prepararEdicao(${realIndex})" style="background: none; border: 1px solid #cbd5e1; color: #64748b; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            Editar
                        </button>
                        <button onclick="remover(${realIndex})" style="background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Função de busca
 */
function filtrarEstoque() {
    const inputBusca = document.getElementById('buscaEstoque');
    if (!inputBusca) return;

    const termo = inputBusca.value.toLowerCase();
    estoque = JSON.parse(localStorage.getItem('estoque_rj')) || []; 
    
    const filtrados = estoque.filter(item => 
        item.nome.toLowerCase().includes(termo) || 
        (item.descricao && item.descricao.toLowerCase().includes(termo))
    );
    
    renderizarTabela(filtrados);
}

/**
 * Funções do Modal
 */
function abrirModal() { 
    const modal = document.getElementById('modalEstoque');
    if (modal) modal.style.display = 'flex'; 
}

function fecharModal() { 
    const modal = document.getElementById('modalEstoque');
    if (modal) modal.style.display = 'none';
    
    indexEdicao = null; 
    const form = document.getElementById('formEstoque');
    if (form) form.reset(); 

    const titulo = document.querySelector('#modalEstoque h2');
    if (titulo) titulo.innerText = "Novo Item";
}

function prepararEdicao(index) {
    estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
    indexEdicao = index;
    const item = estoque[index];

    if (!item) return;

    document.getElementById('nomeItem').value = item.nome;
    document.getElementById('descItem').value = item.descricao || '';
    document.getElementById('qtdItem').value = item.quantidade;
    document.getElementById('unidadeItem').value = item.unidade;
    document.getElementById('locItem').value = item.localizacao || '';

    const titulo = document.querySelector('#modalEstoque h2');
    if (titulo) titulo.innerText = "Editar Item";
    
    abrirModal();
}

/**
 * A função que salva com CORREÇÃO MATEMÁTICA
 */
function salvarItem(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Captura os elementos para evitar erro de referência
    const elNome = document.getElementById('nomeItem');
    const elQtd = document.getElementById('qtdItem');

    if (!elNome.value || elQtd.value === "") {
        alert("Por favor, preencha o nome e a quantidade.");
        return;
    }

    const dadosItem = {
        nome: elNome.value,
        descricao: document.getElementById('descItem').value,
        quantidade: Number(elQtd.value), 
        unidade: document.getElementById('unidadeItem').value,
        localizacao: document.getElementById('locItem').value
    };

    // Recarrega o estoque antes de salvar para evitar sobrescrever dados de outras abas
    estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];

    if (indexEdicao !== null) {
        estoque[indexEdicao] = dadosItem;
    } else {
        estoque.push(dadosItem);
    }

    // Registro no histórico
    const log = {
        data: new Date().toLocaleString('pt-BR'),
        item: dadosItem.nome,
        tipo: indexEdicao !== null ? 'EDIÇÃO' : 'CADASTRO',
        quantidade: dadosItem.quantidade,
        usuario: 'Talita Marques'
    };
    
    let h = JSON.parse(localStorage.getItem('historico_rj')) || [];
    h.push(log);
    localStorage.setItem('historico_rj', JSON.stringify(h));

    // Salva no banco local
    localStorage.setItem('estoque_rj', JSON.stringify(estoque));

    // Limpa a busca e atualiza a tela
    const busca = document.getElementById('buscaEstoque');
    if (busca) busca.value = ''; 
    
    renderizarTabela();
    fecharModal();
}

function remover(index) {
    if (confirm("Deseja excluir este item?")) {
        estoque = JSON.parse(localStorage.getItem('estoque_rj')) || [];
        estoque.splice(index, 1);
        localStorage.setItem('estoque_rj', JSON.stringify(estoque));
        renderizarTabela();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarTabela();
});