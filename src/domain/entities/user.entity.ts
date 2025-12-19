export class UserDm {
  constructor(
    public readonly id: string,
    public username: string,
    public email: string,
    public password: string,
    public biography: string = '',
    public isAdmin: boolean = false,
  ) {}
}
