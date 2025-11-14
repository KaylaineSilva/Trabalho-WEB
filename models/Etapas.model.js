import {Model, DataTypes} from 'sequelize';
import sequelize from './dbconfig.js';
import Obras from './Obras.model.js';

class Etapas extends Model {}

Etapas.init(
    {
        idEtapa: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        idObra: { 
            type: DataTypes.INTEGER,
            references: {
                model: 'Obras',
                key: 'idObra',
            },
            allowNull: false,
            primaryKey: true,
        },
        nome: {type: DataTypes.STRING, allowNull: false},
        valor: {type: DataTypes.FLOAT, allowNull: false},
        descricao: {type: DataTypes.STRING, allowNull: true},
        prazo: {type: DataTypes.DATE, allowNull: false},
        status: {
            type: DataTypes.ENUM("não iniciada", "em andamento", "concluída"),
        }
    }, 
    {
        sequelize,
        tableName: 'Etapas',
        timestamps: false,
    }
);

// Relação de Etapas com Obras
// Uma etapa pertence a uma obra e uma obra pode ter várias etapas
Obras.hasMany(Etapas, { foreignKey: "idObra" });
Etapas.belongsTo(Obras, { foreignKey: "idObra" });

export default Etapas;