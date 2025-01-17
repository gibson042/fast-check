import { infiniteStream } from '../../../src/arbitrary/infiniteStream';

import { convertFromNext, convertToNext } from '../../../src/check/arbitrary/definition/Converters';
import { fakeNextArbitrary } from './__test-helpers__/NextArbitraryHelpers';

import * as StreamArbitraryMock from '../../../src/arbitrary/_internals/StreamArbitrary';

function beforeEachHook() {
  jest.resetModules();
  jest.restoreAllMocks();
}
beforeEach(beforeEachHook);

describe('infiniteStream', () => {
  it('should instantiate StreamArbitrary(arb, numValues) for infiniteStream(arb)', () => {
    // Arrange
    const { instance: sourceArbitrary } = fakeNextArbitrary();
    const { instance } = fakeNextArbitrary();
    const StreamArbitrary = jest.spyOn(StreamArbitraryMock, 'StreamArbitrary');
    StreamArbitrary.mockImplementation(() => instance as StreamArbitraryMock.StreamArbitrary<unknown>);

    // Act
    const arb = infiniteStream(convertFromNext(sourceArbitrary));

    // Assert
    expect(StreamArbitrary).toHaveBeenCalledWith(sourceArbitrary);
    expect(convertToNext(arb)).toBe(instance);
  });
});
