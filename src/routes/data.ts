export let value = 0;

export default function update(val: number): number {
  return (value = val);
}
