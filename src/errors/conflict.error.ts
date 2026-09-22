import { AppError } from "./app-error";
export class ConflictError extends AppError{

    constructor(message:string){
        super(message, 500, false);
        this.name='SystemError';
    }
}
