import { UserProfile } from "./user.model";

export interface AuthInterface {
  access: string,
  refresh: string,
  user: UserProfile
}
