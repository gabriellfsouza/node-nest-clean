import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { DatabaseModule } from '@/infra/database/database.module'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerCommentFactory } from 'test/factories/make-answer-comment'

describe('Fetch Answer Comments (E2E)', () => {
  let app: INestApplication

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let answerCommentFactory: AnswerCommentFactory

  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerCommentFactory,
        AnswerFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /answers/:answerId/answers', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
      email: 'UqJkz@example.com',
      password: 'some-hashed-password',
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    const answerId = answer.id.toString()

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        content: 'Comment 01',
        authorId: user.id,
        answerId: answer.id,
      }),
      answerCommentFactory.makePrismaAnswerComment({
        content: 'Comment 02',
        authorId: user.id,
        answerId: answer.id,
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Comment 02',
          authorName: 'John Doe',
        }),
        expect.objectContaining({
          content: 'Comment 01',
          authorName: 'John Doe',
        }),
      ]),
    })
  })
})
