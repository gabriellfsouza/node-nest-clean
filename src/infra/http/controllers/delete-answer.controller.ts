import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserTokenPayload } from '@/infra/auth/jwt.strategy'
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer'

@Controller('/answers/:id')
export class DeleteAnswerController {
  constructor(private deleteAnswer: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserTokenPayload,
    @Param('id') answerId: string,
  ) {
    const result = await this.deleteAnswer.execute({
      authorId: user.sub,
      answerId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
