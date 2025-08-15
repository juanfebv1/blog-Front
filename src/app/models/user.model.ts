export interface CreateUserDTO {
  email: string,
  username: string,
  password: string
}

export interface LoginUserDTO {
  email: string,
  password: string
}

export interface UserProfile {
  id: number,
  username: string,
  email: string,
  team: number,
  team_name: string,
  role: string
}

