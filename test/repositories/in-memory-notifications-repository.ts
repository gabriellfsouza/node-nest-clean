import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repositories'
import { Notification } from '@/domain/notification/enterprise/entities/notification'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async findById(id: string): Promise<Notification | null> {
    const notification = this.items.find((item) => item.id.toString() === id)
    return notification || null
  }

  async save(notification: Notification): Promise<void> {
    const notificationIndex = this.items.findIndex(
      (item) => item.id === notification.id,
    )
    if (notificationIndex >= 0) {
      this.items[notificationIndex] = notification
    }
  }

  async create(notification: Notification) {
    this.items.push(notification)
  }
}
