-- 朋友功能第二批 RPC：作畫前的邀請碼檢查 + 用邀請碼二次編輯作品
-- 設計：邀請碼兌換後就成為該作品的「永久編輯憑證」——拿到碼 = 能改那件作品。
-- 碼由你私下發給朋友（見 docs/ARCHITECTURE.md §5），且已決定不做速率限制，
-- 所以 check_invite_code 會洩漏「某字串是不是有效碼」這件事是可接受的。

-- 檢查邀請碼狀態，讓朋友在開始作畫前就知道碼能不能用：
--   { "status": "invalid" }                     碼不存在，或未使用但已過期
--   { "status": "unused" }                      可用來建立新作品
--   { "status": "used", "creation": {...} }     已兌換，回傳對應作品供編輯模式載入
create or replace function check_invite_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_row invite_codes;
  v_creation friend_creations;
begin
  select * into v_code_row from invite_codes where code = p_code;

  if v_code_row is null
     or (v_code_row.is_used = false
         and v_code_row.expires_at is not null
         and v_code_row.expires_at <= now()) then
    return jsonb_build_object('status', 'invalid');
  end if;

  if v_code_row.is_used = false then
    return jsonb_build_object('status', 'unused');
  end if;

  -- 已兌換的碼過期與否不影響編輯權；作品若被手動刪除則碼視同作廢
  select * into v_creation from friend_creations
    where invite_code_id = v_code_row.id;

  if v_creation is null then
    return jsonb_build_object('status', 'invalid');
  end if;

  return jsonb_build_object('status', 'used', 'creation', to_jsonb(v_creation));
end;
$$;

grant execute on function check_invite_code to anon;


-- 用已兌換的邀請碼覆蓋原作品（暱稱＋圖一起換）；is_visible 不動，
-- 你審核關閉的作品不會因為朋友重新編輯而重新出現
create or replace function update_creation_with_code(
  p_code text,
  p_nickname text,
  p_data jsonb
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
    set nickname = p_nickname, data = p_data
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
