import sequelize from './dbconfig.js';
import Usuario from './Usuario.model.js';
import Obras from './Obras.model.js';
import Funcionarios from './Funcionarios.model.js';
import Trabalha from './Trabalha.model.js';
import MarcarPresenca from './MarcarPresenca.model.js';
import Clientes from './Clientes.model.js';
import Tem from './Tem.model.js';
import Etapas from './Etapas.model.js';

export async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Sincroniza todos os modelos com o banco de dados
    await sequelize.sync({ alter: true });
    console.log('Todas as tabelas foram sincronizadas.');
  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}