# Euipe - Gestión de Equipos de Fútbol

Aplicación web para gestionar jugadores, partidos y generar equipos balanceados automáticamente.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + API REST automática)
- **Cliente**: @supabase/supabase-js

## Estructura del Proyecto

```
euipe/
├── frontend/          # Aplicación React
├── supabase/          # Migraciones y funciones de Supabase
│   ├── migrations/    # Esquema de base de datos
│   └── functions/      # Edge Functions (opcional)
├── shared/            # Tipos TypeScript compartidos
└── README.md
```

## Configuración

### Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
Crear archivo `.env` en `frontend/`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

### Supabase

1. Instalar Supabase CLI:
```bash
npm install -g supabase
```

2. Inicializar proyecto (si es local):
```bash
supabase init
```

3. Ejecutar migraciones:
```bash
supabase db push
```

## Funcionalidades

- Gestión de jugadores
- Gestión de partidos
- Calificación de jugadores (1-10)
- Generación automática de equipos balanceados
- Historial de partidos y puntajes
