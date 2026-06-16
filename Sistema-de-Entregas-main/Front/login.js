// --- 1. CONTROLE DE ABAS (ALUNO / FUNCIONÁRIO) ---
function switchTab(tipo) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));

    document.querySelector(`.tab-btn[onclick="switchTab('${tipo}')"]`).classList.add('active');
    document.getElementById(`form-login-${tipo}`).classList.add('active');
}

// --- 2. MOSTRAR / ESCONDER CADASTRO ---
function toggleCadastro(mostrar) {
    if (mostrar) {
        document.getElementById('form-login-aluno').classList.remove('active');
        document.getElementById('form-cadastro-aluno').classList.add('active');
    } else {
        document.getElementById('form-cadastro-aluno').classList.remove('active');
        document.getElementById('form-login-aluno').classList.add('active');
    }
}

// --- 3. LOGIN TRADICIONAL (MATRÍCULA E SENHA) ---
async function fazerLogin(tipo, event) {
    event.preventDefault(); // Impede a página de recarregar sozinha

    let matriculaDigitada, senhaDigitada, endpoint;

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
        const resposta = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula: matriculaDigitada, senha: senhaDigitada })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.clear();
            localStorage.setItem('estaLogado', 'true');
            localStorage.setItem('usuarioId', dados.id);
            localStorage.setItem('tipoUsuario', tipo);
            localStorage.setItem('nomeUsuario', dados.nome);

            alert("Acesso liberado!");
            window.location.href = 'index.html';
        } else {
            alert("Erro: " + dados.detail);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor. O backend está ligado?");
    }
}

// --- 4. LOGIN COM GOOGLE ---
async function tratarRespostaDoGoogle(response) {
    const tokenGoogle = response.credential;

    try {
        const respostaBackend = await fetch("http://127.0.0.1:8000/login/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenGoogle })
        });

        const dados = await respostaBackend.json();

        if (respostaBackend.ok) {
            localStorage.clear();
            localStorage.setItem('estaLogado', 'true');
            localStorage.setItem('tipoUsuario', 'aluno');
            localStorage.setItem('nomeUsuario', dados.nome);

            alert(dados.mensagem);
            window.location.href = 'index.html';
        } else {
            alert("Acesso negado: " + dados.detail);
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de comunicação com o servidor.");
    }
}

// --- 5. CADASTRO DE ALUNO COM ENVIO DE ARQUIVOS (FOTOS) ---
async function fazerCadastro(event) {
    event.preventDefault();

    const inputCpfCadastro = document.getElementById('cadastro-cpf');

    if (inputCpfCadastro && !validarCPF(inputCpfCadastro.value)) {
        alert('O CPF introduzido não é válido. Verifique os números.');
        inputCpfCadastro.focus();
        return;
    }

    const formData = new FormData();
    formData.append("nome", document.getElementById("cad-nome").value);
    formData.append("cpf", inputCpfCadastro.value);
    formData.append("email", document.getElementById("cad-email").value);
    formData.append("instituicao", document.getElementById("cad-escola").value);
    formData.append("endereco", document.getElementById("cad-endereco").value);
    formData.append("senha", document.getElementById("cadastro-senha").value);

    // Pegando as fotos anexadas
    formData.append("doc_frente", document.getElementById("cad-doc-frente").files[0]);
    formData.append("doc_verso", document.getElementById("cad-doc-verso").files[0]);
    formData.append("comprovante", document.getElementById("cad-comprovante").files[0]);

    try {
        const response = await fetch("http://127.0.0.1:8000/solicitar-cadastro", {
            method: "POST",
            body: formData
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensagem);
            document.getElementById('form-cadastro-aluno').reset();
            toggleCadastro(false);
        } else {
            alert(`Erro: ${resultado.detail}`);
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao enviar os documentos para o servidor.");
    }
}

// --- 6. MÁSCARA E VALIDAÇÃO DE CPF ---
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
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto == 10 || resto == 11) resto = 0;
    if (resto != parseInt(cpf.charAt(10))) return false;
    return true;
}