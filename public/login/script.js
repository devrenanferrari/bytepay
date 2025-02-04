document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = { email, password };

    // Enviar requisição POST para a API de login
    fetch('https://bytepay-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login realizado com sucesso!') {
            // Armazenar o token JWT no localStorage
            localStorage.setItem('authToken', data.token);

            // Redirecionar para o painel
            window.location.href = "../painel/dashboard.html";
        } else {
            alert(data.message || 'Ocorreu um erro no login.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao tentar fazer login. Tente novamente.');
    });
});
