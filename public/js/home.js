document.addEventListener("DOMContentLoaded", () => {
    carregarObras();

    const filtro = document.getElementById("filtroObras");
    filtro.addEventListener("change", () => {
        const valor = filtro.value;

        if (valor === "todas") {
            carregarObras();
        } else {
            filtrarObras(valor);
        }
    });
});

async function carregarObras() {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get("/admin/obras", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.deuCerto) {
            renderizarObras(data.obras);
        }

    } catch (e) {
        console.warn("Erro ao carregar obras:", e);
    }
}

async function filtrarObras(status) {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get(`/admin/obras/status/${status}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (data.deuCerto) {
            renderizarObras(data.obras);
        }

    } catch (e) {
        console.warn("Erro ao filtrar obras:", e);
    }
}

function renderizarObras(obras) {
    const container = document.getElementById("lista-obras");
    container.className = "row row-cols-1 row-cols-md-3 g-4";

    if (!obras.length) {
        container.innerHTML = `
            <p class="text-center mt-3 w-100">Nenhuma obra encontrada.</p>
        `;
        return;
    }

    container.innerHTML = obras
        .map(
            (obra) => `
            <div class="col d-flex">
                <div class="card h-100 flex-fill shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title">${obra.nome}</h5>
                        <p><strong>Local:</strong> ${obra.local}</p>
                        <p><strong>Status:</strong> ${obra.status}</p>

                        <button class="btn btn_azul"
                            onclick="abrirDetalhesBack(${obra.idObra})"
                            data-bs-toggle="modal"
                            data-bs-target="#modalDetalhesObra">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `
        )
        .join("");
}

window.abrirDetalhesBack = async function (idObra) {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get(`/admin/obras/${idObra}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.deuCerto) return;

        const obra = data.obra;

        document.getElementById("detalheNomeObra").value = obra.nome;
        document.getElementById("detalheLocalObra").value = obra.local;
        document.getElementById("detalheStatusObra").value = obra.status;
        document.getElementById("detalheQtdEtapas").value = obra.qtdEtapas;
        document.getElementById("detalheValorObra").value = "R$ " + obra.valorTotal;

        const cliente = obra.Clientes?.[0] || {};
        document.getElementById("detalheClienteNome").value = cliente.nome || "-";
        document.getElementById("detalheClienteContato").value = cliente.contato || "-";

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
};
