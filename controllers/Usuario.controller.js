import Usuario from "../models/Usuario.model.js";
import bcrypt from 'bcryptjs';
import { request } from "express";
import jwt from 'jsonwebtoken';

/*Cookie usado para proteger as rotas*/
const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
    path: '/',
};

export const autenticarUsuario = async (req, res) => {
    const {nome, senhaAcesso} = req.body;

    /*//LOGS de diagnóstico - Debug
        console.log('[LOGIN] HIT /admin/login CT=', req.headers['content-type']);
        console.log('[LOGIN] body=', req.body);

        console.log('[LOGIN] Procurando usuário:', nome);
        console.log('[LOGIN] Senha fornecida:', senhaAcesso);*/

    try {
        const usuario = await Usuario.findOne({where: {nome}});

        if (!usuario) {
            return res.json({deuCerto: false, message: 'Credenciais inválidas'});
        }

        const senhaValida = await bcrypt.compare(senhaAcesso, usuario.chaveAcessoCriptografada);
        
        if (!senhaValida) {
            return res.json({deuCerto: false, message: 'Credenciais inválidas'});
        }
        
        //console.log(usuario);
        
        res.cookie('admin_auth', String(usuario.idUsuario), cookieOptions);
        const token = getToken(usuario.idUsuario, usuario.nome);
        return res.json({deuCerto: true, token: token});
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        return res.json({deuCerto: false, message: 'Erro interno do servidor'});
    }
}

export function logoutUser(req, res) {
    res.clearCookie('admin_auth', { path: '/' });
    return res.json({ deuCerto: true });
}

// Redireciona para a página de login se não autenticado
export async function protegerRotaAdmin(req, res, next) {
  try {
    const uid = req.signedCookies?.admin_auth;

    //console.log(uid);
    
    if (!uid) {
      return res.redirect(302, `../index.html`); 
    }

    const user = await Usuario.findByPk(uid);
    if (!user) {
      res.clearCookie('admin_auth', { path: '/' });
      return res.redirect(302, `../index.html`);
    }

    req.user = { id: user.idUsuario, nome: user.nome };
    return next();

    //Se o cookie existe, o usuário está logado e pode acessar o recurso
    return next();
  } catch (e) {
    console.error('[GUARD][ERROR]', e?.message, e?.stack);
    return res.redirect(302, `../index.html`);
  }
}

const secret = process.env.AUTH_SECRET;
function getToken(id, nome) {
    const token = jwt.sign(
        {
            sub: id,
            name: nome,
        },
        secret,
        {expiresIn: '2d'}
    );
    return token;
}

export function verificarToken(req, res, next) {
    let token = req.headers.authorization;
    try {
        if(token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            return next();
        }

        //Redirecionar para login 
        return res.json({deuCerto: false});
    
    } catch (error) {
        console.error('Erro ao verificar token:', error);
    }
}