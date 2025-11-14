import { Model, DataTypes } from "sequelize";
import sequelize from "./dbconfig.js";

class Clientes extends Model {}

Clientes.init(
    {
        idCliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nome: { type: DataTypes.STRING, allowNull: false },
        contato: { type: DataTypes.STRING, allowNull: false },
    },
    {
        sequelize,
        tableName: "Clientes",
        timestamps: false,
    }
);

export default Clientes;