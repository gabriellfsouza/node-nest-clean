import { DomainEvents } from '@/core/events/domain-events'
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { InMemoryStudentsRepository } from './in-memory-students-repository'
import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { InMemoryQuestionAttachmentsRepository } from './in-memory-question-attachments-repository'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'

export class InMemoryQuestionsRepository implements QuestionsRepository {
  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
    private studentsRepository: InMemoryStudentsRepository,
  ) {}

  public items: Question[] = []

  async findById(questionId: string) {
    const question = this.items.find(
      (item) => item.id.toString() === questionId,
    )
    if (!question) return null
    return question
  }

  async findBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug)
    if (!question) return null
    return question
  }

  async findDetailsBySlug(slug: string) {
    const question = this.items.find((item) => item.slug.value === slug)
    if (!question) return null

    const author = this.studentsRepository.items.find((student) =>
      student.id.equals(question.authorId),
    )

    if (!author)
      throw new Error(
        `Author with id ${question.authorId.toString()} not found`,
      )

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) => questionAttachment.questionId.equals(question.id),
    )

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentsRepository.items.find((attachment) =>
        attachment.id.equals(questionAttachment.attachmentId),
      )

      if (!attachment) {
        throw new Error(
          `Attachment with id ${questionAttachment.attachmentId.toString()} not found`,
        )
      }

      return attachment
    })

    console.log({ attachments, questionAttachments })

    return QuestionDetails.create({
      questionId: question.id,
      authorId: question.authorId,
      author: author.name,
      content: question.content,
      title: question.title,
      slug: question.slug,
      bestAnswerId: question.bestAnswerId,
      attachments,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    })
  }

  async findManyRecent({ page }: { page: number }) {
    return this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

  async create(question: Question) {
    this.items.push(question)

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    )

    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async save(question: Question) {
    const index = this.items.findIndex((item) => item.id === question.id)
    this.items[index] = question

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems(),
    )

    await this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems(),
    )

    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async delete(question: Question) {
    const index = this.items.findIndex((item) => item.id === question.id)
    this.items.splice(index, 1)
    this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    )
  }
}
