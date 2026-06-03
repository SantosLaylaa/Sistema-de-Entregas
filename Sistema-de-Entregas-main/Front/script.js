const API_URL = "http://127.0.0.1:8000"; //para funcionar no live server por 5500
let widgetsAtivos = JSON.parse(localStorage.getItem('meuDashboard')) || [];

document.addEventListener("DOMContentLoaded", () => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    // Aplicar máscara de CPF no cadastro de alunos
    const inputCpfAluno = document.getElementById('aluno-cpf');
    if (inputCpfAluno) {
        inputCpfAluno.addEventListener('input', function (e) {
            let valor = e.target.value.replace(/\D/g, ""); // Remove não-números
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = valor;
        });
    }

    if (!tipoUsuario) {
        window.location.href = 'login.html';
        return;
    }

    if (tipoUsuario === 'aluno') {
        document.getElementById('menu-alunos').style.display = 'none';
        document.getElementById('menu-funcionarios').style.display = 'none';
        document.getElementById('menu-nova-entrega').style.display = 'none';
        document.getElementById('menu-historico').style.display = 'none';
        document.getElementById('menu-mensagens').style.display = 'none';
        
        // Esconde o campo de Matrícula no Agendamento para o Aluno
        const campoAgendamentoAluno = document.getElementById('agendamento-aluno-id');
        if(campoAgendamentoAluno) campoAgendamentoAluno.style.display = 'none';

        const restritosAluno = ['alunos', 'funcionarios', 'nova_entrega', 'historico', 'avisos', 'configuracoes', 'lembretes'];
        restritosAluno.forEach(id => {
            const btn = document.querySelector(`button[ondragstart*="${id}"]`);
            if (btn) btn.style.display = 'none';
        });

        widgetsAtivos = widgetsAtivos.filter(widget => !restritosAluno.includes(widget));
    }

    renderizarDashboard();

    const nome = localStorage.getItem('nomeUsuario') || "Usuário";
    const spanNome = document.getElementById('display-nome-usuario');
    
    if (spanNome) {
        spanNome.textContent = `Sr(a). ${nome}`;
    }
});

function fazerLogout() {
    localStorage.removeItem('tipoUsuarioLogado');
    window.location.href = 'login.html';
}

function toggleSubmenu(event, submenuId) {
    event.preventDefault(); 
    const submenu = document.getElementById(submenuId);
    const arrow = event.currentTarget.querySelector('.arrow');
    
    submenu.classList.toggle('open');
    if (arrow) {
        arrow.classList.toggle('rotate');
    }
}

function showSection(event, sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
    });
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active-section');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (sectionId === 'alunos-section') {
        listarAlunos();
    }
}

async function listarAlunos() {
    try {
        const response = await fetch(`${API_URL}/alunos`);
        if (!response.ok) throw new Error("Erro ao buscar alunos");
        
        const alunos = await response.json();
        const tbody = document.querySelector("#tabela-alunos tbody");
        tbody.innerHTML = ""; 

        alunos.forEach(aluno => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${aluno.id || '-'}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.matricula}</td>
                <td>${aluno.turma}</td>
                <td>${aluno.cpf}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Não foi possível estabelecer conexão com a API:", error);
    }
}

document.getElementById("form-aluno").addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- COMEÇO DA VALIDAÇÃO (PASSO 2) ---
    const cpfDigitado = document.getElementById("aluno-cpf").value;

    if (!validarCPF(cpfDigitado)) {
        alert("Por favor, insira um CPF válido.");
        document.getElementById("aluno-cpf").focus();
        return; // O return faz o código parar aqui e não continua o processo!
    }
    // --- FIM DA VALIDAÇÃO ---

    const dadosAluno = {
        nome: document.getElementById("aluno-nome").value,
        idade: parseInt(document.getElementById("aluno-idade").value),
        cpf: cpfDigitado, // <-- Repare que aqui mudei para usar a variável que criamos ali em cima
        rg: document.getElementById("aluno-rg").value,
        matricula: document.getElementById("aluno-matricula").value,
        turma: document.getElementById("aluno-turma").value
    };

    try {
        const response = await fetch(`${API_URL}/alunos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosAluno)
        });
        const resultado = await response.json();

        if (response.ok) {
            alert(`${resultado.mensagem}! ID: ${resultado.id}`);
            document.getElementById("form-aluno").reset(); 
            listarAlunos(); 
        } else {
            alert(`Erro: ${resultado.detail}`);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
});

document.getElementById("form-entrega").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dadosEntrega = {
        id_aluno: parseInt(document.getElementById("entrega-aluno-id").value),
        id_funcionario: parseInt(document.getElementById("entrega-func-id").value),
        data_entrega: document.getElementById("entrega-data").value,
        status: document.getElementById("entrega-status").value
    };

    try {
        const response = await fetch(`${API_URL}/entregas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosEntrega)
        });
        const resultado = await response.json();
        
        if (response.ok) {
            alert(resultado.mensagem);
            document.getElementById("form-entrega").reset();
        } else {
            alert(`Erro: ${resultado.detail}`);
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("form-funcionario").addEventListener("submit", async (e) => {
    e.preventDefault();
    const dadosFunc = {
        nome: document.getElementById("func-nome").value,
        matricula: document.getElementById("func-matricula").value
    };

    try {
        const response = await fetch(`${API_URL}/funcionarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosFunc)
        });
        const resultado = await response.json();
        
        if (response.ok) {
            alert(resultado.mensagem);
            document.getElementById("form-funcionario").reset();
        } else {
            alert(`Erro: ${resultado.detail}`);
        }
    } catch (error) {
        console.error(error);
    }
});

const widgetsHTML = {
    alunos: criarTemplateWidget('alunos', '👨‍🎓 Resumo de Alunos', `
        <table>
            <tr><th>Nome</th><th>Matrícula</th><th>Turma</th></tr>
            <tr><td colspan="3" style="text-align: center; padding: 25px; color: #64748b;">Nenhum aluno cadastrado ainda. A casa tá vazia! 🏠</td></tr>
        </table>
    `),
    
    funcionarios: criarTemplateWidget('funcionarios', '👷 Funcionários Ativos', `
        <table>
            <tr><th>Nome</th><th>Status</th></tr>
            <tr><td colspan="2" style="text-align: center; padding: 25px; color: #64748b;">Equipe descansando. Nenhum funcionário na rota! ☕</td></tr>
        </table>
    `),
    
    nova_entrega: criarTemplateWidget('nova_entrega', '📦 Entregas Pendentes', `
        <table>
            <tr><th>ID</th><th>Destino</th><th>Status</th></tr>
            <tr><td colspan="3" style="text-align: center; padding: 25px; color: #64748b;">Tudo entregue! Nenhuma pendência por aqui. ✨</td></tr>
        </table>
    `),
    
    rastreamento: criarTemplateWidget('rastreamento', '🚚 Rastreamento Rápido', `
        <div style="text-align: center; padding: 15px;">
            <input type="text" placeholder="Digite o código da encomenda..." style="margin-bottom: 15px; width: 100%;">
            <p style="color: #64748b; font-size: 14px;">Qual pacote vamos encontrar hoje? 🔎</p>
        </div>
    `),
    
    historico: criarTemplateWidget('historico', '📜 Últimos Históricos', `
        <table>
            <tr><th>Aluno</th><th>Data</th><th>Situação</th></tr>
            <tr><td colspan="3" style="text-align: center; padding: 25px; color: #64748b;">Ainda não temos histórias para contar. 📖</td></tr>
        </table>
    `),
    
    avisos: criarTemplateWidget('avisos', '⚠️ Quadro de Avisos', `
        <div style="text-align: center; padding: 30px; color: #64748b;">
            Tudo super tranquilo por aqui. Nenhum aviso novo! 🕊️
        </div>
    `),
    
    configuracoes: criarTemplateWidget('configuracoes', '⚙️ Status do Sistema', `
        <div style="text-align: center; padding: 20px; color: #64748b;">
            <p style="margin-bottom: 10px;">Tudo rodando perfeitamente. 🚀</p>
            <small>Aguardando sincronização com a API...</small>
        </div>
    `),
    
    lembretes: criarTemplateWidget('lembretes', '🔔 Lembretes Ativos', `
        <div style="text-align: center; padding: 30px; color: #64748b;">
            Mente vazia, caixa vazia. Aproveite o dia sem lembretes! 🧘‍♂️
        </div>
    `),
    
    agendamento: criarTemplateWidget('agendamento', '📅 Agendamentos', `
        <table>
            <tr><th>Hora</th><th>Aluno</th><th>Tipo</th></tr>
            <tr><td colspan="3" style="text-align: center; padding: 25px; color: #64748b;">Nada pra hoje! Pode relaxar. ☕</td></tr>
        </table>
    `)
};

function criarTemplateWidget(id, titulo, conteudo) {
    return `
        <div class="card" draggable="true" style="cursor: move;"
             ondragstart="iniciarArraste(event, '${id}', true)" 
             ondragover="permitirSoltar(event)" 
             ondrop="soltarNaPosicao(event, '${id}')">
            <div class="card-header">
                <h3>${titulo}</h3>
                <button class="btn btn-secondary" onclick="toggleWidget('${id}')">X</button>
            </div>
            <div>${conteudo}</div>
        </div>
    `;
}

function renderizarDashboard() {
    const container = document.getElementById('dashboard-container');
    container.innerHTML = ''; 
    
    widgetsAtivos.forEach(widget => {
        if (widgetsHTML[widget]) {
            container.innerHTML += widgetsHTML[widget];
        }
    });
}

function toggleWidget(nomeDoWidget) {
    const index = widgetsAtivos.indexOf(nomeDoWidget);
    if (index > -1) {
        widgetsAtivos.splice(index, 1);
    } else {
        widgetsAtivos.push(nomeDoWidget);
    }
    localStorage.setItem('meuDashboard', JSON.stringify(widgetsAtivos));
    renderizarDashboard();
}

function iniciarArraste(event, nomeDoWidget, isReorder = false) {
    event.dataTransfer.setData("widget", nomeDoWidget);
    event.dataTransfer.setData("isReorder", isReorder);
}

function permitirSoltar(event) {
    event.preventDefault(); 
}

function soltarNaPosicao(event, nomeDestino) {
    event.preventDefault();
    event.stopPropagation();
    
    const nomeOrigem = event.dataTransfer.getData("widget");
    const isReorder = event.dataTransfer.getData("isReorder") === "true";
    
    if (isReorder) {
        const indexOrigem = widgetsAtivos.indexOf(nomeOrigem);
        const indexDestino = widgetsAtivos.indexOf(nomeDestino);
        
        const temp = widgetsAtivos[indexDestino];
        widgetsAtivos[indexDestino] = widgetsAtivos[indexOrigem];
        widgetsAtivos[indexOrigem] = temp;
    } else {
        if (!widgetsAtivos.includes(nomeOrigem)) {
            const indexDestino = widgetsAtivos.indexOf(nomeDestino);
            widgetsAtivos.splice(indexDestino, 0, nomeOrigem);
        }
    }
    
    localStorage.setItem('meuDashboard', JSON.stringify(widgetsAtivos));
    renderizarDashboard();
}

function soltarWidget(event) {
    event.preventDefault();
    const nomeOrigem = event.dataTransfer.getData("widget");
    const isReorder = event.dataTransfer.getData("isReorder") === "true";
    
    if (!isReorder) {
        if (!widgetsAtivos.includes(nomeOrigem)) {
            widgetsAtivos.push(nomeOrigem);
        } else {
            alert("Este módulo já se encontra ativo no seu painel!");
            return;
        }
    }
    
    localStorage.setItem('meuDashboard', JSON.stringify(widgetsAtivos));
    renderizarDashboard();
}

function validarCPF(cpf) {
    // Remove tudo o que não for número
    cpf = cpf.replace(/[^\d]+/g, '');

    // Verifica se tem 11 dígitos ou se é uma sequência repetida conhecida (inválida)
    if (cpf == '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Valida o 1º dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.charAt(9))) return false;

    // Valida o 2º dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.charAt(10))) return false;

    return true;
}