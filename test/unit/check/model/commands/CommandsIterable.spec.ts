import * as assert from 'assert';
import * as fc from '../../../../../lib/fast-check';

import { CommandWrapper } from '../../../../../src/check/model/commands/CommandWrapper';
import { CommandsIterable } from '../../../../../src/check/model/commands/CommandsIterable';
import { Command } from '../../../../../src/check/model/command/Command';
import { cloneMethod } from '../../../../../src/check/symbols';

type Model = {};
type Real = {};

const buildAlreadyRanCommands = (runFlags: boolean[]) => {
  return runFlags.map((hasRun, idx) => {
    const cmd = new class implements Command<Model, Real> {
      check = (m: Readonly<Model>) => true;
      run = (m: Model, r: Real) => {};
      toString = () => String(idx);
    }();
    const wrapper = new CommandWrapper(cmd);
    if (hasRun) {
      wrapper.run({}, {});
    }
    return wrapper;
  });
};

describe('CommandsIterable', () => {
  it('Should not reset hasRun flag on iteration', () =>
    fc.assert(
      fc.property(fc.array(fc.boolean()), runFlags => {
        const commands = [...new CommandsIterable(buildAlreadyRanCommands(runFlags))];
        for (let idx = 0; idx !== runFlags.length; ++idx) {
          assert.equal(commands[idx].hasRan, runFlags[idx]);
        }
      })
    ));
  it('Should not reset hasRun flag on the original iterable on clone', () =>
    fc.assert(
      fc.property(fc.array(fc.boolean()), runFlags => {
        const originalIterable = new CommandsIterable(buildAlreadyRanCommands(runFlags));
        originalIterable[cloneMethod]();
        const commands = [...originalIterable];
        for (let idx = 0; idx !== runFlags.length; ++idx) {
          assert.equal(commands[idx].hasRan, runFlags[idx]);
        }
      })
    ));
  it('Should reset hasRun flag for the clone on clone', () =>
    fc.assert(
      fc.property(fc.array(fc.boolean()), runFlags => {
        const commands = [...new CommandsIterable(buildAlreadyRanCommands(runFlags))[cloneMethod]()];
        for (let idx = 0; idx !== runFlags.length; ++idx) {
          assert.ok(!commands[idx].hasRan);
        }
      })
    ));
  it('Should only print ran commands', () =>
    fc.assert(
      fc.property(fc.array(fc.boolean()), runFlags => {
        const commandsIterable = new CommandsIterable(buildAlreadyRanCommands(runFlags));
        const expectedToString = runFlags
          .map((hasRan, idx) => (hasRan ? String(idx) : ''))
          .filter(s => s !== '')
          .join(',');
        assert.equal(commandsIterable.toString(), expectedToString);
      })
    ));
});
