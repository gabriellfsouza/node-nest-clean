import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'
import { DomainEvents } from './domain-events'

class CustomAggregate extends AggregateRoot<null> {
  static create() {
    const aggregate = new CustomAggregate(null)
    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate))
    return aggregate
  }
}

class CustomAggregateCreated implements DomainEvent {
  public ocurredAt: Date
  private aggregate: CustomAggregate

  constructor(aggregate: CustomAggregate) {
    this.ocurredAt = new Date()
    this.aggregate = aggregate
  }

  public getAggregateId(): UniqueEntityID {
    return new UniqueEntityID()
  }
}

describe('Domain Events', () => {
  it('should be able to dispatch and listen to events', async () => {
    const callbackSpy = vi.fn()

    // Subscriber registered and listening events via spy function
    DomainEvents.register(callbackSpy, CustomAggregateCreated.name)

    // Creating a response aggregator before updating the database
    const aggregate = CustomAggregate.create()

    // Asserting that the event was created and not dispatched yet
    expect(aggregate.domainEvents).toHaveLength(1)
    // Simulating the event being dispatched via database (that action needs to be done after the database answer)
    DomainEvents.dispatchEventsForAggregate(aggregate.id)
    // Checking if the subscriber was called and did what was expected to do
    expect(callbackSpy).toHaveBeenCalled()
    expect(aggregate.domainEvents).toHaveLength(0)
  })
})
