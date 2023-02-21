import { Primitive, ZodLiteral, z } from "zod";

export const extractFileName = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1);

/**
 * Run a callback function every X milliseconds for Y times
 * @param callback
 * @param delay in milliseconds
 * @param repetitions
 * @param onAllDone if all repetitions are done without clearing interval, this callback will be called after the last execution of the callback
 * @returns a function to clear the interval
 */
export function setIntervalX(
  callback: () => void,
  delay: number,
  repetitions: number,
  onAllDone?: () => void
) {
  let x = 0;
  const intervalID = window.setInterval(function () {
    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
      onAllDone && onAllDone();
    }
  }, delay);
  return () => window.clearInterval(intervalID);
}


// helper for creating zod unions out of lists
export type MappedZodLiterals<T extends readonly Primitive[]> = {
  -readonly [K in keyof T]: ZodLiteral<T[K]>;
};

// helper for creating zod unions out of lists
export function createManyUnion<
  A extends Readonly<[Primitive, Primitive, ...Primitive[]]>
>(literals: A) {
  return z.union(
    literals.map((value) => z.literal(value)) as MappedZodLiterals<A>
  );
}