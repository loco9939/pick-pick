-- Add password column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS password text;

-- Function to update anonymous comment
CREATE OR REPLACE FUNCTION update_anonymous_comment(
  p_comment_id uuid,
  p_password text,
  p_content text,
  p_nickname text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comment_id uuid;
BEGIN
  UPDATE comments
  SET 
    content = p_content,
    nickname = p_nickname
  WHERE id = p_comment_id 
    AND password = p_password
    AND user_id IS NULL
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id IS NOT NULL;
END;
$$;

-- Function to delete anonymous comment
CREATE OR REPLACE FUNCTION delete_anonymous_comment(
  p_comment_id uuid,
  p_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comment_id uuid;
BEGIN
  DELETE FROM comments
  WHERE id = p_comment_id 
    AND password = p_password
    AND user_id IS NULL
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id IS NOT NULL;
END;
$$;
