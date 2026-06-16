document.addEventListener("DOMContentLoaded", () => {
    // 1. Puxa os dados do armazenamento local
    const nome = localStorage.getItem('nomeUsuario') || "Usuário";
    const tipoAcesso = localStorage.getItem('tipoUsuario') || "Desconhecido";
    const idUsuario = localStorage.getItem('usuarioId') || "Google Auth";
    
    // 2. Cria a imagem com as iniciais do nome
    const linkAvatarGrande = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=fff&bold=true&size=128`;

    // 3. Preenche a tela
    document.getElementById('perfil-nome').textContent = nome;
    document.getElementById('perfil-tipo').textContent = `Acesso: ${tipoAcesso}`;
    document.getElementById('perfil-id').textContent = `ID do Sistema: ${idUsuario}`;
    document.getElementById('perfil-foto-grande').src = linkAvatarGrande;
});

// Reutiliza a função de logout
function fazerLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}