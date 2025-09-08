import { ItemId } from 'src/domain/itemId.entity';

describe('ItemId Entity', () => {
  it('should return the correct id via getId', () => {
    const itemId = new ItemId(42);
    expect(itemId.getId()).toBe(42);
  });

  it('should store different ids correctly', () => {
    const item1 = new ItemId(1);
    const item2 = new ItemId(999);
    expect(item1.getId()).toBe(1);
    expect(item2.getId()).toBe(999);
  });
});
