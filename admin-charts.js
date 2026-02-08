// admin-charts.js

// 1. Configurações Globais (Cores e Comportamento)
const bluePrimary = '#2563eb';
const greenSuccess = '#10b981';
const grayText = '#64748b';

// Esta configuração é o que trava o tamanho do gráfico dentro do card
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

// 2. Ranking de Clientes (Barras Horizontais)
new Chart(document.getElementById('chartTopClientes'), {
    type: 'bar',
    data: {
        labels: ['AgroForte', 'Fazenda Sol', 'MaqPecas', 'Usina Vale'],
        datasets: [{
            label: 'Total Comprado (R$)',
            data: [15200, 12800, 9400, 7850],
            backgroundColor: bluePrimary,
            borderRadius: 5
        }]
    },
    options: {
        ...optionsGerais,
        indexAxis: 'y',
        plugins: { ...optionsGerais.plugins, legend: { display: false } } // Sem legenda para este
    }
});

// 3. Receita por Serviço (Doughnut)
new Chart(document.getElementById('chartCategorias'), {
    type: 'doughnut',
    data: {
        labels: ['Corte Laser', 'Dobra', 'Material', 'Calandra', 'Pecas'],
        datasets: [{
            data: [60, 25, 15, 10, 5],
            backgroundColor: [bluePrimary, greenSuccess, '#94a3b8']
        }]
    },
    options: {
        ...optionsGerais,
        cutout: '70%'
    }
});

// 4. Ticket Médio (Linha)
new Chart(document.getElementById('chartTicketMedio'), {
    type: 'line',
    data: {
        labels: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'],
        datasets: [{
            label: 'Valor Médio/Pedido',
            data: [1200, 1350, 1100, 1800, 1650, 1900],
            borderColor: greenSuccess,
            borderWidth: 3,
            fill: false,
            tension: 0.3
        }]
    },
    options: optionsGerais
});

// 5. Valor em Estoque (Barras Verticais)
new Chart(document.getElementById('chartValorEstoque'), {
    type: 'bar',
    data: {
        labels: ['Aço Carbono', 'Inox', 'Talas'],
        datasets: [{
            label: 'Valor Estimado (R$)',
            data: [25000, 18000, 7000],
            backgroundColor: '#1e2937'
        }]
    },
    options: {
        ...optionsGerais,
        plugins: { ...optionsGerais.plugins, legend: { display: false } }
    }
});