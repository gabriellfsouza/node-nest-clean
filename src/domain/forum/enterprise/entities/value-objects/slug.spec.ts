import { Slug } from './slug'

describe('Slug', () => {
  it('should be able to create a slug from text', () => {
    const slug = Slug.createFromText('Example question title')
    expect(slug.value).toEqual('example-question-title')
  })
})
