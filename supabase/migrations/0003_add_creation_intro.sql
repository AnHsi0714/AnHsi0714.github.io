-- 朋友敘述（選填）：創作牆上點擊置中作品時顯示，跟著邀請碼一起可二次編輯

alter table friend_creations
  add column intro text check (char_length(intro) <= 200);

-- 兩個寫入 RPC 要加 p_intro 參數。create or replace 改不了參數列——
-- 直接 replace 會變成新增一個五參數的重載，舊的四參數版還在，
-- PostgREST 以具名參數呼叫時會出現「function is not unique」，所以先 drop 舊簽名。

drop function if exists redeem_invite_and_create(text, text, text, jsonb);

create function redeem_invite_and_create(
  p_code text,
  p_nickname text,
  p_kind text,
  p_data jsonb,
  p_intro text default null
) returns friend_creations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_row invite_codes;
  v_new_row friend_creations;
begin
  select * into v_code_row from invite_codes
    where code = p_code
      and is_used = false
      and (expires_at is null or expires_at > now())
    for update;  -- 鎖住該列，避免同碼被同時兌換兩次

  if v_code_row is null then
    raise exception '邀請碼無效或已使用';
  end if;

  update invite_codes
    set is_used = true, used_by_nickname = p_nickname, used_at = now()
    where id = v_code_row.id;

  insert into friend_creations (nickname, kind, data, intro, invite_code_id)
    values (p_nickname, p_kind, p_data, nullif(trim(p_intro), ''), v_code_row.id)
    returning * into v_new_row;

  return v_new_row;
end;
$$;

grant execute on function redeem_invite_and_create to anon;


drop function if exists update_creation_with_code(text, text, jsonb);

create function update_creation_with_code(
  p_code text,
  p_nickname text,
  p_data jsonb,
  p_intro text default null
) returns friend_creations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_row invite_codes;
  v_row friend_creations;
begin
  select * into v_code_row from invite_codes
    where code = p_code and is_used = true;

  if v_code_row is null then
    raise exception '邀請碼無效或尚未使用';
  end if;

  update friend_creations
    set nickname = p_nickname,
        data = p_data,
        intro = nullif(trim(p_intro), '')
    where invite_code_id = v_code_row.id
    returning * into v_row;

  if v_row is null then
    raise exception '找不到這個邀請碼對應的作品';
  end if;

  update invite_codes
    set used_by_nickname = p_nickname
    where id = v_code_row.id;

  return v_row;
end;
$$;

grant execute on function update_creation_with_code to anon;
