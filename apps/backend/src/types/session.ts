/** The safe subset of a user carried on req.user: never hashes or tokens. */
export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
}
