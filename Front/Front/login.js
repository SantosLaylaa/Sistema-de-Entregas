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

async function fazerLogin(event, tipoUsuario) {
    event.preventDefault();
    localStorage.setItem('tipoUsuarioLogado', tipoUsuario);
    window.location.href = 'index.html';
}

function loginGoogle() {
    localStorage.setItem('tipoUsuarioLogado', 'aluno');
    window.location.href = 'index.html';
}

function fazerCadastro(event) {
    event.preventDefault();
    alert('Cadastro recebido! Seus documentos foram enviados para análise. Aguarde a liberação do seu acesso.');
    toggleCadastro(false);
}