// admin-charts.js

// 1. Configurações Globais (Cores e Comportamento)
const bluePrimary = '#2563eb';
const greenSuccess = '#10b981';
const grayText = '#64748b';

// Recuperação de dados reais
const servicosReal = JSON.parse(localStorage.getItem('servicos_rj')) || [];
const estoqueReal = JSON.parse(localStorage.getItem('estoque_rj')) || [];

// Esta configuração trava o tamanho do gráfico dentro do card
const optionsGerais = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                boxWidth: 12,
                padding: 15,
                font: { size: 11 }
            }
        }
    }
};

/**
 * 2. Ranking de Clientes (Baseado em Serviços Reais)
 * Soma o Valor Final de cada cliente.
 */
const faturamentoPorCliente = {};
servicosReal.forEach(s => {
    const valor = Number(s.valorFinal || s.orcamento || 0); // Correção matemática
    faturamentoPorCliente[s.cliente] = (faturamentoPorCliente[s.cliente] || 0) + valor;
});

// Ordena os top 4 clientes
const topClientesLabels = Object.keys(faturamentoPorCliente).sort((a, b) => faturamentoPorCliente[b] - faturamentoPorCliente[a]).slice(0, 4);
const topClientesValores = topClientesLabels.map(label => faturamentoPorCliente[label]);

new Chart(document.getElementById('chartTopClientes'), {
    type: 'bar',
    data: {
        labels: topClientesLabels.length > 0 ? topClientesLabels : ['Nenhum dado'],
        datasets: [{
            label: 'Total Comprado (R$)',
            data: topClientesValores.length > 0 ? topClientesValores : [0],
            backgroundColor: bluePrimary,
            borderRadius: 5
        }]
    },
    options: {
        ...optionsGerais,
        indexAxis: 'y',
        plugins: { ...optionsGerais.plugins, legend: { display: false } }
    }
});

/**
 * 3. Receita por Categoria (Doughnut Dinâmico)
 * Soma faturamento por "Canivete" ou "Peças Gerais".
 */
const categorias = { 'Canivete': 0, 'Peças Gerais': 0 };
servicosReal.forEach(s => {
    const valor = Number(s.valorFinal || s.orcamento || 0);
    if (categorias[s.categoria] !== undefined) {
        categorias[s.categoria] += valor;
    }
});

new Chart(document.getElementById('chartCategorias'), {
    type: 'doughnut',
    data: {
        labels: Object.keys(categorias),
        datasets: [{
            data: Object.values(categorias),
            backgroundColor: [bluePrimary, '#94a3b8']
        }]
    },
    options: {
        ...optionsGerais,
        cutout: '70%'
    }
});

/**
 * 4. Ticket Médio Mensal (Linha Dinâmica)
 * Calcula a média de valor por O.S. baseada na data.
 */
const ticketPorMes = {};
servicosReal.forEach(s => {
    // Extrai o mês da data (formato DD/MM/AAAA)
    const mes = s.dataExibicao ? s.dataExibicao.split('/')[1] : '00';
    const valor = Number(s.valorFinal || s.orcamento || 0);
    
    if (!ticketPorMes[mes]) ticketPorMes[mes] = { total: 0, qtd: 0 };
    ticketPorMes[mes].total += valor;
    ticketPorMes[mes].qtd += 1;
});

const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ticketValores = mesesLabels.map((_, i) => {
    const m = (i + 1).toString().padStart(2, '0');
    if (!ticketPorMes[m]) return 0;
    return ticketPorMes[m].total / ticketPorMes[m].qtd;
});

new Chart(document.getElementById('chartTicketMedio'), {
    type: 'line',
    data: {
        labels: mesesLabels,
        datasets: [{
            label: 'Valor Médio/Pedido',
            data: ticketValores,
            borderColor: greenSuccess,
            borderWidth: 3,
            fill: false,
            tension: 0.3
        }]
    },
    options: optionsGerais
});

/**
 * 5. Quantidade em Estoque (Barras Reais)
 * Mostra os 5 itens com maior quantidade.
 */
const topEstoque = [...estoqueReal].sort((a, b) => Number(b.quantidade) - Number(a.quantidade)).slice(0, 5);

new Chart(document.getElementById('chartValorEstoque'), {
    type: 'bar',
    data: {
        labels: topEstoque.map(i => i.nome),
        datasets: [{
            label: 'Qtd em Estoque',
            data: topEstoque.map(i => Number(i.quantidade)),
            backgroundColor: '#1e2937'
        }]
    },
    options: {
        ...optionsGerais,
        plugins: { ...optionsGerais.plugins, legend: { display: false } }
    }
});