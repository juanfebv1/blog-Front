export interface Team {
  id: string,
  name: string
}

export interface User {
  id: string,
  email: string,
  username: string,
  password: string,
  team: Team
}

export interface CreateUserDTO extends Omit<User, 'id' | 'team'> {}


export interface LoginUserDTO {
  email: string,
  password: string
}

export interface UserProfile {
  email: string,
  username: string
}

