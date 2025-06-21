// Carrega a lista de clientes disponíveis apenas para o usuário administrador

async function loadClients() {
  const res = await fetch('/api/clients');
  if (!res.ok) {
    if (res.status === 401) window.location.href = '/';
    return;
  }
  const clients = await res.json();
  const list = document.getElementById('client-list');
  clients.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.name;
    list.appendChild(li);
  });
}

loadClients();
