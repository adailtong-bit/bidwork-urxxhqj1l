-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function

-- 1. Create a secure function to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$func$;

-- 2. Update profiles policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT USING (
  auth.uid() = id OR 
  public.is_admin() OR
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles 
FOR UPDATE USING (
  auth.uid() = id OR 
  public.is_admin()
);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles 
FOR DELETE USING (
  public.is_admin()
);

-- 3. Update projects policies
DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects 
FOR SELECT USING (
  auth.uid() = owner_id OR 
  public.is_admin()
);

-- 4. Update materials policies
DROP POLICY IF EXISTS "materials_all_admin" ON public.materials;
CREATE POLICY "materials_all_admin" ON public.materials 
FOR ALL USING (
  public.is_admin()
);

-- 5. Update equipment policies
DROP POLICY IF EXISTS "equipment_all_admin" ON public.equipment;
CREATE POLICY "equipment_all_admin" ON public.equipment 
FOR ALL USING (
  public.is_admin()
);

-- 6. Update audit_logs policies
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs 
FOR SELECT USING (
  public.is_admin()
);
