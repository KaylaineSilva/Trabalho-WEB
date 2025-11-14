import {Model, DataTypes} from 'sequelize';
import sequelize from '../models/dbconfig.js';
import bcrypt from 'bcryptjs';

class Usuario extends Model {}

Usuario.init(
    {
        idUsuario: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        nome: {type: DataTypes.STRING, allowNull: false},
        chaveAcessoCriptografada: {type: DataTypes.STRING, allowNull: false},
    },
    {
        sequelize,
        tableName: 'Usuario',
        timestamps: false,
    }
);

export async function setSenha(senha) {
    const salt = await bcrypt.genSalt(10);
    this.senha_hash = await bcrypt.hash(senha, salt);
};

export default Usuario;