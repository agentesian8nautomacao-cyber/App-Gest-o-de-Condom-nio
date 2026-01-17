-- ============================================
-- SCRIPT DE CORREÇÃO - Remover Objetos Duplicados
-- ============================================
-- Execute este script se encontrar erros de objetos já existentes
-- ============================================

-- Remover índices duplicados (se houver)
DO $$ 
DECLARE
    idx_record RECORD;
BEGIN
    FOR idx_record IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
    LOOP
        BEGIN
            EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(idx_record.indexname) || ' CASCADE';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Erro ao remover índice %: %', idx_record.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Remover triggers duplicados (se houver)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_residents_updated_at ON residents;
DROP TRIGGER IF EXISTS update_areas_updated_at ON areas;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
DROP TRIGGER IF EXISTS update_occurrences_updated_at ON occurrences;
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
DROP TRIGGER IF EXISTS update_crm_units_updated_at ON crm_units;
DROP TRIGGER IF EXISTS update_crm_issues_updated_at ON crm_issues;
DROP TRIGGER IF EXISTS update_app_config_updated_at ON app_config;

DROP TRIGGER IF EXISTS trigger_update_package_recipient_cache ON packages;
DROP TRIGGER IF EXISTS trigger_update_visitor_resident_cache ON visitors;
DROP TRIGGER IF EXISTS trigger_update_occurrence_resident_cache ON occurrences;
DROP TRIGGER IF EXISTS trigger_update_reservation_resident_cache ON reservations;
DROP TRIGGER IF EXISTS trigger_update_crm_unit_resident_cache ON crm_units;

-- Remover políticas duplicadas (se houver)
DROP POLICY IF EXISTS "Users can view all data" ON users;
DROP POLICY IF EXISTS "Users can insert all data" ON residents;
DROP POLICY IF EXISTS "Users can update all data" ON residents;
DROP POLICY IF EXISTS "Users can delete all data" ON residents;

-- Agora você pode executar o supabase_schema.sql novamente
-- Todos os objetos serão recriados corretamente
