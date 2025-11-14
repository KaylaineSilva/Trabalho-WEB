/*Modelo que representa a relação de trabalho entre funcionários e obras */

import { Model, DataTypes } from "sequelize";
import sequelize from "./dbconfig.js";
import Funcionarios from "./Funcionarios.model.js";
import Obras from "./Obras.model.js";

class Trabalha extends Model {}

Trabalha.init(
    {
        idFuncionarios: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: Funcionarios,
                key: "idFuncionario",
            },
        },
        idObras: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: Obras,
                key: "idObra",
            },
        },
        salarioDia: {type: DataTypes.FLOAT, allowNull: false},
        cargo: {type: DataTypes.ENUM("ajudante", "pedreiro"), allowNull: false},
    },
    {
        sequelize,
        tableName: "Trabalha",
        timestamps: false,
    }
);

/*Relacionamento Many-to-Many entre Funcionarios e Obras através de Trabalha*/
Funcionarios.belongsToMany(Obras, { through: Trabalha, foreignKey: "idFuncionario", otherKey: "idObra" });
Obras.belongsToMany(Funcionarios, { through: Trabalha, foreignKey: "idObra", otherKey: "idFuncionario" });

export default Trabalha;