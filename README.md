
## Instalação

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Configure o arquivo `backend/.env` com as credenciais do PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nome_do_banco
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### Frontend

```bash
cd frontend
npm install
```

## Executando

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```
Backend: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend: `http://localhost:8080`

### Produção

**Build do Frontend:**
```bash
cd frontend
npm run build
```

O build será gerado na pasta `frontend/dist/`. Certifique-se de que:

1. O arquivo `.htaccess` está presente na pasta `dist/` (ele é copiado automaticamente da pasta `public/` durante o build)
2. O módulo `mod_rewrite` do Apache está habilitado
3. O servidor web está configurado para servir os arquivos da pasta `dist/`

**Importante:** O arquivo `.htaccess` é essencial para que o roteamento do React funcione corretamente ao recarregar páginas. Sem ele, você receberá erro 404 ao recarregar rotas como `/clientes` ou `/leads`.


