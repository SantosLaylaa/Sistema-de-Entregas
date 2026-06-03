function switchTab(tipo) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));

    document.querySelector(`.tab-btn[onclick="switchTab('${tipo}')"]`).classList.add('active');
    document.getElementById(`form-login-${tipo}`).classList.add('active');
}

function toggleCadastro(mostrar) {
    if (mostrar) {
        document.getElementById('form-login-aluno').classList.remove('active');
        document.getElementById('form-cadastro-aluno').classList.add('active');
    } else {
        document.getElementById('form-cadastro-aluno').classList.remove('active');
        document.getElementById('form-login-aluno').classList.add('active');
    }
}

async function fazerLogin(tipo, event) {
    event.preventDefault(); 

    let matriculaDigitada, senhaDigitada, endpoint;

    // 1. Define quem está tentando logar
    if (tipo === 'aluno') {
        matriculaDigitada = document.getElementById('login-matricula-aluno').value;
        senhaDigitada = document.getElementById('login-senha-aluno').value;
        endpoint = 'http://127.0.0.1:8000/login/aluno';
    } else {
        matriculaDigitada = document.getElementById('login-matricula-func').value;
        senhaDigitada = document.getElementById('login-senha-func').value;
        endpoint = 'http://127.0.0.1:8000/login/funcionario';
    }

    try {
        // 2. Tenta conectar com a API
        const resposta = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula: matriculaDigitada, senha: matriculaDigitada ? senhaDigitada : "" }) // Pequena correção para garantir envio
        });

        // 3. Só agora processamos o que veio do Python
        if (resposta.ok) {
            const dados = await resposta.json(); 
            
            // 4. Grava a sessão apenas se deu certo
            localStorage.clear();
            localStorage.setItem('estaLogado', 'true');
            localStorage.setItem('usuarioId', dados.id);
            localStorage.setItem('tipoUsuario', tipo);
            localStorage.setItem('nomeUsuario', dados.nome);
            
            alert("Acesso liberado!");
            window.location.href = 'index.html'; 
        } else {
            // Se o servidor respondeu, mas com erro (ex: senha errada)
            const erro = await resposta.json();
            alert("Erro: " + erro.detail);
        }
    } catch (error) {
        // Se a API nem respondeu (terminal desligado ou erro de rede)
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor. O backend está ligado?");
    }
}

function loginGoogle() {
    localStorage.setItem('tipoUsuarioLogado', 'aluno');
    window.location.href = 'index.html';
}

function fazerCadastro(event) {
    event.preventDefault();
    
    const inputCpfCadastro = document.getElementById('cadastro-cpf');
    
    // Verifica se o campo existe e se o CPF é inválido
    if (inputCpfCadastro && !validarCPF(inputCpfCadastro.value)) {
        alert('O CPF introduzido não é válido. Verifique os números.');
        inputCpfCadastro.focus();
        return; // Pára a execução aqui e não submete
    }

    alert('Cadastro recebido! Os seus documentos foram enviados para análise. Aguarde a liberação do seu acesso.');
    toggleCadastro(false);
}

// Aplicar máscara de CPF no formulário de registro
document.addEventListener("DOMContentLoaded", () => {
    const inputCpfCadastro = document.getElementById('cadastro-cpf');
    if (inputCpfCadastro) {
        inputCpfCadastro.addEventListener('input', function (e) {
            let valor = e.target.value.replace(/\D/g, "");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = valor;
        });
    }
});

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