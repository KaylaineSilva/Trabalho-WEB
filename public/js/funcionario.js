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

/*document.getElementById("addFuncionario").addEventListener("click", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    const nome = document.getElementById("nomeFuncionario").value;
    const sobrenome = document.getElementById("sobrenomeFuncionario").value;
    const endereco = document.getElementById("enderecoFuncionario").value;
    const salarioDia = parseFloat(document.getElementById("salarioDiaFuncionario").value);
    const cargo = document.getElementById("cargoFuncionario").value; 
*/