import {
  Body,
  Controller,
  Post,
  // Req,
  UseGuards,
} from '@nestjs/common'
// import { Request } from 'express'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { JwTAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { UserTokenPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { z } from 'zod'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})
const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwTAuthGuard)
export class CreateQuestionController {
  constructor(private createQuestion: CreateQuestionUseCase) {}

  @Post()
  // async handle(@Req() request: Request) {
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserTokenPayload,
  ) {
    const { title, content } = body
    await this.createQuestion.execute({
      authorId: user.sub,
      title,
      content,
      attachmentIds: [],
    })
  }
}
