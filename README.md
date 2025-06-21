# Dataflow Portal

Projeto exemplo de portal SaaS simples em Node.js sem dependências externas.
Permite login de usuários e exibição de dashboards (links Power BI).

## Estrutura

- `server.js` – Servidor HTTP que controla autenticação e entrega das páginas.
- `pages/` – Contém as páginas `login.html`, `dashboard.html` e `admin.html`.
- `src/` – Arquivos estáticos (CSS e JavaScript).
- `legacy/` – Páginas HTML antigas mantidas como referência.

Para iniciar execute:

```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`.
