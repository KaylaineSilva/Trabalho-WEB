import Funcionarios from "../models/Funcionarios.model.js";

export async function addFuncionario(request, response) {
    try {
        const {nome, sobrenome, endereco, salarioDia, cargo, status, formaPagamento, campoPix, campoAgencia, campoConta} = request.body;

        const idUsuario = request.user.sub; //recuperando o id do usuário do user mandado pela função de verificação do Token

        const novoFuncionario = await Funcionarios.create({
            nome, 
            sobrenome,
            endereco,
            salarioDia: parseFloat(salarioDia),
            status,
            cargo,
            formaPagamento,
            campoPix,
            campoAgencia,
            campoConta,
            idUsuario: parseInt(idUsuario),
        });

        return response.json({deuCerto: true});
    } catch (error) {
        console.error("Erro ao adicionar funcionário:", error);
        return response.json({ deuCerto: false });
    }
} 

export async function getAllFuncionarios(request, response) {
    console.log("Entrando aqui");

    const funcionarios = await Funcionarios.findAll({order: [['nome', 'ASC']]});

    if(funcionarios.length==0) response.json({deuCerto: true, vazio: true});

    response.json({deuCerto: true, funcionarios});
}