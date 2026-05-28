import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingService } from '../domain/testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAll() {
    await this.testingService.removeAll();
  }
}
