import { Public } from '@/infra/auth/public'
import { Controller, Get, HttpCode } from '@nestjs/common'
import { HealthCheck } from '@nestjs/terminus'

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @HealthCheck()
  @HttpCode(200)
  check() {
    return { status: 'ok' }
  }
}
