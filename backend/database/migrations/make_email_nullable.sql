-- Queries SQL para tornar o campo email nullable nas tabelas leads e clients
-- Execute estas queries diretamente no Supabase SQL Editor se preferir fazer manualmente

-- Tornar email nullable na tabela leads
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Tornar email nullable na tabela clients
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;
