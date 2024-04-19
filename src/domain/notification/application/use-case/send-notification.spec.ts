import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { SendNotificationUseCase } from './send-notification'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
// system under test
let sut: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(async () => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to send a notification', async () => {
    const result = await sut.execute({
      recipientId: '1',
      title: 'New notification',
      content: 'Notification content',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryNotificationsRepository.items.length).toBe(1)
    expect(inMemoryNotificationsRepository.items[0]).toEqual(
      result.value?.notification,
    )
    expect(inMemoryNotificationsRepository.items[0].id).toEqual(
      result.value?.notification.id,
    )
  })
})
