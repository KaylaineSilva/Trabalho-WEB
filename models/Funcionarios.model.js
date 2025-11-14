import { Model, DataTypes } from "sequelize";
import sequelize from "./dbconfig.js";
import Usuario from "./Usuario.model.js";

class Funcionarios extends Model {}

Funcionarios.init(
    {
        idFuncionario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nome: { type: DataTypes.STRING, allowNull: false },
        sobrenome: { type: DataTypes.STRING, allowNull: false },
        endereco: { type: DataTypes.STRING, allowNull: false },
        salarioDia: { type: DataTypes.FLOAT, allowNull: false },
        status: {
            type: DataTypes.ENUM("ativo", "inativo"),
        },
        cargo: { 
            type: DataTypes.ENUM("ajudante", "pedreiro"),
            allowNull: false 
        },
        formaPagamento: {
            type: DataTypes.ENUM("dinheiro", "pix", "transferencia bancaria"),
            allowNull: false 
        },
        campoPix: { type: DataTypes.STRING, allowNull: true },
        agencia: { type: DataTypes.STRING, allowNull: true },
        conta: { type: DataTypes.STRING, allowNull: true },
        idUsuario: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Usuario',
                key: 'idUsuario',
            },
            allowNull: false,   
        },   
    },
    {
        sequelize,
        tableName: "Funcionarios",
        timestamps: false,
    }
);

// Relação de Funcionarios com Usuario
// Um funcionario pertence a um usuário e um usuário pode ter vários funcionarios
Usuario.hasMany(Funcionarios, { foreignKey: "idUsuario" });
Funcionarios.belongsTo(Usuario, { foreignKey: "idUsuario" });

export default Funcionarios;