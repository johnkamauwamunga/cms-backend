import { AppError } from "./app-error";

export class ValidationError extends AppError{
  public readonly details?: Record<string, any>;

  constructor(message:string, details?: Record<string, any>){
    super(message, 400);
    this.details= details;
    this.name='ValidationError';
  }
    
}