document.addEventListener("DOMContentLoaded", () => {
    carregarObras();

    const filtro = document.getElementById("filtroObras");
    if (filtro) {
        filtro.addEventListener("change", () => {
            const valor = filtro.value;
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
            if (form) {
                form.reset();
            }

            // Se você tiver listas dinâmicas de etapas/funcionários, limpe aqui:
            const listaEtapas = document.getElementById("lista-etapas");
            if (listaEtapas) {
                listaEtapas.innerHTML = "";
                // se quiser começar sempre com uma etapa vazia:
                if (typeof adicionarEtapa === "function") {
                    adicionarEtapa();
                }
            }

            const tabelaFunc = document.querySelector("#tabela-funcionarios-obra tbody");
            if (tabelaFunc) {
                tabelaFunc.innerHTML = "";
            }

            const qtdEtapas = document.getElementById("qtdEtapasObra");
            if (qtdEtapas) qtdEtapas.value = "";

            const valorTotal = document.getElementById("valorTotalObra");
            if (valorTotal) valorTotal.value = "";
        });
    }
    inicializarCadastroObra();
});

// ========== LISTAR / FILTRAR OBRAS ==========
async function carregarObras() {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get("/admin/obras", {
            headers: { Authorization: `Bearer ${token}` },
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
            headers: { Authorization: `Bearer ${token}` },
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
    if (!container) return;

    container.className = "row row-cols-1 row-cols-md-3 g-4";

    if (!obras || obras.length === 0) {
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
                        <p><strong>Status:</strong> ${obra.status || "-"}</p>

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

// ========== DETALHES DA OBRA ==========
window.abrirDetalhesBack = async function (idObra) {
    const token = localStorage.getItem("authToken");

    try {
        const { data } = await axios.get(`/admin/obras/${idObra}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!data.deuCerto) return;

        const obra = data.obra;

        document.getElementById("detalheNomeObra").value = obra.nome;
        document.getElementById("detalheLocalObra").value = obra.local;
        document.getElementById("detalheStatusObra").value = obra.status || "-";
        document.getElementById("detalheQtdEtapas").value = obra.qtdEtapas;
        document.getElementById("detalheValorObra").value =
            "R$ " + (obra.valorTotal ?? 0).toFixed(2).replace(".", ",");

        const cliente = (obra.Clientes && obra.Clientes[0]) || {};
        document.getElementById("detalheClienteNome").value = cliente.nome || "-";
        document.getElementById("detalheClienteContato").value = cliente.contato || "-";
    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
};

// ========== CADASTRO DE OBRA (MODAL) ==========

function inicializarCadastroObra() {
    const btnAddEtapa = document.getElementById("btnAddEtapa");
    const btnSalvarObra = document.getElementById("btnSalvarObra");
    const btnAddFuncionarioObra = document.getElementById("btnAddFuncionarioObra");

    if (btnAddEtapa) {
        btnAddEtapa.addEventListener("click", adicionarEtapa);
        // começa com pelo menos 1 etapa
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

// ---------- Etapas ----------

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

    const btnRemover = wrapper.querySelector(".btn-remover-etapa");
    btnRemover.addEventListener("click", () => {
        wrapper.remove();
        recalcularResumoObra();
    });

    // recalcular quando valor mudar
    wrapper
        .querySelector(".etapa-valor")
        .addEventListener("input", recalcularResumoObra);

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

        if (nome) {
            qtd += 1;
        }
        total += isNaN(valor) ? 0 : valor;
    });

    if (qtdInput) qtdInput.value = qtd;
    if (valorInput)
        valorInput.value = "R$ " + total.toFixed(2).replace(".", ",");
}

// ---------- Funcionários na obra ----------

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
            select.innerHTML =
                '<option value="">Nenhum funcionário cadastrado</option>';
        }
    } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
        select.innerHTML =
            '<option value="">Erro ao carregar funcionários</option>';
    }
}

function adicionarFuncionarioNaTabela() {
    const select = document.getElementById("selectFuncionario");
    const salarioInput = document.getElementById("funcSalarioDia");
    const cargoSelect = document.getElementById("funcCargo");
    const tabelaBody = document.querySelector(
        "#tabela-funcionarios-obra tbody"
    );

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

    // limpa campos
    select.value = "";
    salarioInput.value = "";
    cargoSelect.value = "ajudante";
}

// ---------- Enviar tudo para o back ----------

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

    // monta etapas
    const etapas = [];
    let etapaIncompleta = false;

    document
        .querySelectorAll("#lista-etapas .etapa-item")
        .forEach((item) => {
            const nome = item.querySelector(".etapa-nome").value.trim();
            const descricao = item.querySelector(".etapa-descricao").value.trim();
            const prazo = item.querySelector(".etapa-prazo").value;
            const status = item.querySelector(".etapa-status").value;
            const valorStr = item.querySelector(".etapa-valor").value;
            const valor = parseFloat(valorStr);

            // 1) Se NÃO tiver nome:
            if (!nome) {
                // se não tem nome mas a pessoa começou a digitar algo em outro campo, é etapa “meio preenchida”
                if (descricao || prazo || status || valorStr) {
                    etapaIncompleta = true;
                }
                // em qualquer caso, etapa sem nome NÃO entra na lista
                return;
            }

            // 2) Tem nome → todos os outros campos passam a ser obrigatórios
            if (!descricao || !prazo || !status || valorStr === "" || isNaN(valor)) {
                etapaIncompleta = true;
                return;
            }

            // 3) Etapa válida (completa)
            etapas.push({
                nome,
                descricao,
                prazo,
                status,
                valor,
            });
        });

    // Se existe alguma etapa com nome mas faltando coisa:
    if (etapaIncompleta) {
        alert("Complete todas as informações das etapas que têm nome (descrição, prazo, status e valor).");
        return;
    }

    // Se nenhuma etapa válida foi montada:
    if (etapas.length === 0) {
        alert("Cadastre pelo menos uma etapa completa para a obra.");
        return;
    }


if (etapaIncompleta) {
    alert("Preencha todas as informações de cada etapa que tiver nome (descrição, prazo, status e valor).");
    return;
}

if (etapas.length === 0) {
    alert("Cadastre pelo menos uma etapa completa para a obra.");
    return;
}


    // monta funcionários na obra
    const funcionarios = [];
    document
        .querySelectorAll("#tabela-funcionarios-obra tbody tr")
        .forEach((tr) => {
            const idFuncionario = tr.dataset.idFuncionario;
            const salarioDia = parseFloat(
                tr.querySelector(".td-salario").textContent || "0"
            );
            const cargo = tr.querySelector(".td-cargo").textContent;

            if (!idFuncionario) return;

            funcionarios.push({
                idFuncionario,
                salarioDia,
                cargo,
            });
        });

    const payload = {
        nome,
        local,
        statusObra,
        cliente: {
            nome: clienteNome,
            contato: clienteContato,
        },
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
            // fecha modal
            const modalElement =
                document.getElementById("modalObra");
            if (modalElement) {
                const modalInstance =
                    bootstrap.Modal.getInstance(modalElement) ||
                    new bootstrap.Modal(modalElement);
                modalInstance.hide();
            }
            // recarrega lista de obras
            carregarObras();
        } else {
            alert(data.message || "Erro ao cadastrar obra.");
        }
    } catch (error) {
        console.error("Erro ao salvar obra:", error);
        alert("Erro ao cadastrar obra.");
    }
}
