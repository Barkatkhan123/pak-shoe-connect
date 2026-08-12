-- SherSha B2B Footwear Marketplace
-- PostgreSQL Seed Script: Idempotent Master Admin Account & RBAC Permissions Initialization
-- Enables pgcrypto extension for Argon2 / bcrypt password hashing

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Only MASTER_ADMIN can select/update roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Master Admin Role Access'
    ) THEN
        CREATE POLICY "Master Admin Role Access" ON public.user_roles
            FOR ALL USING (auth.jwt() ->> 'email' = 'anamoontotrade@gmail.com');
    END IF;
END $$;

-- 2. Idempotently Insert Master Admin into auth.users (Using crypt bcrypt hashing)
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'anamoontotrade@gmail.com';
    -- Securely hashed password (bcrypt / pgcrypto)
    hashed_pw TEXT := crypt('Sher12@@##s', gen_salt('bf', 10));
BEGIN
    -- Insert auth user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            hashed_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"MASTER_ADMIN","status":"ACTIVE"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );

        -- Bind role in public.user_roles
        INSERT INTO public.user_roles (user_id, email, role, status)
        VALUES (admin_id, admin_email, 'MASTER_ADMIN', 'ACTIVE')
        ON CONFLICT (email) DO UPDATE SET role = 'MASTER_ADMIN', status = 'ACTIVE';
    ELSE
        -- If user exists, ensure public.user_roles reflects MASTER_ADMIN
        INSERT INTO public.user_roles (user_id, email, role, status)
        SELECT id, email, 'MASTER_ADMIN', 'ACTIVE'
        FROM auth.users WHERE email = admin_email
        ON CONFLICT (email) DO UPDATE SET role = 'MASTER_ADMIN', status = 'ACTIVE';
    END IF;
END $$;
