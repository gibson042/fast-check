import { WithShrinkFromOtherArbitrary } from '../../../../src/arbitrary/_internals/WithShrinkFromOtherArbitrary';
import { NextValue } from '../../../../src/check/arbitrary/definition/NextValue';
import { fakeNextArbitrary } from '../__test-helpers__/NextArbitraryHelpers';
import { fakeRandom } from '../__test-helpers__/RandomHelpers';
import { Stream } from '../../../../src/stream/Stream';
import fc from '../../../../lib/fast-check';

describe('WithShrinkFromOtherArbitrary', () => {
  describe('generate', () => {
    it('should only use the first arbitrary to generate values', () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 2 }), { nil: undefined }),
          fc.anything(),
          fc.anything(),
          (biasFactor, vA, cA) => {
            // Arrange
            const {
              instance: generatorArbitrary,
              generate: generateA,
              shrink: shrinkA,
              canShrinkWithoutContext: canShrinkWithoutContextA,
            } = fakeNextArbitrary();
            const {
              instance: shrinkerArbitrary,
              generate: generateB,
              shrink: shrinkB,
              canShrinkWithoutContext: canShrinkWithoutContextB,
            } = fakeNextArbitrary();
            generateA.mockReturnValueOnce(new NextValue(vA, cA));
            const { instance: mrng } = fakeRandom();

            // Act
            const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
            const g = arb.generate(mrng, biasFactor);

            // Assert
            expect(g.value).toBe(vA);
            expect(generateA).toHaveBeenCalledWith(mrng, biasFactor);
            expect(shrinkA).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
            expect(generateB).not.toHaveBeenCalled();
            expect(shrinkB).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextB).not.toHaveBeenCalled();
          }
        )
      );
    });
  });

  describe('canShrinkWithoutContext', () => {
    it.each`
      canShrink
      ${false}
      ${true}
    `(
      'should only use the second arbitrary to check if it can shrink without context (with canShrink=$canShrink)',
      ({ canShrink }) => {
        // Arrange
        const vA = Symbol();
        const {
          instance: generatorArbitrary,
          generate: generateA,
          shrink: shrinkA,
          canShrinkWithoutContext: canShrinkWithoutContextA,
        } = fakeNextArbitrary();
        const {
          instance: shrinkerArbitrary,
          generate: generateB,
          shrink: shrinkB,
          canShrinkWithoutContext: canShrinkWithoutContextB,
        } = fakeNextArbitrary();
        canShrinkWithoutContextB.mockReturnValueOnce(canShrink);

        // Act
        const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
        const out = arb.canShrinkWithoutContext(vA);

        // Assert
        expect(out).toBe(canShrink);
        expect(generateA).not.toHaveBeenCalled();
        expect(shrinkA).not.toHaveBeenCalled();
        expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
        expect(generateB).not.toHaveBeenCalled();
        expect(shrinkB).not.toHaveBeenCalled();
        expect(canShrinkWithoutContextB).toHaveBeenCalledWith(vA);
      }
    );
  });

  describe('shrink', () => {
    it('should only use the first arbitrary for values it generated (coming with the context)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 2 }), { nil: undefined }),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          (biasFactor, vA, cA, vAA, cAA, vAB, cAB) => {
            // Arrange
            const {
              instance: generatorArbitrary,
              generate: generateA,
              shrink: shrinkA,
              canShrinkWithoutContext: canShrinkWithoutContextA,
            } = fakeNextArbitrary();
            const {
              instance: shrinkerArbitrary,
              generate: generateB,
              shrink: shrinkB,
              canShrinkWithoutContext: canShrinkWithoutContextB,
            } = fakeNextArbitrary();
            generateA.mockReturnValueOnce(new NextValue(vA, cA));
            shrinkA.mockReturnValueOnce(Stream.of(new NextValue(vAA, cAA), new NextValue(vAB, cAB)));
            const { instance: mrng } = fakeRandom();

            // Act
            const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
            const g = arb.generate(mrng, biasFactor);
            const shrinks = [...arb.shrink(g.value, g.context)];

            // Assert
            expect(shrinks).toHaveLength(2);
            expect(shrinks[0].value).toBe(vAA);
            expect(shrinks[1].value).toBe(vAB);
            expect(generateA).toHaveBeenCalledWith(mrng, biasFactor);
            expect(shrinkA).toHaveBeenCalledWith(vA, cA);
            expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
            expect(generateB).not.toHaveBeenCalled();
            expect(shrinkB).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextB).not.toHaveBeenCalled();
          }
        )
      );
    });

    it('should only use the first arbitrary for values it shrunk (coming with the context)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 2 }), { nil: undefined }),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          (biasFactor, vA, cA, vAA, cAA, vAB, cAB, vAC, cAC, vABA, cABA) => {
            // Arrange
            const {
              instance: generatorArbitrary,
              generate: generateA,
              shrink: shrinkA,
              canShrinkWithoutContext: canShrinkWithoutContextA,
            } = fakeNextArbitrary();
            const {
              instance: shrinkerArbitrary,
              generate: generateB,
              shrink: shrinkB,
              canShrinkWithoutContext: canShrinkWithoutContextB,
            } = fakeNextArbitrary();
            generateA.mockReturnValueOnce(new NextValue(vA, cA));
            shrinkA.mockReturnValueOnce(
              Stream.of(new NextValue(vAA, cAA), new NextValue(vAB, cAB), new NextValue(vAC, cAC))
            );
            shrinkA.mockReturnValueOnce(Stream.of(new NextValue(vABA, cABA)));
            const { instance: mrng } = fakeRandom();

            // Act
            const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
            const g = arb.generate(mrng, biasFactor);
            const g2 = [...arb.shrink(g.value, g.context)][1];
            const shrinks = [...arb.shrink(g2.value, g2.context)];

            // Assert
            expect(shrinks).toHaveLength(1);
            expect(shrinks[0].value).toBe(vABA);
            expect(generateA).toHaveBeenCalledWith(mrng, biasFactor);
            expect(shrinkA).toHaveBeenCalledWith(vA, cA);
            expect(shrinkA).toHaveBeenCalledWith(vAB, cAB);
            expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
            expect(generateB).not.toHaveBeenCalled();
            expect(shrinkB).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextB).not.toHaveBeenCalled();
          }
        )
      );
    });

    it('should only use the second arbitrary for values coming without any context', () => {
      fc.assert(
        fc.property(
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          (vA, vAA, cAA, vAB, cAB) => {
            // Arrange
            const {
              instance: generatorArbitrary,
              generate: generateA,
              shrink: shrinkA,
              canShrinkWithoutContext: canShrinkWithoutContextA,
            } = fakeNextArbitrary();
            const {
              instance: shrinkerArbitrary,
              generate: generateB,
              shrink: shrinkB,
              canShrinkWithoutContext: canShrinkWithoutContextB,
            } = fakeNextArbitrary();
            shrinkB.mockReturnValueOnce(Stream.of(new NextValue(vAA, cAA), new NextValue(vAB, cAB)));

            // Act
            const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
            const shrinks = [...arb.shrink(vA, undefined)];

            // Assert
            expect(shrinks).toHaveLength(2);
            expect(shrinks[0].value).toBe(vAA);
            expect(shrinks[1].value).toBe(vAB);
            expect(generateA).not.toHaveBeenCalled();
            expect(shrinkA).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
            expect(generateB).not.toHaveBeenCalled();
            expect(shrinkB).toHaveBeenCalledWith(vA, undefined);
            expect(canShrinkWithoutContextB).not.toHaveBeenCalled();
          }
        )
      );
    });

    it('should only use the second arbitrary for values shrunk by it (coming with the context)', () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 2 }), { nil: undefined }),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          fc.anything(),
          (biasFactor, vA, vAA, cAA, vAB, cAB, vAC, cAC, vABA, cABA) => {
            // Arrange
            const {
              instance: generatorArbitrary,
              generate: generateA,
              shrink: shrinkA,
              canShrinkWithoutContext: canShrinkWithoutContextA,
            } = fakeNextArbitrary();
            const {
              instance: shrinkerArbitrary,
              generate: generateB,
              shrink: shrinkB,
              canShrinkWithoutContext: canShrinkWithoutContextB,
            } = fakeNextArbitrary();
            shrinkB.mockReturnValueOnce(
              Stream.of(new NextValue(vAA, cAA), new NextValue(vAB, cAB), new NextValue(vAC, cAC))
            );
            shrinkB.mockReturnValueOnce(Stream.of(new NextValue(vABA, cABA)));

            // Act
            const arb = new WithShrinkFromOtherArbitrary(generatorArbitrary, shrinkerArbitrary);
            const g2 = [...arb.shrink(vA, undefined)][1];
            const shrinks = [...arb.shrink(g2.value, g2.context)];

            // Assert
            expect(shrinks).toHaveLength(1);
            expect(shrinks[0].value).toBe(vABA);
            expect(generateA).not.toHaveBeenCalled();
            expect(shrinkA).not.toHaveBeenCalled();
            expect(canShrinkWithoutContextA).not.toHaveBeenCalled();
            expect(generateB).not.toHaveBeenCalled();
            expect(shrinkB).toHaveBeenCalledWith(vA, undefined);
            expect(shrinkB).toHaveBeenCalledWith(vAB, cAB);
            expect(canShrinkWithoutContextB).not.toHaveBeenCalled();
          }
        )
      );
    });
  });
});
