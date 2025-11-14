import express from 'express';
import cookieParser from 'cookie-parser';
import { syncDb } from './models/index.model.js';
import apiRoutes from './routes/api.routes.js';
import {protegerRotaAdmin} from './controllers/Usuario.controller.js';

const app = express();

app.use(cookieParser('acesso_admin_secret')); // Aumentar a segurança da autenticação


app.use(express.json());
app.use(apiRoutes);

app.use('/html', protegerRotaAdmin, express.static('public/html'));
app.use(express.static('public'));

const PORT = 3000;

const start = async () => {
    // Conectar e sincronizar o banco de dados
    await syncDb();

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

start();