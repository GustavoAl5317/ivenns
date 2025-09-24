-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update product click count
CREATE OR REPLACE FUNCTION public.increment_product_clicks(product_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products 
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE id = product_uuid;
END;
$$;

-- Function to get dashboard metrics for admins
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM public.products),
    'total_reviews', (SELECT COUNT(*) FROM public.reviews),
    'pending_reviews', (SELECT COUNT(*) FROM public.reviews WHERE is_approved = false),
    'total_users', (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
    'whatsapp_clicks', (SELECT COUNT(*) FROM public.contact_interactions WHERE type = 'whatsapp'),
    'email_clicks', (SELECT COUNT(*) FROM public.contact_interactions WHERE type = 'email'),
    'email_captures', (SELECT COUNT(*) FROM public.email_captures)
  ) INTO result;

  RETURN result;
END;
$$;
