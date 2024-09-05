import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { DatabaseModule } from '@/infra/database/database.module'
import { QuestionCommentFactory } from 'test/factories/make-question-comment'

describe('Fetch Question Comments (E2E)', () => {
  let app: INestApplication

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let questionCommentFactory: QuestionCommentFactory

  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, QuestionCommentFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
      email: 'UqJkz@example.com',
      password: 'some-hashed-password',
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      title: 'Question 01',
      slug: Slug.create('question-01'),
      content: 'Question content',
      authorId: user.id,
    })

    const questionId = question.id.toString()

    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        content: 'Comment 01',
        authorId: user.id,
        questionId: question.id,
      }),
      questionCommentFactory.makePrismaQuestionComment({
        content: 'Comment 02',
        authorId: user.id,
        questionId: question.id,
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/comments`)
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
