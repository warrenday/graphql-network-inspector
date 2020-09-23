declare module "mergeby" {
  export default function mergeby<T extends {}>(
    arr1: T[],
    arr2: Partial<T>[] | Partial<T>,
    key: string,
    mergeDeep?: boolean
  ): T[];
}
