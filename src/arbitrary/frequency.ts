import { Arbitrary } from '../check/arbitrary/definition/Arbitrary';
import { FrequencyArbitrary } from './_internals/FrequencyArbitrary';

/**
 * Conjonction of a weight and an arbitrary used by {@link frequency}
 * in order to generate values
 *
 * @remarks Since 1.18.0
 * @public
 */
export interface WeightedArbitrary<T> {
  /**
   * Weight to be applied when selecting which arbitrary should be used
   * @remarks Since 0.0.7
   */
  weight: number;
  /**
   * Instance of Arbitrary
   * @remarks Since 0.0.7
   */
  arbitrary: Arbitrary<T>;
}

/**
 * Infer the type of the Arbitrary produced by {@link frequency}
 * given the type of the source arbitraries
 *
 * @remarks Since 2.2.0
 * @public
 */
export type FrequencyValue<Ts extends WeightedArbitrary<unknown>[]> = {
  [K in keyof Ts]: Ts[K] extends WeightedArbitrary<infer U> ? U : never;
}[number];

/**
 * Constraints to be applied on {@link frequency}
 * @remarks Since 2.14.0
 * @public
 */
export type FrequencyContraints = {
  /**
   * When set to true, the shrinker of frequency will try to check if the first arbitrary
   * could have been used to discover an issue. It allows to shrink trees.
   *
   * Warning: First arbitrary must be the one resulting in the smallest structures
   * for usages in deep tree-like structures.
   *
   * Warning: First arbitrary will not be used if its weight is set to zero.
   *
   * @remarks Since 2.14.0
   */
  withCrossShrink?: boolean;
  /**
   * While going deeper and deeper within a recursive structure (see {@link letrec}),
   * this factor will be used to increase the probability to generate instances
   * of the first passed arbitrary.
   *
   * Example of values: 0.1 (small impact as depth increases), 0.5, 1 (huge impact as depth increases).
   *
   * Warning: First arbitrary will not be used if its weight is set to zero.
   *
   * @remarks Since 2.14.0
   */
  depthFactor?: number;
  /**
   * Maximal authorized depth.
   * Once this depth has been reached only the first arbitrary will be used.
   *
   * Warning: Contrary to others, first arbitrary will be used even if its weight is set to zero.
   *
   * @remarks Since 2.14.0
   */
  maxDepth?: number;
  /**
   * Depth identifier can be used to share the current depth between several instances.
   *
   * By default, if not specified, each instance of frequency will have its own depth.
   * In other words: you can have depth=1 in one while you have depth=100 in another one.
   *
   * @remarks Since 2.14.0
   */
  depthIdentifier?: string;
};

/** @internal */
function isFrequencyContraints(
  param: FrequencyContraints | WeightedArbitrary<unknown> | undefined
): param is FrequencyContraints {
  return param != null && typeof param === 'object' && !('arbitrary' in param);
}

/**
 * For one of the values generated by `...warbs` - the probability of selecting the ith warb is of `warb[i].weight / sum(warb[j].weight)`
 *
 * **WARNING**: It expects at least one (Arbitrary, weight)
 *
 * @param warbs - (Arbitrary, weight)s that might be called to produce a value
 *
 * @remarks Since 0.0.7
 * @public
 */
function frequency<Ts extends WeightedArbitrary<unknown>[]>(...warbs: Ts): Arbitrary<FrequencyValue<Ts>>;
/**
 * For one of the values generated by `...warbs` - the probability of selecting the ith warb is of `warb[i].weight / sum(warb[j].weight)`
 *
 * **WARNING**: It expects at least one (Arbitrary, weight)
 *
 * @param constraints - Constraints to be applied when generating the values
 * @param warbs - (Arbitrary, weight)s that might be called to produce a value
 *
 * @remarks Since 0.0.7
 * @public
 */
function frequency<Ts extends WeightedArbitrary<unknown>[]>(
  constraints: FrequencyContraints,
  ...warbs: Ts
): Arbitrary<FrequencyValue<Ts>>;
function frequency<Ts extends WeightedArbitrary<unknown>[]>(
  ...args: [...Ts] | [FrequencyContraints, ...Ts]
): Arbitrary<FrequencyValue<Ts>> {
  // TODO With TypeScript 4.0 it will be possible to properly define typings for `frequency(...arbs, constraints)`
  const label = 'fc.frequency';
  const constraints = args[0];
  if (isFrequencyContraints(constraints)) {
    return FrequencyArbitrary.from(args.slice(1) as WeightedArbitrary<FrequencyValue<Ts>>[], constraints, label);
  }

  return FrequencyArbitrary.from(args as WeightedArbitrary<FrequencyValue<Ts>>[], {}, label);
}
export { frequency };