/*Mostrar campos de pagamento de acordo com a seleção*/

//Esconder inicialmente os campos de pix e conta
const divPix = document.getElementById("divPix");
const divConta = document.getElementById("divConta");

divPix.classList.add("d-none");
divConta.classList.add("d-none");

const seletorFormaPagamento = document.getElementById("formaPagamentoFuncionario");

seletorFormaPagamento.addEventListener("change", () => {
    const formaPagamentoSelecionada = seletorFormaPagamento.value;

    if(formaPagamentoSelecionada == "pix") {
        divConta.classList.add("d-none");
        divPix.classList.remove("d-none");
    } else if(formaPagamentoSelecionada == "transferencia"){
        divPix.classList.add("d-none");
        divConta.classList.remove("d-none");
    }

});

/*Inserir funcionário*/

document.getElementById("addFuncionario").addEventListener("click", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const alertaAdicionar = new bootstrap.Modal(document.getElementById("alertaModal"));
    const formAdicionarFuncionario = document.getElementById("formFuncionario");

    const nome = document.getElementById("nomeFuncionario").value;
    const sobrenome = document.getElementById("sobrenomeFuncionario").value;
    const endereco = document.getElementById("enderecoFuncionario").value;
    const salarioDia = parseFloat(document.getElementById("salarioDiaFuncionario").value);
    const cargo = document.getElementById("cargoFuncionario").value; 
    const status = document.getElementById("statusFuncionario").value;
    const formaPagamento = document.getElementById("formaPagamentoFuncionario").value;
    let campoPix, campoAgencia, campoConta;
    
    if(!nome || !sobrenome || !endereco || !salarioDia || !cargo || !status || !formaPagamento) {
        document.getElementById("mensagem_alerta").textContent = "Por favor, preencha todos os campos corretamente.";
        alertaAdicionar.show();
        return;
    }

    if (formaPagamento == "pix"){
        campoPix = document.getElementById("chavePix").value;
        campoAgencia = null;
        campoConta =  null;

        if(!campoPix) {
            document.getElementById("mensagem_alerta").textContent = "Por favor, preencha todos os campos corretamente.";
            alertaAdicionar.show();
            return;
        }
    } else if(formaPagamento == "transferencia"){
        campoPix = null;
        campoAgencia = document.getElementById("agencia").value;
        campoConta = document.getElementById("numeroConta").value;

        if(!campoAgencia || !campoConta) {
            document.getElementById("mensagem_alerta").textContent = "Por favor, preencha todos os campos corretamente.";
            alertaAdicionar.show();
            return;
        }
    }

    /*
    //Debug

    console.log(nome);
    console.log(sobrenome);
    console.log(endereco);
    console.log(salarioDia);
    console.log(cargo);
    console.log(status);
    console.log(formaPagamento);
    console.log(campoPix);
    console.log(campoAgencia);
    console.log(campoConta);*/

    try {
        const {data} = await axios.post('/admin/funcionario/add', 
                {
                    nome,
                    sobrenome,
                    endereco, 
                    salarioDia,
                    cargo,
                    status,
                    formaPagamento,
                    campoPix,
                    campoAgencia,
                    campoConta
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        
            
        if (data.deuCerto) {
            document.getElementById("mensagem_alerta").textContent = "Funcionário adicionado com sucesso!";
            document.getElementById('modalFuncionario').querySelector('.btn-close').click(); //fechando o modal de criação
            formAdicionarFuncionario.reset();
            alertaAdicionar.show();
            //carregarFuncionarios(); // Recarrega a lista de funcionários
        } else {
            document.getElementById("mensagem_alerta").textContent = "Falha ao adicionar funcionário. Tente novamente.";
            alertaAdicionar.show();
        }
    } catch (error) {
        console.error("Erro ao adicionar funcionário:", error);
        document.getElementById('modalFuncionario').querySelector('.btn-close').click(); //fechando o modal de criação
        formAdicionarFuncionario.reset();
        document.getElementById("mensagem_alerta").textContent = "Erro ao adicionar funcionário. Tente novamente.";
        alertaAdicionar.show();
    }
    
});