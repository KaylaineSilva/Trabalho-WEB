import Obras from "../models/Obras.model.js";
import Clientes from "../models/Clientes.model.js";

export async function getAllObras(req, res) {
    try {
        const obras = await Obras.findAll({
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] }
                }
            ],
            order: [['nome', 'ASC']]
        });

        return res.json({ deuCerto: true, obras });
    } catch (error) {
        console.error("Erro ao listar obras:", error);
        return res.json({ deuCerto: false });
    }
}

export async function getObrasPorStatus(req, res) {
    try {
        const { status } = req.params;

        const obras = await Obras.findAll({
            where: { status },
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] }
                }
            ],
            order: [['nome', 'ASC']]
        });

        return res.json({ deuCerto: true, obras });
    } catch (error) {
        console.error("Erro ao filtrar obras:", error);
        return res.json({ deuCerto: false });
    }
}

export async function getObraPorId(req, res) {
    try {
        const { id } = req.params;

        const obra = await Obras.findOne({
            where: { idObra: id },
            include: [
                {
                    model: Clientes,
                    through: { attributes: [] }
                }
            ]
        });

        if (!obra) return res.json({ deuCerto: false });

        return res.json({ deuCerto: true, obra });

    } catch (erro) {
        console.error("Erro ao buscar obra:", erro);
        return res.json({ deuCerto: false });
    }
}
