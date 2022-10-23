/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoiRequestValidationError } from '@globals/helpers/error-handler';
import {Request} from 'express';
import {ObjectSchema} from 'joi';

// creating type of method
type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export const joiValidation = (schema: ObjectSchema): IJoiDecorator => {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // args represents all parameters of the function, above which decorator will be used.
    descriptor.value = async (...args: any[]) => {
      // args => req, res, next
      const req: Request = args[0];

      const { error } = await Promise.resolve(schema.validate(req.body));
      if(error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
