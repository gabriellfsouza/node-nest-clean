import {
  Body,
  Controller,
  Post,
  // Req,
  UseGuards,
} from '@nestjs/common'
// import { Request } from 'express'
import { CurrentUser } from '@/auth/current-user.decorator'
import { JwTAuthGuard } from '@/auth/jwt-auth.guard'
import { UserTokenPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})
const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwTAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  // async handle(@Req() request: Request) {
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserTokenPayload,
  ) {
    const { title, content } = body
    await this.prisma.question.create({
      data: {
        title,
        content,
        slug: this.convertToSlug(title),
        authorId: user.sub,
      },
    })
    // console.log(request.user)
  }

  private convertToSlug(input: string): string {
    return (
      input
        // Normalize the string to NFD to split accented characters
        .normalize('NFD')
        // Use a regular expression to remove non-basic Latin characters
        .replace(/[\u0300-\u036f]/g, '')
        // Convert to lowercase
        .toLowerCase()
        // Replace spaces with dashes
        .replace(/\s+/g, '-')
        // Remove all remaining characters that are not alphanumeric or dashes
        .replace(/[^a-z0-9-]/g, '')
        // Replace multiple dashes with a single dash
        .replace(/-{2,}/g, '-')
    )
  }
}
