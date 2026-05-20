// 1. Nossa "Base de Dados" em memória
const usuariosSimulados = [
    { email: "patrao@rj.com", senha: "123", cargo: "ADMIN" },
    { email: "estoque@rj.com", senha: "123", cargo: "ESTOQUE" },
    { email: "financeiro@rj.com", senha: "123", cargo: "FINANCEIRO" },
    { email: "operador@rj.com", senha: "123", cargo: "OPERADOR" }
];

// 2. A função que o formulário chama ao clicar em "Entrar"
function validarLogin(event) {
    // Impede a página de recarregar e perder os dados
    event.preventDefault();

    const emailInput = document.getElementById('email').value;
    const senhaInput = document.getElementById('senha').value;

    // Busca o usuário na nossa lista
    const usuario = usuariosSimulados.find(u => u.email === emailInput && u.senha === senhaInput);

    if (usuario) {
        // Salva os dados no navegador para as outras páginas saberem quem logou
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        // Mapeamento de para onde cada um deve ir
        const rotas = {
            'ADMIN': 'painel_admin.html',
            'ESTOQUE': 'painel_estoque.html',
            'FINANCEIRO': 'painel_financeiro.html',
            'OPERADOR': 'painel_operador.html'
        };

        // Redireciona para a página correta
        window.location.href = rotas[usuario.cargo];
    } else {
        alert("E-mail ou senha incorretos! Tente novamente.");
    }
}