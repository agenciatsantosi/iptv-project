-- Função para calcular e retornar recomendações personalizadas
create or replace function get_user_recommendations(
  p_user_id uuid default auth.uid(),
  p_limit integer default 20
)
returns table (
  content_id text,
  score float,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Retornar conteúdo mais popular
  return query
  select 
    cm.content_id,
    1.0 as score,
    'Conteúdo em alta' as reason
  from content_metadata cm
  where not exists (
    -- Excluir conteúdo já visto
    select 1 
    from viewing_history vh 
    where vh.content_id = cm.content_id 
    and vh.user_id = p_user_id
  )
  order by cm.views desc
  limit p_limit;
end;
$$;
