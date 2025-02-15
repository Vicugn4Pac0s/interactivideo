import { zeroPadding } from ".";

let count = 0;

export const createDefaultId = (baseName = 'default') => {
  const id = `${baseName}-${zeroPadding(count, 3)}`  
  count++;
  return id;
};