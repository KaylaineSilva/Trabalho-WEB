import express from 'express';

import { autenticarUsuario} from '../controllers/Usuario.controller.js';
import { verificarToken } from '../controllers/Usuario.controller.js';
import { logoutUser } from '../controllers/Usuario.controller.js';
import {addFuncionario} from '../controllers/Funcionario.controller.js'

const router = express.Router();

router.post('/admin/login', autenticarUsuario);

router.post('/admin/logout', verificarToken, logoutUser);

router.post('/admin/funcionario/add', verificarToken, addFuncionario);

export default router;