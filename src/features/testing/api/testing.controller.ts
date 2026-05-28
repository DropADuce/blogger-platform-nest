import { Controller, Delete } from '@nestjs/common';
import { TestingService } from '../domain/testing.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('/all-data')
  async removeAll() {
    await this.testingService.removeAll();
  }
}
