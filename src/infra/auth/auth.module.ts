import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwTStrategy } from './jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { JwTAuthGuard } from './jwt-auth.guard'
import { EnvService } from '../env/env.service'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY')
        const publicKey = env.get('JWT_PUBLIC_KEY')

        return {
          // options: { algorithm: 'RS256' },
          signOptions: {
            algorithm: 'RS256',
          },
          // verifyOptions: {
          //   algorithms: ['RS256'],
          // },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
  providers: [
    JwTStrategy,
    { provide: APP_GUARD, useClass: JwTAuthGuard },
    EnvService,
  ],
})
export class AuthModule {}
