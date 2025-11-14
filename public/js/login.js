const API = '/admin/login';

document.getElementById('formLogin').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const senhaAcesso = document.getElementById('senhaAcesso').value;

    const alertaDiv = document.getElementById('alertaDiv');
    const alerta = document.getElementById('alerta');

    alertaDiv.classList.add('d-none');
    alerta.textContent = '';

    if(!senhaAcesso.trim() || !nome.trim()) {
        alerta.textContent = 'Por favor, preencha todos os campos.';
        alertaDiv.classList.remove('d-none');
        return;
    }

    try {
        const {data} = await axios.post(API, {nome, senhaAcesso});

        if(data.deuCerto && data.token) {
            //Login bem-sucedido

            //Armazenando o token mandado pelo servidor
            localStorage.setItem("authToken", data.token);

            //Redirecionando usuário
            window.location.href = './html/home.html';
            console.log('Login bem-sucedido');
        } else {
            alerta.textContent = data.message || 'Falha na autenticação. Tente novamente.';
            alertaDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao tentar autenticar:', error);
        alerta.textContent = 'Erro ao conectar ao servidor. Tente novamente mais tarde.';
        alertaDiv.classList.remove('d-none');
    }
});