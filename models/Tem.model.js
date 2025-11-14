/*Modelo que representa o relacionamento entre Cliente e */

import { Model, DataTypes } from "sequelize";
import sequelize from "./dbconfig.js";
import Clientes from "./Clientes.model.js";
import Obras from "./Obras.model.js";

class Tem extends Model {}

Tem.init(
  {
    idClientes: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Clientes,
        key: "idCliente",
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
  },
  {
    sequelize,
    tableName: "Tem",
    timestamps: false,
  }
);

// Relação Many-to-Many entre Clientes e Obras através de Tem
Clientes.belongsToMany(Obras, { through: Tem, foreignKey: "idClientes", otherKey: "idObras" });
Obras.belongsToMany(Clientes, { through: Tem, foreignKey: "idObras", otherKey: "idClientes" });

export default Tem;