/* =========================
   API BACKEND
========================= */
const API_URL = "http://localhost:8080/pedidos";

/* =========================
   ELEMENTOS
========================= */
const listaPedidos = document.getElementById('listaPedidos');
const semPedidos = document.getElementById('semPedidos');
const buscarPedido = document.getElementById('buscarPedido');
let pedidos = [];

function getToken() {
    return localStorage.getItem('token');
}

/* =========================
   BUSCAR PEDIDOS
========================= */
async function carregarPedidos() {
    const token = getToken();
    if (!token) {
        alert("Você precisa estar logado para ver os pedidos.");
        window.location.href = "login.html";
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
            window.location.href = "login.html";
            return;
        }

        pedidos = await response.json();
        renderizarPedidos(pedidos);
    } catch (error) {
        console.log(error);
        listaPedidos.innerHTML = '';
        semPedidos.style.display = 'block';
    }
}

/* =========================
   RENDERIZAR
========================= */
function renderizarPedidos(lista) {
    listaPedidos.innerHTML = '';

    if (lista.length === 0) {
        semPedidos.style.display = 'block';
        return;
    }

    semPedidos.style.display = 'none';

    lista.forEach((pedido) => {
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
                    <div class="acoes">
                        <button class="btn-status" onclick="alterarStatus(${pedido.id})">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="btn-excluir" onclick="excluirPedido(${pedido.id})">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

/* =========================
   ALTERAR STATUS
========================= */
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
========================= */
async function excluirPedido(id) {
    const confirmar = confirm('Deseja excluir este pedido?');
    if (!confirmar) return;

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
   BUSCA
========================= */
buscarPedido.addEventListener('input', () => {
    const valor = buscarPedido.value.toLowerCase();
    const filtrados = pedidos.filter((pedido) => {
        return (
            pedido.clienteNome.toLowerCase().includes(valor) ||
            pedido.id.toString().includes(valor)
        );
    });
    renderizarPedidos(filtrados);
});

/* =========================
   INICIAR
========================= */
carregarPedidos();
