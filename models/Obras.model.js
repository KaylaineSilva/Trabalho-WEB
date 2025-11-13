import {Model, DataTypes} from 'sequelize';
import sequelize from '../models/dbconfig.js';
import Usuario from './Usuario.model.js';

class Obras extends Model {}

Obras.init(
    {
        idObra: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nome: {type: DataTypes.STRING, allowNull: false},
        local: {type: DataTypes.STRING, allowNull: false},
        qtdEtapas: {type: DataTypes.INTEGER, allowNull: false},
        valorTotal: {type: DataTypes.FLOAT, allowNull: false},
        idUsuario: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Usuario',
                key: 'idUsuario',
            },
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("não iniciada", "em andamento", "concluída"),
        }
    },
    {
        sequelize,
        modelName: 'Obras',
        tableName: 'Obras',
        timestamps: false,
    }
);

//Relcação de Obras com Usuario
// Uma obra pertence a um usuário e um usuário pode ter várias obras
Usuario.hasMany(Obras, { foreignKey: "idUsuario" });
Obras.belongsTo(Usuario, { foreignKey: "idUsuario" });

export default Obras;
        