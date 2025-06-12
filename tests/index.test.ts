import { sum } from '../src/sum';

describe('Sum', () => {
    it('should give a result of summing two numbers', () => {
        const result = sum(1, 2);

        expect(result).toBe(3);
    });
});
