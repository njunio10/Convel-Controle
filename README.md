
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


