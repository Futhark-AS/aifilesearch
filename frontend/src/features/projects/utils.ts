import { HighlightBoundingBox } from "@/components/PdfViewer/types";
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

export function highlightBoundingBox(
  bb: HighlightBoundingBox,
  ctx: CanvasRenderingContext2D
) {
  const { x, y, width, height } = bb;

  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "yellow";

  ctx.fillRect(x, y, width, height);

  ctx.restore();

  // ctx.fillRect(140, 140, 30, 30);
}

export function encodePdfName(fileName: string) {
  // remove pdf extension
  const res = fileName.slice(0, fileName.lastIndexOf("."));
  return encodeURIComponent(res);
}

export function decodePdfName(fileName: string) {
  // add pdf extenstion
  const res = fileName + ".pdf";
  return decodeURIComponent(res);
}