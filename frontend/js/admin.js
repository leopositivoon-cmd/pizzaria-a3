/* =========================
   URL BACKEND
========================== */
const API_URL = "http://localhost:8080/pedidos";
const AUTH_URL = "http://localhost:8080/auth/login";

/* =========================
   ELEMENTOS
========================== */
const listaPedidos = document.getElementById('listaPedidos');
const totalPedidos = document.getElementById('totalPedidos');
const faturamentoTotal = document.getElementById('faturamentoTotal');
const pedidosPreparo = document.getElementById('pedidosPreparo');

/* =========================
   LOGIN
========================== */
function realizarLogin() {
    window.location.href = 'login.html';
}

function getToken() {
    return localStorage.getItem('token');
}

/* =========================
   CARREGAR PEDIDOS
========================== */
async function carregarPedidos() {
    const token = getToken();
    if (!token) {
        realizarLogin();
        return;
    }

    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403 || response.status === 401) {
            alert("Sessão expirada ou não autorizada.");
            localStorage.removeItem('token');
            realizarLogin();
            return;
        }

        const pedidos = await response.json();
        renderizarPedidos(pedidos);
    } catch (error) {
        console.log(error);
        listaPedidos.innerHTML = `
            <tr>
                <td colspan="5" class="sem-pedidos">Erro ao carregar pedidos</td>
            </tr>
        `;
    }
}

/* =========================
   RENDERIZAR
========================== */
function renderizarPedidos(pedidos) {
    listaPedidos.innerHTML = '';

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = `
            <tr>
                <td colspan="5" class="sem-pedidos">Não há pedidos ainda</td>
            </tr>
        `;
        totalPedidos.innerHTML = '0';
        faturamentoTotal.innerHTML = 'R$ 0,00';
        pedidosPreparo.innerHTML = '0';
        return;
    }

    let total = 0;
    let preparo = 0;

    pedidos.forEach(pedido => {
        total += pedido.total;
        if (pedido.status === 'EM_PREPARO') preparo++;

        listaPedidos.innerHTML += `
            <tr>
                <td>#${pedido.id}</td>
                <td>${pedido.clienteNome}</td>
                <td>
                    <span class="status ${pedido.status.toLowerCase()}">
                        ${pedido.status}
                    </span>
                </td>
                <td>R$ ${pedido.total.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn-status" onclick="alterarStatus(${pedido.id})" title="Próximo Status">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn-excluir" onclick="excluirPedido(${pedido.id})" title="Excluir Pedido">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    totalPedidos.innerHTML = pedidos.length;
    faturamentoTotal.innerHTML = `R$ ${total.toFixed(2).replace('.', ',')}`;
    pedidosPreparo.innerHTML = preparo;
}

/* =========================
   ALTERAR STATUS
========================== */
async function alterarStatus(id) {
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            carregarPedidos();
        } else {
            alert('Erro ao atualizar status do pedido.');
        }
    } catch (error) {
        console.log(error);
        alert('Erro ao atualizar status do pedido.');
    }
}

/* =========================
   EXCLUIR PEDIDO
========================== */
async function excluirPedido(id) {
    if (!confirm('Deseja realmente excluir este pedido?')) return;
    
    const token = getToken();
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            carregarPedidos();
        } else {
            alert('Erro ao excluir pedido.');
        }
    } catch (error) {
        console.log(error);
        alert('Erro ao excluir pedido.');
    }
}

/* =========================
   INICIAR
========================== */
carregarPedidos();
