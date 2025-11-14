import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false, //retira os logs que aparecem toda vez que o servidor é reiniciado
  }, 
    
);

export default sequelize;