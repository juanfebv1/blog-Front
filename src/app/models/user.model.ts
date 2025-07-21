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
export interface UserCreatedDTO extends Omit<CreateUserDTO, 'password'> {}


