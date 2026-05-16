# 📊 VolunCare Pulse — Arquitectura Visual (Post-Hardening)

Generado bajo la regla **Visual Problem Solving** del Expert Functionality Framework.

---

## 1. Árbol de Componentes y Providers

```mermaid
graph TD
    A["React.StrictMode"] --> B["QueryClientProvider"]
    B --> C["AuthProvider"]
    C --> D["RouterProvider"]
    D --> E["__root.tsx"]
    E --> F{¿Ruta?}
    
    F -->|"/auth"| G["auth.tsx — Login / Registro"]
    F -->|"/*"| H["_authenticated.tsx — Auth Guard"]
    F -->|"404"| I["NotFoundComponent"]
    
    H --> J{¿User?}
    J -->|"null"| K["Navigate a /auth"]
    J -->|"loading"| L["Spinner"]
    J -->|"logged"| M["Outlet - Rutas"]
    
    M --> N["index.tsx — Dashboard"]
    M --> O["check-in.tsx — Wizard 3 pasos"]
    M --> P["historial.tsx — Analytics"]
    M --> Q["recursos.tsx — Biblioteca"]
    M --> R["botiquin.tsx — Crisis"]
    M --> S["perfil.tsx — Perfil"]
```

---

## 2. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant App as React App
    participant Auth as AuthContext
    participant SB as Supabase Auth

    Note over App: App inicializa
    App->>Auth: AuthProvider monta
    Auth->>SB: getSession()
    SB-->>Auth: session o null
    Auth->>Auth: setUser(session.user)
    Auth->>Auth: setLoading(false)

    alt No hay sesion
        App->>U: Redirect a /auth
        U->>App: Email + Password
        App->>Auth: signIn(email, pwd)
        Auth->>SB: signInWithPassword()
        SB-->>Auth: session + JWT
        Auth->>Auth: onAuthStateChange - setUser
        App->>U: Redirect a / Dashboard
    end

    Note over Auth: Listener activo permanente
    SB-->>Auth: onAuthStateChange - token refresh
    Auth->>Auth: setSession(new)

    U->>App: Click Cerrar sesion
    App->>Auth: signOut()
    Auth->>SB: supabase.auth.signOut()
    SB-->>Auth: session = null
    Auth->>Auth: setUser(null)
    App->>U: Redirect a /auth
```

---

## 3. Flujo de Datos — React Query (Post-Hardening)

```mermaid
flowchart LR
    subgraph Frontend["Frontend React"]
        direction TB
        A["useQuery - perfil.tsx"] 
        B["useInfiniteQuery - historial.tsx"]
        C["useMutation - check-in.tsx"]
        D["useQuery - recursos.tsx"]
    end

    subgraph Cache["QueryClient Cache"]
        direction TB
        E["profile, uid"]
        F["profile_stats, uid"]
        G["check_ins, uid"]
    end

    subgraph Validation["Zod Validation"]
        direction TB
        H["profileSchema.parse"]
        I["checkInRowSchema.parse"]
        J["checkInSchema.safeParse"]
    end

    subgraph Backend["Supabase"]
        direction TB
        K[("profiles")]
        L[("check_ins")]
        M[("recursos")]
    end

    A -->|"queryKey"| E
    A -->|"queryFn"| K
    K -->|"response"| H
    H -->|"parsed Profile"| E

    B -->|"queryKey"| G
    B -->|"queryFn"| L
    L -->|"response"| I
    I -->|"parsed CheckInRow"| G

    C -->|"mutationFn"| J
    J -->|"validated payload"| L
    C -->|"onSuccess"| G
    C -->|"onSuccess"| F

    D -->|"queryFn"| M
```

---

## 4. Flujo del Check-in — Wizard 3 Pasos

```mermaid
stateDiagram-v2
    [*] --> Step1: Usuario abre /check-in

    state Step1 {
        [*] --> SliderEnergia: Nivel de energia 1 a 5
        SliderEnergia --> SliderAnimo: Nivel de animo 1 a 5
    }

    Step1 --> Step2: Click Siguiente

    state Step2 {
        [*] --> EmocionGrid: Seleccionar emocion Plutchik
    }

    Step2 --> Step3: Click Siguiente con emocion seleccionada

    state Step3 {
        [*] --> Catarsis: Caja de Catarsis opcional
    }

    Step3 --> Validation: Click Guardar Check-In

    state Validation {
        [*] --> ZodParse: checkInSchema.safeParse
        ZodParse --> Valid: success
        ZodParse --> Invalid: error
    }

    Valid --> Mutation: mutation.mutate
    Invalid --> Step3: Datos invalidos

    state Mutation {
        [*] --> Inserting: supabase.insert
        Inserting --> Success: onSuccess
        Inserting --> Error: onError
        Success --> Invalidate: invalidateQueries
    }

    Success --> Done: Check-in guardado
    Done --> [*]: Volver al inicio - Dashboard
```

---

## 5. Schema de Base de Datos — Supabase

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        string email
        timestamp created_at
    }

    PROFILES {
        uuid id PK
        string nombre_completo
        string email
        string rol_asignado
        timestamp created_at
    }

    CHECK_INS {
        uuid id PK
        uuid voluntario_id FK
        int nivel_energia
        int nivel_animo
        string emocion_principal
        text caja_catarsis
        boolean bandera_riesgo
        timestamp fecha_hora
    }

    RECURSOS {
        uuid id PK
        string titulo
        string descripcion
        string tipo
        string contenido_url
        int orden
    }

    AUTH_USERS ||--|| PROFILES : "id = id"
    AUTH_USERS ||--o{ CHECK_INS : "id = voluntario_id"
```

---

## 6. Mapa de Navegacion UX

```mermaid
flowchart TB
    AUTH["/auth - Login/Registro"]
    
    subgraph AppShell["AppShell - Bottom Nav"]
        DASH["/index - Dashboard"]
        CHECKIN["/check-in - Check-In"]
        BOTIQUIN["/botiquin - Botiquin"]
        RECURSOS["/recursos - Recursos"]
        PERFIL["/perfil - Perfil"]
    end

    HIST["/historial - Historial"]
    E404["404 - Not Found"]

    AUTH -->|"Login exitoso"| DASH
    DASH -->|"CTA principal"| CHECKIN
    DASH -->|"Card Mi historial"| HIST
    DASH -->|"Card Botiquin"| BOTIQUIN
    
    CHECKIN -->|"Guardar OK"| DASH
    
    PERFIL -->|"Cerrar sesion"| AUTH
```
