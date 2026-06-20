import { UserDocument } from '../../domain/user.entity';

export class MeDTO {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserDocument) {
    const dto = new MeDTO();

    dto.userId = user._id.toString();
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
