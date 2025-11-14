/*Modelo que representa o relacionamento ternário entre Usuário, Funcionário e Obra para marcar a presença de um funcionário em uma obra */

import { Model, DataTypes } from "sequelize";
import sequelize from "./dbconfig.js";
import Usuario from "./Usuario.model.js";
import Funcionarios from "./Funcionarios.model.js";
import Obras from "./Obras.model.js";

class MarcarPresenca extends Model {}

MarcarPresenca.init(
  {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Usuario,
        key: "idUsuario",
      },
    },
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
    dataPresenca: {
      type: DataTypes.DATEONLY,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "MarcarPresenca",
    timestamps: false,
  }
);

export default MarcarPresenca;