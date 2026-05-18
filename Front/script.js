const API_URL = "http://127.0.0.1:5500";

// Função para expandir e retrair os submenus
function toggleSubmenu(event, submenuId) {
    event.preventDefault(); // Evita que a tela pule para o topo ao clicar no link vazio ("#")
    
    const submenu = document.getElementById(submenuId);
    const arrow = event.currentTarget.querySelector('.arrow');
    
    // Alterna a classe 'open' para mostrar/esconder
    submenu.classList.toggle('open');
    
    // Alterna a classe 'rotate' para girar a setinha
    if (arrow) {
        arrow.classList.toggle('rotate');
    }
}
// Função para alternar entre as telas do painel lateral
function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active-section');
    });
    // Remove classe ativa dos links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostra a seção desejada
    document.getElementById(sectionId).classList.add('active-section');
    // Adiciona classe ativa no botão clicado
    event.currentTarget.classList.add('active');

    // Se abrir a tela de alunos, já carrega a lista automaticamente
    if (sectionId === 'alunos-section') {
        listarAlunos();
    }
}

// ---------------------------------------------------
// ENDPOINT 1: Listar Alunos (GET)
// ---------------------------------------------------
async function listarAlunos() {
    try {
        const response = await fetch(`${API_URL}/alunos`);
        if (!response.ok) throw new Error("Erro ao buscar alunos");
        
        const alunos = await response.json();
        const tbody = document.querySelector("#tabela-alunos tbody");
        tbody.innerHTML = ""; // Limpa a tabela antes de carregar

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
        alert("Não foi possível conectar à API. Certifique-se de que o FastAPI está rodando.");
        console.error(error);
    }
}

// ---------------------------------------------------
// ENDPOINT 2: Cadastrar Aluno (POST)
// ---------------------------------------------------
document.getElementById("form-aluno").addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const dadosAluno = {
        nome: document.getElementById("aluno-nome").value,
        idade: parseInt(document.getElementById("aluno-idade").value),
        cpf: document.getElementById("aluno-cpf").value,
        rg: document.getElementById("aluno-rg").value,
        matricula: document.getElementById("aluno-matricula").value,
        turma: document.getElementById("aluno-turma").value
    };

    try {
        const response = await fetch(`${API_URL}/alunos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosAluno)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(`${resultado.mensagem}! ID: ${resultado.id}`);
            document.getElementById("form-aluno").reset(); // Limpa os campos
            listarAlunos(); // Atualiza a tabela
        } else {
            alert(`Erro: ${resultado.detail}`);
        }
    } catch (error) {
        alert("Erro na requisição.");
        console.error(error);
    }
});

// ---------------------------------------------------
// ENDPOINT 5: Registrar Entrega (POST)
// ---------------------------------------------------
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

// ---------------------------------------------------
// ENDPOINT 6: Cadastrar Funcionário (POST)
// ---------------------------------------------------
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

// Executa automaticamente ao carregar a página para preencher a tabela inicial
window.onload = listarAlunos;