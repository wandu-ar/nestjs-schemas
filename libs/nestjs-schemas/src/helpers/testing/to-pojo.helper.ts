/**
 * Transform anything to POJO (plain old javacript object)
 * Is a JSON object with primitive types
 */
export function toPOJO(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}
