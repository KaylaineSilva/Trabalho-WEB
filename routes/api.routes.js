import express from 'express';

import { autenticarUsuario} from '../controllers/Usuario.controller.js';
import { verificarToken } from '../controllers/Usuario.controller.js';
import { logoutUser } from '../controllers/Usuario.controller.js';
import { addFuncionario, alterFuncionario, getAllFuncionarios } from '../controllers/Funcionario.controller.js';
import { 
    getAllObras, 
    getObrasPorStatus, 
    getObraPorId, 
    createObra,
    buscarObras
} from '../controllers/Obras.controller.js';


const router = express.Router();

router.post('/admin/login', autenticarUsuario);
router.post('/admin/logout', verificarToken, logoutUser);

router.post('/admin/funcionario/add', verificarToken, addFuncionario);
router.get('/admin/funcionarios', verificarToken, getAllFuncionarios);
router.post('/admin/funcionarios/alter', verificarToken, alterFuncionario);

router.post('/admin/obras/add', verificarToken, createObra);

router.get('/admin/obras', verificarToken, getAllObras);
router.get('/admin/obras/status/:status', verificarToken, getObrasPorStatus);
router.get('/admin/obras/buscar', verificarToken, buscarObras);
router.get('/admin/obras/:id', verificarToken, getObraPorId);



export default router;
