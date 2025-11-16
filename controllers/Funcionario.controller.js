import Funcionarios from "../models/Funcionarios.model.js";

export async function addFuncionario(request, response) {
    try {
        const {nome, sobrenome, endereco, salarioDia, cargo, status, formaPagamento, campoPix, campoAgencia, campoConta} = request.body;

        //console.log(request.body)

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
    const funcionarios = await Funcionarios.findAll({order: [['nome', 'ASC']]});

    if(funcionarios.length==0) response.json({deuCerto: true, vazio: true});

    response.json({deuCerto: true, funcionarios});
}

export async function alterFuncionario(request, response) {
    const {id, nome, sobrenome, endereco, salarioDia, cargo, status, formaPagamento, campoPix, campoAgencia, campoConta} = request.body;

    const funcionario = await Funcionarios.findByPk(id);

    /*
    console.log(request.body);
    console.log(id);*/

    try {
        if(funcionario) { //Funcionario encontrado
            
            // Atualiza os dados
            await Funcionarios.update(
                {
                    nome,
                    sobrenome,
                    endereco,
                    salarioDia: parseFloat(salarioDia),
                    cargo,
                    status,
                    formaPagamento,
                    campoPix,
                    campoAgencia,
                    campoConta,
                },
                {
                    where: { idFuncionario: id },
                });

            response.json({deuCerto: true});
    
        } else {
            response.json({deuCerto: false});
        }
    } catch(erro){
        console.error("Erro ao alterar funcionário: ", erro);
        response.json({deuCerto: false});
    }
    
    
}