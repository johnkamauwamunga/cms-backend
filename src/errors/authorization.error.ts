import { AppError } from "./app-error";
export class AuthorizationError extends AppError{

constructor(message:string){
    super(message, 401);
    this.name='AuthenticationError';
}
}