import {Model, DataTypes} from 'sequelize';
import sequelize from '../models/dbconfig.js';

class Usuario extends Model {}

Usuario.init(
    {
        idUsuario: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        chaveAcessoCriptografada: {type: DataTypes.STRING, allowNull: false},
    },
    {
        sequelize,
        modelName: 'Usuario',
        tableName: 'Usuario',
        timestamps: false,
    }
);

export default Usuario;