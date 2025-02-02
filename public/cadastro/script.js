document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const storeName = document.getElementById('storeName').value;
    const password = document.getElementById('password').value;

    if (username && email && storeName && password) {
        try {
            const response = await fetch('http://localhost:3004/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, storeName, password }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Ocorreu um erro. Tente novamente!');
        }
    } else {
        alert('Por favor, preencha todos os campos!');
    }
});
