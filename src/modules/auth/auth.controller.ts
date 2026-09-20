import { Request, Response, NextFunction } from "express";

import {
  register,
  login,
} from "./auth.service";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = registerSchema.parse(req.body);

    const result = await register(input);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await login(input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}