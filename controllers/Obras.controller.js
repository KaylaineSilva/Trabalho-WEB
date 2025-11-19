import sequelize from "../models/dbconfig.js";
import Obras from "../models/Obras.model.js";
import Clientes from "../models/Clientes.model.js";
import Etapas from "../models/Etapas.model.js";
import Trabalha from "../models/Trabalha.model.js";
import Tem from "../models/Tem.model.js";
import Funcionarios from "../models/Funcionarios.model.js";

// =================== LISTAR TODAS AS OBRAS ===================
export async function getAllObras(req, res) {
    try {
        const obras = await Obras.findAll({
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] }, // tabela Tem
                },
            ],
            order: [["nome", "ASC"]],
        });

        return res.json({ deuCerto: true, obras });
    } catch (error) {
        console.error("Erro ao listar obras:", error);
        return res.json({ deuCerto: false });
    }
}

// =================== FILTRAR OBRAS POR STATUS ===================
export async function getObrasPorStatus(req, res) {
    try {
        const { status } = req.params;

        const obras = await Obras.findAll({
            where: { status },
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] },
                },
            ],
            order: [["nome", "ASC"]],
        });

        return res.json({ deuCerto: true, obras });
    } catch (error) {
        console.error("Erro ao filtrar obras:", error);
        return res.json({ deuCerto: false });
    }
}

// =================== DETALHES DE UMA OBRA ===================
export async function getObraPorId(req, res) {
    try {
        const { id } = req.params;

        const obra = await Obras.findOne({
            where: { idObra: id },
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] },
                },
                {
                    model: Etapas, // lista de etapas da obra
                },
                {
                    model: Funcionarios,
                    through: {
                        model: Trabalha,
                        attributes: ["salarioDia", "cargo"],
                    },
                },
            ],
        });

        if (!obra) return res.json({ deuCerto: false });

        return res.json({ deuCerto: true, obra });
    } catch (erro) {
        console.error("Erro ao buscar obra:", erro);
        return res.json({ deuCerto: false });
    }
}

// =================== CRIAR OBRA COMPLETA ===================

export async function createObra(req, res) {
    const t = await sequelize.transaction();

    try {
        // 🔎 DEBUG opcional: pra você ver o que vem no token
        console.log("[debug] req.user em createObra:", req.user);

        let idUsuario = null;

        // tenta pegar direto do token (caso você já ajuste o jwt.sign)
        if (req.user) {
            if (req.user.idUsuario) idUsuario = req.user.idUsuario;
            else if (req.user.id) idUsuario = req.user.id;
            else if (req.user.sub) idUsuario = req.user.sub;
        }

        // fallback: se no token só tiver o nome, tenta achar no BD
        if (!idUsuario && req.user?.nome) {
            const usuario = await Usuario.findOne({
                where: { nome: req.user.nome },
                transaction: t,
            });
            if (usuario) {
                idUsuario = usuario.idUsuario;
            }
        }

        if (!idUsuario) {
            // se cair aqui, idUsuario ainda está null → não dá pra criar obra
            await t.rollback();
            return res.json({
                deuCerto: false,
                message: "Não foi possível identificar o usuário autenticado (idUsuario).",
            });
        }

        const {
            nome,
            local,
            cliente,
            etapas = [],
            funcionarios = [],
        } = req.body;

        if (!nome || !local) {
            await t.rollback();
            return res.json({
                deuCerto: false,
                message: "Nome e local da obra são obrigatórios.",
            });
        }

        if (!cliente || !cliente.nome) {
            await t.rollback();
            return res.json({
                deuCerto: false,
                message: "Nome do cliente é obrigatório.",
            });
        }

        const qtdEtapas = Array.isArray(etapas) ? etapas.length : 0;
        const valorTotal = Array.isArray(etapas)
            ? etapas.reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0)
            : 0;

        const novaObra = await Obras.create(
            {
                nome,
                local,
                qtdEtapas,
                valorTotal,
                status: "não iniciada",
                idUsuario, // ✅ AGORA NÃO É MAIS NULL
            },
            { transaction: t }
        );

        // cliente
        const clienteCriado = await Clientes.create(
            {
                nome: cliente.nome,
                contato: cliente.contato || "",
            },
            { transaction: t }
        );

        await Tem.create(
            {
                idClientes: clienteCriado.idCliente,
                idObras: novaObra.idObra,
            },
            { transaction: t }
        );

        // etapas
        for (const etapa of etapas) {
            if (!etapa.nome) continue;
            await Etapas.create(
                {
                    idObra: novaObra.idObra,
                    nome: etapa.nome,
                    descricao: etapa.descricao || null,
                    prazo: etapa.prazo || null,
                    status: etapa.status || "não iniciada",
                    valor: parseFloat(etapa.valor) || 0,
                },
                { transaction: t }
            );
        }

        // funcionários
        for (const f of funcionarios) {
            if (!f.idFuncionario) continue;

            await Trabalha.create(
                {
                    idFuncionarios: f.idFuncionario,
                    idObras: novaObra.idObra,
                    salarioDia: parseFloat(f.salarioDia) || 0,
                    cargo: f.cargo,
                },
                { transaction: t }
            );
        }

        await t.commit();

        return res.json({
            deuCerto: true,
            obra: {
                idObra: novaObra.idObra,
                nome: novaObra.nome,
                local: novaObra.local,
                qtdEtapas,
                valorTotal,
            },
        });
    } catch (error) {
        console.error("Erro ao criar obra:", error);
        await t.rollback();
        return res.json({
            deuCerto: false,
            message: "Erro ao criar obra.",
        });
    }
}
