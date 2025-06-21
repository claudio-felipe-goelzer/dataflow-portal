// Faz o carregamento dos dashboards disponíveis para o usuário logado
// e permite o embed do dashboard selecionado

async function loadDashboards() {
  const res = await fetch('/api/dashboards');
  if (!res.ok) {
    if (res.status === 401) window.location.href = '/';
    return;
  }
  const data = await res.json();
  const list = document.getElementById('dashboard-list');
  data.forEach((dash) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = dash.title;
    link.href = '#';
    link.onclick = () => embedDashboard(dash.url);
    li.appendChild(link);
    list.appendChild(li);
  });
}

function embedDashboard(url) {
  const div = document.getElementById('embed');
  div.innerHTML = `<iframe src="${url}" width="800" height="600" frameborder="0"></iframe>`;
}

loadDashboards();
