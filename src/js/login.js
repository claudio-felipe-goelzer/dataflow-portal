// Função para processar o formulário de login
// Envia os dados para o backend usando fetch
// Em caso de sucesso redireciona para /dashboard
// Caso contrário exibe mensagem de erro

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = new URLSearchParams(new FormData(form));
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (res.ok) {
    window.location.href = '/dashboard';
  } else {
    const data = await res.json();
    document.getElementById('error').textContent = data.error || 'Erro ao efetuar login';
  }
});
