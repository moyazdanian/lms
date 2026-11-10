import { api } from '../api/client';

/**
 * Returns the authenticated user: { id, name, email, role, avatar }.
 * Maps the Laravel payload once, here, so the UI never depends on its shape.
 */
export async function getCurrentUser(options) {
  const user = await api.get('/user', options);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null
  };
}