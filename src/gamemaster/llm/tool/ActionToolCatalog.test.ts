import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { ActionToolCatalog } from './ActionToolCatalog';
import { Action, Verdict, defineActionOutcome } from '../../../engine/action';
import { ZodSchema } from '../../../utils/schema';

describe(ActionToolCatalog.name, () => {
    const MoveLikeInputSchema = z.object({ direction: z.string() });
    const MoveLikeSuccessSchema = z.object({ roomId: z.string() });
    const MoveLikeFailSchema = z.enum(['no_exit']);
    const MoveLikeOutcomeSchema = defineActionOutcome(MoveLikeSuccessSchema, MoveLikeFailSchema);

    type MoveLikeInput = z.infer<typeof MoveLikeInputSchema>;
    type MoveLikeOutcome = z.infer<typeof MoveLikeOutcomeSchema>;

    const moveLikeAction: Action<MoveLikeInput, MoveLikeOutcome> = {
        name: 'move',
        schema: new ZodSchema(MoveLikeInputSchema),
        outcomeSchema: MoveLikeOutcomeSchema,
        execute: () => Verdict.succeed({ roomId: 'room_1' }),
    };

    const VoidLikeOutcomeSchema = defineActionOutcome(z.object({}), z.enum(['nope']));
    type VoidLikeOutcome = z.infer<typeof VoidLikeOutcomeSchema>;

    const checkInventoryLikeAction: Action<void, VoidLikeOutcome> = {
        name: 'checkInventory',
        schema: new ZodSchema(z.void()),
        outcomeSchema: VoidLikeOutcomeSchema,
        execute: () => Verdict.succeed({}),
    };

    describe('listDefinitions', () => {
        it('should list a ToolDefinition for each registered entry', () => {
            const catalog = new ActionToolCatalog({
                move: { action: moveLikeAction, description: 'Move the player.' },
            });

            const definitions = catalog.listDefinitions();

            expect(definitions).to.have.length(1);
            expect(definitions[0].name).to.equal('move');
            expect(definitions[0].description).to.equal('Move the player.');
        });

        it('should convert the action input schema to JSON Schema', () => {
            const catalog = new ActionToolCatalog({
                move: { action: moveLikeAction, description: 'Move the player.' },
            });

            const [definition] = catalog.listDefinitions();

            expect(definition.inputSchema.type).to.equal('object');
            expect(definition.inputSchema.properties).to.have.property('direction');
        });

        it('should represent a void input schema as an empty object schema', () => {
            const catalog = new ActionToolCatalog({
                checkInventory: { action: checkInventoryLikeAction, description: 'Check inventory.' },
            });

            const [definition] = catalog.listDefinitions();

            expect(definition.inputSchema).to.deep.equal({ type: 'object', properties: {} });
        });

        it('should return an empty list when no entries are registered', () => {
            const catalog = new ActionToolCatalog({});

            expect(catalog.listDefinitions()).to.deep.equal([]);
        });
    });

    describe('find', () => {
        it('should return the entry registered under the given name', () => {
            const entry = { action: moveLikeAction, description: 'Move the player.' };
            const catalog = new ActionToolCatalog({ move: entry });

            expect(catalog.find('move')).to.equal(entry);
        });

        it('should return undefined for an unregistered name', () => {
            const catalog = new ActionToolCatalog({});

            expect(catalog.find('unknown')).to.equal(undefined);
        });
    });
});
