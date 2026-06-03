console.log("Status do LocalStorage:", localStorage.getItem('estaLogado'));
// auth.js - Versão Única e Robusta
window.addEventListener("DOMContentLoaded", () => {
    // Verificamos com um pequeno atraso para dar tempo ao navegador de processar o storage
    setTimeout(() => {
        const logado = localStorage.getItem('estaLogado');
        
        // Se a página for o login, não fazemos nada
        if (window.location.pathname.includes('login.html')) {
            return;
        }

        // Se NÃO estiver logado E não estivermos na tela de login, manda embora
        if (!logado) {
            console.log("Sessão não encontrada, redirecionando para login...");
            window.location.href = 'login.html';
        }
    }, 100); // 100ms é um tempo seguro e imperceptível
});