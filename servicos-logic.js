// servicos-logic.js

// Variáveis globais
let servicos = JSON.parse(localStorage.getItem('servicos_rj')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes_rj')) || [];
let indexEdicao = null;
let filtroAtual = 'Todos';
const USUARIO_ATIVO = "Talita Marques";

/**
 * Renderiza a tabela garantindo a sincronização em tempo real
 */
function renderizarServicos(dados = null) {
    const corpo = document.getElementById('corpoServicos');
    if (!corpo) return;

    if (!dados) {
        servicos = JSON.parse(localStorage.getItem('servicos_rj')) || [];
    }

    let dadosParaExibir = dados || servicos;
    
    if (!dados && filtroAtual !== 'Todos') {
        dadosParaExibir = servicos.filter(s => s.status === filtroAtual);
    }

    if (dadosParaExibir.length === 0) {
        // Atualizado colspan para 8 devido à nova coluna de observações
        corpo.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum serviço encontrado.</td></tr>';
        return;
    }

    const logs = [...dadosParaExibir].reverse();

    corpo.innerHTML = logs.map((s) => {
        const realIndex = servicos.findIndex(orig => orig.id === s.id);
        const statusAtual = s.status || "Não Iniciado";
        const badgeClass = statusAtual.toLowerCase().replace(/\s+/g, '-');
        
        // Lógica para a coluna Detalhes da Chapa
        let infoChapa;
        if (s.origemChapa === 'Empresa') {
            infoChapa = `<div style="font-size: 11px; line-height: 1.2;">
                            <span style="color: #2563eb; font-weight: 700;">Empresa:</span> ${s.chapaSelecionada || 'Não informada'}<br>
                            <span style="color: #64748b;">Tam: ${s.tamanhoChapa || '---'}</span>
                         </div>`;
        } else {
            infoChapa = `<span style="color: #64748b; font-style: italic;">Chapa do Cliente</span>`;
        }

        // Lógica para exibir a Observação diretamente na tabela
        const textoObs = s.descricao ? 
            `<div style="max-width: 200px; font-size: 11px; color: #64748b; white-space: pre-wrap; line-height: 1.3;">${s.descricao}</div>` : 
            '<span style="color: #cbd5e1; font-style: italic;">Sem observações</span>';
        
        let valorDisplay;
        if (s.valorFinal) {
            valorDisplay = `<strong>R$ ${parseFloat(s.valorFinal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>`;
        } else if (s.orcamento) {
            valorDisplay = `R$ ${parseFloat(s.orcamento).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        } else {
            valorDisplay = '<span style="color: #94a3b8; font-style: italic;">A calcular</span>';
        }

        return `
        <tr>
            <td style="color: #64748b; font-size: 11px;">${s.dataExibicao || '---'}</td>
            <td><strong>👤 ${s.cliente}</strong></td>
            <td>${s.categoria}</td>
            <td>${infoChapa}</td>
            <td>${textoObs}</td> <td>${valorDisplay}</td>
            <td><span class="badge ${badgeClass}">${statusAtual}</span></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="abrirRastreio(${realIndex})" class="btn-details">Detalhes</button>
                    <button onclick="prepararEdicao(${realIndex})" class="btn-details">Editar</button>
                    <button onclick="excluirServico(${realIndex})" class="btn-delete">Excluir</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Salva a O.S. e força a atualização sem F5
 */
function salvarServico(e) {
    e.preventDefault();

    const statusNovo = document.getElementById('statusServico').value;
    const valorFinal = document.getElementById('valorFinalServico').value;
    const agora = new Date().toLocaleString('pt-BR');

    if (!confirm(`Deseja confirmar a alteração para o status: ${statusNovo}?`)) {
        return;
    }

    if (statusNovo === 'Nota Emitida' && !valorFinal) {
        alert("Por favor, informe o Valor Final para emitir a nota.");
        return;
    }

    servicos = JSON.parse(localStorage.getItem('servicos_rj')) || [];

    let historicoLogs = [];
    if (indexEdicao !== null) {
        historicoLogs = servicos[indexEdicao].historico || [];
        const ultimoStatus = historicoLogs.length > 0 ? historicoLogs[historicoLogs.length - 1].status : null;
        if (statusNovo !== ultimoStatus) {
            historicoLogs.push({ status: statusNovo, dataHora: agora, responsavel: USUARIO_ATIVO });
        }
    } else {
        historicoLogs.push({ status: statusNovo, dataHora: agora, responsavel: USUARIO_ATIVO });
    }

    const novoServico = {
        id: indexEdicao !== null ? servicos[indexEdicao].id : Date.now(),
        // Garante que a data não fique "undefined" em novos registros
        dataExibicao: indexEdicao !== null ? servicos[indexEdicao].dataExibicao : agora.split(',')[0],
        cliente: document.getElementById('clienteServico').value,
        categoria: document.getElementById('categoriaServico').value,
        orcamento: document.getElementById('orcamentoServico').value,
        valorFinal: valorFinal || null,
        origemChapa: document.getElementById('origemChapa').value,
        tamanhoChapa: document.getElementById('tamanhoChapa').value,
        chapaSelecionada: document.getElementById('origemChapa').value === 'Empresa' ? document.getElementById('chapaParaCortar').value : null,
        status: statusNovo,
        tempo: document.getElementById('tempoServico').value,
        descricao: document.getElementById('descServico').value,
        historico: historicoLogs
    };

    if (indexEdicao !== null) {
        servicos[indexEdicao] = novoServico;
    } else {
        servicos.push(novoServico);
    }

    localStorage.setItem('servicos_rj', JSON.stringify(servicos));
    fecharModalServico();

    setTimeout(() => {
        renderizarServicos(); 
    }, 50);
}

/**
 * Abre o rastreamento estilo "Correios"
 */
function abrirRastreio(index) {
    servicos = JSON.parse(localStorage.getItem('servicos_rj')) || [];
    const s = servicos[index];
    if (!s) return;
    
    const timeline = document.getElementById('timelineRastreio');
    
    timeline.innerHTML = (s.historico || []).slice().reverse().map((log, i) => `
        <div style="position: relative; margin-bottom: 25px;">
            <div style="position: absolute; left: -31px; top: 4px; width: 12px; height: 12px; background: ${i === 0 ? '#2563eb' : '#cbd5e1'}; border-radius: 50%; border: 2px solid white;"></div>
            <div style="font-weight: 700; color: #1e293b; font-size: 14px; text-transform: uppercase;">${log.status}</div>
            <div style="font-size: 12px; color: #64748b;">${log.dataHora}</div>
            <div style="font-size: 11px; color: #94a3b8;">Realizado por: <strong>${log.responsavel}</strong></div>
        </div>
    `).join('');

    document.getElementById('modalRastreio').style.display = 'flex';
}

function fecharModalRastreio() {
    document.getElementById('modalRastreio').style.display = 'none';
}

/**
 * Prepara o modal para edição
 */
function prepararEdicao(index) {
    servicos = JSON.parse(localStorage.getItem('servicos_rj')) || [];
    indexEdicao = index;
    const s = servicos[index];
    
    abrirModalServico();
    document.getElementById('clienteServico').value = s.cliente;
    document.getElementById('categoriaServico').value = s.categoria;
    document.getElementById('orcamentoServico').value = s.orcamento;
    document.getElementById('valorFinalServico').value = s.valorFinal || '';
    document.getElementById('origemChapa').value = s.origemChapa;
    
    toggleTamanhoChapa(); 
    if(s.origemChapa === 'Empresa') {
        document.getElementById('chapaParaCortar').value = s.chapaSelecionada || '';
        document.getElementById('tamanhoChapa').value = s.tamanhoChapa || '';
    }

    document.getElementById('statusServico').value = s.status;
    document.getElementById('tempoServico').value = s.tempo || '';
    document.getElementById('descServico').value = s.descricao;
    
    gerenciarCamposDinamicos();
    document.getElementById('tituloModalServ').innerText = "Editar O.S. #" + s.id.toString().slice(-4);
}

// Funções Auxiliares mantidas
function gerenciarCamposDinamicos() {
    const status = document.getElementById('statusServico').value;
    const groupTempo = document.getElementById('groupTempoServico');
    groupTempo.style.display = ['Finalizado', 'Nota Emitida', 'Coletado'].includes(status) ? 'block' : 'none';

    const groupValor = document.getElementById('groupValorFinal');
    groupValor.style.display = ['Nota Emitida', 'Coletado'].includes(status) ? 'block' : 'none';
}

function toggleTamanhoChapa() {
    const origem = document.getElementById('origemChapa').value;
    const group = document.getElementById('groupDadosChapaEmpresa');
    group.style.display = origem === 'Empresa' ? 'flex' : 'none';
}

function filtrarPorCliente() {
    const termo = document.getElementById('buscaServicoCliente').value.toLowerCase();
    const filtrados = servicos.filter(s => s.cliente.toLowerCase().includes(termo));
    renderizarServicos(filtrados);
}

function abrirModalServico() {
    clientes = JSON.parse(localStorage.getItem('clientes_rj')) || [];
    const selectCliente = document.getElementById('clienteServico');
    if (clientes.length === 0) {
        alert("Cadastre clientes antes.");
        window.location.href = 'painel_clientes.html';
        return;
    }
    selectCliente.innerHTML = '<option value="" disabled selected>Selecione...</option>' + 
        clientes.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    document.getElementById('modalServico').style.display = 'flex';
}

function fecharModalServico() {
    document.getElementById('modalServico').style.display = 'none';
    document.getElementById('formServico').reset();
    document.getElementById('groupDadosChapaEmpresa').style.display = 'none';
    document.getElementById('groupTempoServico').style.display = 'none';
    document.getElementById('groupValorFinal').style.display = 'none';
    indexEdicao = null;
    document.getElementById('tituloModalServ').innerText = "Nova Ordem de Serviço";
}

function excluirServico(index) {
    if (confirm("Deseja excluir esta Ordem de Serviço?")) {
        servicos.splice(index, 1);
        localStorage.setItem('servicos_rj', JSON.stringify(servicos));
        renderizarServicos();
    }
}

function filtrarServicos(status) {
    filtroAtual = status;
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
        const texto = btn.innerText.trim();
        if (status === 'Todos' && texto === 'Todos' || texto === status + 's' || texto === status || (status === 'Nota Emitida' && texto === status)) {
            btn.classList.add('active');
        }
    });
    renderizarServicos();
}

renderizarServicos();