import sequelize from './models/dbconfig.js';
import Usuario from './models/Usuario.model.js';
import Obras from './models/Obras.model.js';
import Funcionarios from './models/Funcionarios.model.js';
import Trabalha from './models/Trabalha.model.js';
import MarcarPresenca from './models/MarcarPresenca.model.js';
import Clientes from './models/Clientes.model.js';
import Tem from './models/Tem.model.js';
import Etapas from './models/Etapas.model.js';


async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Sincroniza todos os modelos com o banco de dados
    await sequelize.sync({ alter: true });
    console.log('Todas as tabelas foram sincronizadas.');
  } catch (error) {
    console.error('Erro ao conectar:', error);
  } finally {
    await sequelize.close();
  }
}

syncDb();