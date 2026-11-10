/**
 * Avatar helpers.
 *
 * A person without an uploaded avatar must not fall back to a random image
 * from an external service: the picture would change on every request, leak a
 * third-party request from every page, and show a stranger's face next to a
 * real name. The bundled placeholder is served from /public instead.
 */
export const AVATAR_PLACEHOLDER = "/avatar-placeholder.png";

/** The avatar URL to render for a user or instructor, never empty. */
export function avatarSrc(value) {
  if (typeof value !== "string") return AVATAR_PLACEHOLDER;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : AVATAR_PLACEHOLDER;
}
