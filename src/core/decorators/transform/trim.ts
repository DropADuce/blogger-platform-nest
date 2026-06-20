import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform((params: TransformFnParams) => {
    return typeof params.value === 'string'
      ? params.value.trim()
      : params.value;
  });
};
