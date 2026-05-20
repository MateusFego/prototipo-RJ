// clientes-logic.js

let clientes = JSON.parse(localStorage.getItem('clientes_rj')) || [];
let indexEdicao = null;

/**
 * Renderiza a tabela de clientes
 */
function renderizarClientes(dados = clientes) {
    const corpo = document.getElementById('corpoClientes');
    if (!corpo) return;

    if (dados.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum cliente cadastrado.</td></tr>';
        return;
    }

    corpo.innerHTML = dados.map((c, index) => `
        <tr>
            <td><strong>${c.nome}</strong></td>
            <td>${c.telefone || '---'}</td>
            <td>${c.documento || '---'}</td>
            <td>${c.cidade || '---'}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="prepararEdicao(${index})" class="btn-details">Editar</button>
                    <button onclick="excluirCliente(${index})" class="btn-delete">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function abrirModalCliente() {
    document.getElementById('modalCliente').style.display = 'flex';
}

function fecharModalCliente() {
    document.getElementById('modalCliente').style.display = 'none';
    document.getElementById('formCliente').reset();
    indexEdicao = null;
    document.getElementById('tituloModal').innerText = "Novo Cliente";
}

/**
 * Salva ou Atualiza o cliente com todos os novos campos
 */
function salvarCliente(e) {
    e.preventDefault();
    
    const novoCliente = {
        nome: document.getElementById('nomeCliente').value,
        documento: document.getElementById('docCliente').value,
        telefone: document.getElementById('telCliente').value,
        email: document.getElementById('emailCliente').value,
        endereco: document.getElementById('endCliente').value,
        cidade: document.getElementById('cidadeCliente').value,
        estado: document.getElementById('ufCliente').value,
        observacoes: document.getElementById('obsCliente').value
    };

    if (indexEdicao !== null) {
        clientes[indexEdicao] = novoCliente;
    } else {
        clientes.push(novoCliente);
    }

    localStorage.setItem('clientes_rj', JSON.stringify(clientes));
    fecharModalCliente();
    renderizarClientes();
}

/**
 * Carrega todos os dados no modal para edição
 */
function prepararEdicao(index) {
    indexEdicao = index;
    const c = clientes[index];
    
    document.getElementById('nomeCliente').value = c.nome;
    document.getElementById('docCliente').value = c.documento || '';
    document.getElementById('telCliente').value = c.telefone || '';
    document.getElementById('emailCliente').value = c.email || '';
    document.getElementById('endCliente').value = c.endereco || '';
    document.getElementById('cidadeCliente').value = c.cidade || '';
    document.getElementById('ufCliente').value = c.estado || '';
    document.getElementById('obsCliente').value = c.observacoes || '';
    
    document.getElementById('tituloModal').innerText = "Editar Cliente";
    abrirModalCliente();
}

function excluirCliente(index) {
    if (confirm(`Deseja realmente excluir o cliente ${clientes[index].nome}?`)) {
        clientes.splice(index, 1);
        localStorage.setItem('clientes_rj', JSON.stringify(clientes));
        renderizarClientes();
    }
}

/**
 * Busca dinâmica por nome ou documento
 */
function buscarClientes() {
    const termo = document.getElementById('buscaCliente').value.toLowerCase();
    const filtrados = clientes.filter(c => 
        c.nome.toLowerCase().includes(termo) || 
        (c.documento && c.documento.includes(termo))
    );
    renderizarClientes(filtrados);
}

// Inicializa a tabela
renderizarClientes();