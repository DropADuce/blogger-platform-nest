import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Привет! Это руторвая страница моего бекенда, и она пока ничего не делает';
  }
}
