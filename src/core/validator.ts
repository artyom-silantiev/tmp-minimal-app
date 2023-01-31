import { validate } from 'class-validator';
import { HttpException } from './catch_error';

type Class<T = any> = new (...args: any[]) => T;

export async function validateDto<T>(data: any, Dto: Class<T>) {
  const dto = new Dto();
  const validateObject = Object.assign(dto as any, data);

  const errors = await validate(validateObject);

  if (errors.length > 0) {
    const validateErrors = [] as {
      field: string;
      code: string;
      message: string;
    }[];

    for (const error of errors) {
      if (error.constraints) {
        for (const code of Object.keys(error.constraints)) {
          validateErrors.push({
            field: error.property,
            code,
            message: error.constraints[code],
          });
        }
      }
    }

    throw new HttpException(validateErrors, 422);
  }

  return validateObject as T;
}
