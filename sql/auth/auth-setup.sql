-- Auth Setup SQL for Supabase
-- This script creates the demo users in Supabase Auth
-- Run this AFTER running the main database-setup.sql

-- Create demo users with hashed passwords
-- Note: In production, users would sign up through the UI

-- Super Admin User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@aiauditor.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "System", "last_name": "Administrator"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Auditor User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'auditor@aiauditor.com',
    crypt('auditor123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "John", "last_name": "Smith"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Viewer User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'viewer@aiauditor.com',
    crypt('viewer123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jane", "last_name": "Doe"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- CRO User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'cro@aiauditor.com',
    crypt('cro123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Michael", "last_name": "Johnson"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Business Unit Manager User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'manager@aiauditor.com',
    crypt('manager123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Sarah", "last_name": "Wilson"}',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding identities
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "auditor@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "viewer@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub": "44444444-4444-4444-4444-444444444444", "email": "cro@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '{"sub": "55555555-5555-5555-5555-555555555555", "email": "manager@aiauditor.com"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Set up storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at)
VALUES ('evidence-files', 'evidence-files', false, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for evidence files
CREATE POLICY IF NOT EXISTS "Users can upload evidence files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can view evidence files they have access to"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update their evidence files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can delete their evidence files"
ON storage.objects FOR DELETE
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');
