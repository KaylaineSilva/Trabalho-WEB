document.addEventListener("DOMContentLoaded", () => {
    carregarObras();

    const filtro = document.getElementById("filtroObras");
    if (filtro) {
        filtro.addEventListener("change", () => {
            const valor = filtro.value;
            paginaAtual = 1; // reset paginação
            if (valor === "todas") {
                carregarObras();
            } else {
                filtrarObras(valor);
            }
        });
    }

    const modalObraEl = document.getElementById("modalObra");
    if (modalObraEl) {
        modalObraEl.addEventListener("show.bs.modal", () => {
            const form = document.getElementById("formCadastroObra");
            if (form) form.reset();

            const listaEtapas = document.getElementById("lista-etapas");
            if (listaEtapas) {
                listaEtapas.innerHTML = "";
                if (typeof adicionarEtapa === "function") adicionarEtapa();
            }

            const tabelaFunc = document.querySelector("#tabela-funcionarios-obra tbody");
            if (tabelaFunc) tabelaFunc.innerHTML = "";

            const qtdEtapas = document.getElementById("qtdEtapasObra");
            if (qtdEtapas) qtdEtapas.value = "";

            const valorTotal = document.getElementById("valorTotalObra");
            if (valorTotal) valorTotal.value = "";
        });
    }

    inicializarCadastroObra();
});

// ======== CONTROLES DE PAGINAÇÃO  ========
let obrasPaginadas = [];
let paginaAtual = 1;
const itensPorPagina = 9;


// ================== LISTAR / FILTRAR ==================

async function carregarObras() {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get("/admin/obras", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (data.deuCerto) {
            paginaAtual = 1;
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
            headers: { Authorization: `Bearer ${token}` },
        });

        if (data.deuCerto) {
            paginaAtual = 1;
            renderizarObras(data.obras);
        }
    } catch (e) {
        console.warn("Erro ao filtrar obras:", e);
    }
}

// ================== BUSCA ==================

document.getElementById("formBuscaObras").addEventListener("submit", async (e) => {
    e.preventDefault();

    const termo = document.getElementById("inputBuscaObras").value.trim();
    const token = localStorage.getItem("authToken");

    if (!termo) {
        carregarObras();
        return;
    }

    try {
        const { data } = await axios.get(`/admin/obras/buscar?termo=${encodeURIComponent(termo)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (data.deuCerto) {
            paginaAtual = 1;
            renderizarObras(data.obras);
        }
    } catch (err) {
        console.warn("Erro ao buscar obras:", err);
    }
});

// ========================================================
//  PAGINAÇÃO 
// ========================================================

function paginar(lista) {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return lista.slice(inicio, fim);
}

function atualizarPaginacao() {
    const totalPaginas = Math.ceil(obrasPaginadas.length / itensPorPagina);
    const paginacao = document.getElementById("paginacao-obras");

    if (!paginacao) return;

    if (totalPaginas <= 1) {
        paginacao.innerHTML = "";
        return;
    }

    let html = `
        <div class="pagination-container">
            <ul class="pagination justify-content-center">
                <li class="page-item ${paginaAtual === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual - 1})">«</a>
                </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `
            <li class="page-item ${i === paginaAtual ? "active" : ""}">
                <a class="page-link" href="#" onclick="mudarPagina(${i})">${i}</a>
            </li>
        `;
    }

    html += `
                <li class="page-item ${paginaAtual === totalPaginas ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual + 1})">»</a>
                </li>
            </ul>
        </div>
    `;

    paginacao.innerHTML = html;
}


window.mudarPagina = function (nova) {
    const totalPaginas = Math.ceil(obrasPaginadas.length / itensPorPagina);

    if (nova < 1 || nova > totalPaginas) return;

    paginaAtual = nova;
    renderizarObras(obrasPaginadas);
};


// ========================================================
// RENDERIZAÇÃO 
// ========================================================

function renderizarObras(obras) {
    const container = document.getElementById("lista-obras");
    if (!container) return;

    obrasPaginadas = obras;
    const exibicao = paginar(obrasPaginadas);

    container.className = "row row-cols-1 row-cols-md-3 g-4";

    if (!exibicao || exibicao.length === 0) {
        container.innerHTML = `
            <p class="text-center mt-3 w-100">Nenhuma obra encontrada.</p>
        `;
        document.getElementById("paginacao-obras").innerHTML = "";
        return;
    }

    container.innerHTML = exibicao
        .map(
            (obra) => `
            <div class="col d-flex">
                <div class="card h-100 flex-fill shadow-lg">
                    <div class="card-body">
                        <h5 class="card-title">${obra.nome}</h5>
                        <p><strong>Local:</strong> ${obra.local}</p>
                        <p><strong>Status:</strong> ${obra.status || "-"}</p>

                        <button class="btn btn_azul"
                            onclick="abrirDetalhesBack(${obra.idObra})"
                            data-bs-toggle="modal"
                            data-bs-target="#modalDetalhesObra">
                            Ver Detalhes
                        </button>
                    </div>
                </div>
            </div>`
        )
        .join("");

    atualizarPaginacao();
}

// ========================================================
//DETALHES DA OBRA 
// ========================================================

function formatarPrazo(prazo) {
    if (!prazo) return "-";
    if (prazo.includes("T")) {
        prazo.split("T")[0];
        const d = new Date(prazo);
        return d.toLocaleDateString("pt-BR");
    }
    return prazo;
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
        document.getElementById("detalheStatusObra").value = obra.status || "-";
        document.getElementById("detalheQtdEtapas").value = obra.qtdEtapas ?? (obra.Etapas?.length || 0);
        document.getElementById("detalheValorObra").value = "R$ " + Number(obra.valorTotal ?? 0).toFixed(2).replace(".", ",");

        const cliente = obra.Clientes?.[0] || {};
        document.getElementById("detalheClienteNome").value = cliente.nome || "-";
        document.getElementById("detalheClienteContato").value = cliente.contato || "-";

        const corpoEtapas = document.querySelector("#tabelaDetalhesEtapas tbody");
        corpoEtapas.innerHTML = "";

        const etapas = obra.Etapas || [];

        if (etapas.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="5" class="text-center">Nenhuma etapa cadastrada.</td>`;
            corpoEtapas.appendChild(tr);
        } else {
            etapas.forEach((etapa) => {
                const tr = document.createElement("tr");
                const valor = Number(etapa.valor ?? 0);
                const prazoFmt = formatarPrazo(etapa.prazo);

                tr.innerHTML = `
                    <td>${etapa.nome}</td>
                    <td>${etapa.descricao || "-"}</td>
                    <td>${prazoFmt || "-"}</td>
                    <td>${etapa.status || "-"}</td>
                    <td>R$ ${valor.toFixed(2).replace(".", ",")}</td>
                `;
                corpoEtapas.appendChild(tr);
            });
        }

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
};

// ========================================================
// CADASTRO DE OBRAS 
// ========================================================

function inicializarCadastroObra() {
    const btnAddEtapa = document.getElementById("btnAddEtapa");
    const btnSalvarObra = document.getElementById("btnSalvarObra");
    const btnAddFuncionarioObra = document.getElementById("btnAddFuncionarioObra");

    if (btnAddEtapa) {
        btnAddEtapa.addEventListener("click", adicionarEtapa);
        adicionarEtapa();
    }

    if (btnAddFuncionarioObra) {
        btnAddFuncionarioObra.addEventListener("click", adicionarFuncionarioNaTabela);
    }

    if (btnSalvarObra) {
        btnSalvarObra.addEventListener("click", salvarObra);
    }

    carregarFuncionariosParaSelect();
}

// --- Etapas ---

function adicionarEtapa() {
    const container = document.getElementById("lista-etapas");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = "card card-body mb-2 etapa-item";

    wrapper.innerHTML = `
        <div class="row g-2">
            <div class="col-md-4">
                <label class="form-label">Nome da etapa</label>
                <input type="text" class="form-control etapa-nome" required>
            </div>
            <div class="col-md-4">
                <label class="form-label">Prazo</label>
                <input type="date" class="form-control etapa-prazo" required>
            </div>
            <div class="col-md-4">
                <label class="form-label">Valor (R$)</label>
                <input type="number" class="form-control etapa-valor" min="0" step="0.01" required>
            </div>
            <div class="col-md-8">
                <label class="form-label">Descrição</label>
                <input type="text" class="form-control etapa-descricao">
            </div>
            <div class="col-md-3">
                <label class="form-label">Status</label>
                <select class="form-select etapa-status">
                    <option value="não iniciada">Não iniciada</option>
                    <option value="em andamento">Em andamento</option>
                    <option value="concluída">Concluída</option>
                </select>
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-outline-danger btn-sm btn-remover-etapa">X</button>
            </div>
        </div>
    `;

    container.appendChild(wrapper);

    wrapper.querySelector(".btn-remover-etapa").addEventListener("click", () => {
        wrapper.remove();
        recalcularResumoObra();
    });

    wrapper.querySelector(".etapa-valor").addEventListener("input", recalcularResumoObra);

    recalcularResumoObra();
}

function recalcularResumoObra() {
    const itens = document.querySelectorAll("#lista-etapas .etapa-item");
    const qtdInput = document.getElementById("qtdEtapasObra");
    const valorInput = document.getElementById("valorTotalObra");

    let qtd = 0;
    let total = 0;

    itens.forEach((item) => {
        const nome = item.querySelector(".etapa-nome").value.trim();
        const valor = parseFloat(item.querySelector(".etapa-valor").value || "0");

        if (nome) qtd++;
        total += isNaN(valor) ? 0 : valor;
    });

    if (qtdInput) qtdInput.value = qtd;
    if (valorInput) valorInput.value = "R$ " + total.toFixed(2).replace(".", ",");
}

// --- Funcionários ---

async function carregarFuncionariosParaSelect() {
    const select = document.getElementById("selectFuncionario");
    if (!select) return;

    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get("/admin/funcionarios", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (data.deuCerto && !data.vazio) {
            select.innerHTML =
                '<option value="">Selecione um funcionário...</option>' +
                data.funcionarios
                    .map(
                        (f) =>
                            `<option value="${f.idFuncionario}">${f.nome} ${f.sobrenome}</option>`
                    )
                    .join("");
        } else {
            select.innerHTML = '<option value="">Nenhum funcionário cadastrado</option>';
        }
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        select.innerHTML = '<option value="">Erro ao carregar funcionários</option>';
    }
}

function adicionarFuncionarioNaTabela() {
    const select = document.getElementById("selectFuncionario");
    const salarioInput = document.getElementById("funcSalarioDia");
    const cargoSelect = document.getElementById("funcCargo");
    const tabelaBody = document.querySelector("#tabela-funcionarios-obra tbody");

    if (!select || !salarioInput || !cargoSelect || !tabelaBody) return;

    const idFuncionario = select.value;
    const nomeFuncionario = select.options[select.selectedIndex]?.text || "";
    const salarioDia = parseFloat(salarioInput.value || "0");
    const cargo = cargoSelect.value;

    if (!idFuncionario) {
        alert("Selecione um funcionário.");
        return;
    }
    if (!salarioDia || salarioDia <= 0) {
        alert("Informe o salário por dia na obra.");
        return;
    }

    const tr = document.createElement("tr");
    tr.dataset.idFuncionario = idFuncionario;
    tr.innerHTML = `
        <td>${nomeFuncionario}</td>
        <td class="td-salario">${salarioDia.toFixed(2)}</td>
        <td class="td-cargo">${cargo}</td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger btn-remover-func-obra">
                Remover
            </button>
        </td>
    `;

    tabelaBody.appendChild(tr);

    tr.querySelector(".btn-remover-func-obra").addEventListener("click", () => {
        tr.remove();
    });

    select.value = "";
    salarioInput.value = "";
    cargoSelect.value = "ajudante";
}

// --- Salvar Obra ---

async function salvarObra() {
    const form = document.getElementById("formCadastroObra");
    if (!form) return;

    const token = localStorage.getItem("authToken");

    const nome = form.nome.value.trim();
    const local = form.local.value.trim();
    const statusObra = form.statusObra.value;
    const clienteNome = form.cliente_nome.value.trim();
    const clienteContato = form.cliente_contato.value.trim();

    if (!nome || !local) {
        alert("Preencha nome e local da obra.");
        return;
    }
    if (!clienteNome) {
        alert("Informe o nome do cliente.");
        return;
    }

    const etapas = [];
    let etapaIncompleta = false;

    document.querySelectorAll("#lista-etapas .etapa-item").forEach((item) => {
        const nome = item.querySelector(".etapa-nome").value.trim();
        const descricao = item.querySelector(".etapa-descricao").value.trim();
        const prazo = item.querySelector(".etapa-prazo").value;
        const status = item.querySelector(".etapa-status").value;
        const valorStr = item.querySelector(".etapa-valor").value;
        const valor = parseFloat(valorStr);

        if (!nome) {
            if (descricao || prazo || status || valorStr) etapaIncompleta = true;
            return;
        }

        if (!descricao || !prazo || !status || valorStr === "" || isNaN(valor)) {
            etapaIncompleta = true;
            return;
        }

        etapas.push({ nome, descricao, prazo, status, valor });
    });

    if (etapaIncompleta) {
        alert("Complete todas as informações das etapas que têm nome.");
        return;
    }

    if (etapas.length === 0) {
        alert("Cadastre pelo menos uma etapa completa.");
        return;
    }

    const funcionarios = [];
    document.querySelectorAll("#tabela-funcionarios-obra tbody tr").forEach((tr) => {
        const idFuncionario = tr.dataset.idFuncionario;
        const salarioDia = parseFloat(tr.querySelector(".td-salario").textContent || "0");
        const cargo = tr.querySelector(".td-cargo").textContent;

        if (idFuncionario) {
            funcionarios.push({ idFuncionario, salarioDia, cargo });
        }
    });

    const payload = {
        nome,
        local,
        statusObra,
        cliente: { nome: clienteNome, contato: clienteContato },
        etapas,
        funcionarios,
    };

    try {
        const { data } = await axios.post("/admin/obras/add", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (data.deuCerto) {
            alert("Obra cadastrada com sucesso!");

            const modalElement = document.getElementById("modalObra");
            const modalInstance =
                bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();

            carregarObras();
        } else {
            alert(data.message || "Erro ao cadastrar obra.");
        }
    } catch (error) {
        console.error("Erro ao salvar obra:", error);
        alert("Erro ao cadastrar obra.");
    }
}
