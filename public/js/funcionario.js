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
    } else if(formaPagamentoSelecionada == "transferencia bancaria"){
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
    } else if(formaPagamento == "transferencia bancaria"){
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
            carregarFuncionarios(); // Recarrega a lista de funcionários
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


/*Paginação/Busca/Filtro */

const ITENS_POR_PAGINA = 9;

//Estado em mémoria
let funcionarios = [];
let pagAtual = 1;
let filtroStatus = "todos";
let termosBusca = "";

const selectFiltro = document.getElementById("filtroStatus");
const formBusca = document.getElementById("formBusca");
const inputBusca = document.getElementById("buscaFuncionario");

//Filtro de status
selectFiltro.addEventListener("change", (e) => {
    e.preventDefault();
    
    const valor = e.target.value;

    if(valor == 1) {
        filtroStatus = "ativo";
    } else if (valor == 2) {
        filtroStatus = "inativo";
    } else {
        filtroStatus = "todos";
    }

    pagAtual = 1;
    aplicarFiltroPaginar();
});

//Busca
formBusca.addEventListener("submit", (e) => {
    e.preventDefault();
    termoBusca = inputBusca.value.trim().toLowerCase();
    pagAtual = 1;
    aplicarFiltroPaginar();
});


async function carregarFuncionarios(){
    const alertaVazio = document.getElementById("alertaVazioFuncionarios");
    alertaVazio.classList.add("d-none");

    try {
        const token = localStorage.getItem("authToken");

        const {data} = await axios.get("/admin/funcionarios", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }

                );
        
        if(data.deuCerto){
            if(data.vazio) {
                alertaVazio.classList.remove("d-none");
            }

            funcionarios = data.funcionarios; //recupera o array retornado pela api

            console.log(funcionarios);
            pagAtual = 1;
            aplicarFiltroPaginar();
        }

    } catch (erro) {
        console.error("Erro ao carregar funcionários:", erro);
    }

}


//Aplica filtros, busca, paginação e renderiza 
function aplicarFiltroPaginar() {
    let lista = funcionarios.slice(); //fazendo uma cópia do array funcionarios

    //Filtro por status
    if (filtroStatus === "ativo" || filtroStatus === "inativo") {
        lista = lista.filter((f) => f.status === filtroStatus); //aplicando o filtro caso necessário
    }

    //Buscar por nome completo

    if(termosBusca) { //Se há algum termo de busca, utilizamos para filtrar
        lista = lista.filter((f) => {
            const nomeCompleto = `${f.nome ?? ""} ${f.sobrenome ?? ""}`.toLowerCase().trim(); //montando a string de nome completo do funcionário 

            return nomeCompleto.includes(termoBusca); //retorna true se o funcionário o nome completo do funcionário bate com o termo de busca
            //Se retornar true, o funcionário fica na lista, caso contrário ele é removido (função filter)
        });
    }

    //Paginação
    const totalPag = Math.max(1, Math.ceil(lista.length / ITENS_POR_PAGINA));
    if(pagAtual>totalPag) pagAtual = totalPag; //controle

    const inicio = (pagAtual - 1) * ITENS_POR_PAGINA; 
    const pagina = lista.slice(inicio, inicio + ITENS_POR_PAGINA);

    renderizarFuncionarios(pagina);
    renderizarPaginacao(totalPag);
}

// Monta os cards na tela
function renderizarFuncionarios(lista) {
    const container = document.getElementById("lista-funcionarios");

    const htmlCards = lista.map((f) => {
        const nomeCompleto = `${f.nome ?? ""} ${f.sobrenome ?? ""}`.trim();
        let statusLabel = f.status || "-";
        if (statusLabel === "ativo") statusLabel = "Ativo";
        if (statusLabel === "inativo") statusLabel = "Inativo";

        return `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body shadow-lg">
                    <h5 class="card-title">${nomeCompleto || "Funcionário"}</h5>
                    <p><strong>Status:</strong> ${statusLabel}</p>
                    <button 
                        class="btn btn_azul btn-detalhes-funcionario" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalDetalhesFuncionarios"
                        data-id="${f.idFuncionario}">
                        Ver Detalhes
                    </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = htmlCards;

    /*Adicionando o evento de ouvir qualquer click para capturar o evento de click no botão ver detalhes */
    document.addEventListener("click", (e) => { //deve ser feito dessa maneira porque os botões são criados dinamicamente, então adicionar o listen antes deles existirem não funciona
        if (e.target.classList.contains("btn-detalhes-funcionario")) { //verificando se é o evento de interesse
            const id = Number(e.target.dataset.id);
            const funcionario = funcionarios.find((f) => f.idFuncionario === id);
            if (!funcionario) return;

            console.log("Abrindo detalhes de:", funcionario);
            // preencher o modal
        }
    });
}

// Monta a paginação (<< 1 2 3 >>)
function renderizarPaginacao(totalPag) {
    const ul = document.getElementById("paginacao-funcionarios");
    if (!ul) return;

    if (totalPag <= 1) {
        ul.innerHTML = "";
        return;
    }

    let html = "";

    const desabilitaAnterior = pagAtual === 1 ? "disabled" : "";
    html += `
        <li class="page-item ${desabilitaAnterior}">
        <button class="page-link" data-page="${pagAtual - 1}">&laquo;</button>
        </li>
    `;

    for (let i = 1; i <= totalPag; i++) {
        const ativo = i === pagAtual ? "active" : "";
        html += `
        <li class="page-item ${ativo}">
            <button class="page-link" data-page="${i}">${i}</button>
        </li>
        `;
    }

    const desabilitaProximo = pagAtual === totalPag ? "disabled" : "";
    html += `
        <li class="page-item ${desabilitaProximo}">
        <button class="page-link" data-page="${pagAtual + 1}">&raquo;</button>
        </li>
    `;

    ul.innerHTML = html;

    // Eventos de clique nos botões de página
    ul.querySelectorAll("button.page-link").forEach((btn) => {
        btn.addEventListener("click", (e) => {
        const page = Number(e.target.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= totalPag && page !== pagAtual) {
            pagAtual = page;
            aplicarFiltroPaginar();
        }
        });
    });
}



carregarFuncionarios();