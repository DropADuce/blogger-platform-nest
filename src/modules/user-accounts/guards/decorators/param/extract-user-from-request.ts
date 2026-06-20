import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDTO } from 'modules/user-accounts/guards/dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDTO => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new Error('Такой пользователь не найден');
    }

    return user;
  },
);
