import { AuthGuard } from '@nestjs/passport'

export class JwTAuthGuard extends AuthGuard('jwt') {}
