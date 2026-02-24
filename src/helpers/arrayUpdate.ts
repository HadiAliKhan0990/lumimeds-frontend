/**
 * Generic helper function to update an object in an array by its id
 * Merges the update object with the existing object, preserving values not present in the update
 *
 * @template T - The type of objects in the array (must have an 'id' property)
 * @param {T[]} array - The array of objects to search and update
 * @param {Partial<T> & { id: string | number }} updateObject - The object containing id and fields to update
 * @returns {T[]} A new array with the updated object, or the original array if no match found
 *
 * @example
 * const users = [{ id: 1, name: 'John', age: 30 }, { id: 2, name: 'Jane', age: 25 }];
 * const updated = updateArrayObjectById(users, { id: 1, name: 'John Doe' });
 * // Result: [{ id: 1, name: 'John Doe', age: 30 }, { id: 2, name: 'Jane', age: 25 }]
 */
export function updateArrayObjectById<T extends { id: string | number }>(
  array: T[],
  updateObject: Partial<T> & { id: string | number }
): T[] {
  // Edge case: null or undefined array
  if (!array || !Array.isArray(array)) {
    console.warn('[updateArrayObjectById] Invalid array provided, returning empty array');
    return [];
  }

  // Edge case: empty array
  if (array.length === 0) {
    return array;
  }

  // Edge case: null or undefined update object
  if (!updateObject || typeof updateObject !== 'object') {
    console.warn('[updateArrayObjectById] Invalid update object provided, returning original array');
    return array;
  }

  // Edge case: missing or invalid id
  if (updateObject.id === undefined || updateObject.id === null) {
    console.warn('[updateArrayObjectById] Update object missing valid id, returning original array');
    return array;
  }

  try {
    // Single-pass O(n) operation using map - faster than findIndex + slice
    let found = false;
    const newArray = array.map((item) => {
      // Safety check for each item
      if (!item || typeof item !== 'object') {
        return item;
      }

      // Check if this is the item to update
      if (item.id === updateObject.id) {
        found = true;
        // Merge existing values with update values
        // Properties in updateObject will override properties in item
        // Properties not in updateObject will be preserved from item
        return {
          ...item,
          ...updateObject,
        } as T;
      }

      // Return unchanged item
      return item;
    });

    // Edge case: id not found in array
    if (!found) {
      console.warn(`[updateArrayObjectById] No object found with id: ${updateObject.id}`);
      return array;
    }

    return newArray;
  } catch (error) {
    // Catch any unexpected errors to prevent app crashes
    console.error('[updateArrayObjectById] Unexpected error during update:', error);
    return array;
  }
}

/**
 * Generic helper function to update multiple objects in an array by their ids
 * Merges each update object with its corresponding existing object
 *
 * @template T - The type of objects in the array (must have an 'id' property)
 * @param {T[]} array - The array of objects to search and update
 * @param {Array<Partial<T> & { id: string | number }>} updateObjects - Array of objects containing ids and fields to update
 * @returns {T[]} A new array with all updated objects
 *
 * @example
 * const users = [{ id: 1, name: 'John', age: 30 }, { id: 2, name: 'Jane', age: 25 }];
 * const updated = updateArrayObjectsById(users, [
 *   { id: 1, name: 'John Doe' },
 *   { id: 2, age: 26 }
 * ]);
 * // Result: [{ id: 1, name: 'John Doe', age: 30 }, { id: 2, name: 'Jane', age: 26 }]
 */
export function updateArrayObjectsById<T extends { id: string | number }>(
  array: T[],
  updateObjects: Array<Partial<T> & { id: string | number }>
): T[] {
  // Edge case: null or undefined array
  if (!array || !Array.isArray(array)) {
    console.warn('[updateArrayObjectsById] Invalid array provided, returning empty array');
    return [];
  }

  // Edge case: empty array
  if (array.length === 0) {
    return array;
  }

  // Edge case: null or undefined update objects
  if (!updateObjects || !Array.isArray(updateObjects)) {
    console.warn('[updateArrayObjectsById] Invalid update objects provided, returning original array');
    return array;
  }

  // Edge case: empty update objects array
  if (updateObjects.length === 0) {
    return array;
  }

  try {
    // Create a map of id to update object for O(1) lookup
    const updateMap = new Map<string | number, Partial<T> & { id: string | number }>();

    updateObjects.forEach((obj) => {
      if (obj && typeof obj === 'object' && obj.id !== undefined && obj.id !== null) {
        updateMap.set(obj.id, obj);
      }
    });

    // Map over the array and update objects where applicable
    const newArray = array.map((item) => {
      // Safety check for each item
      if (!item || typeof item !== 'object') {
        return item;
      }

      const updateObject = updateMap.get(item.id);

      // If no update found for this id, return the original item
      if (!updateObject) {
        return item;
      }

      // Merge the existing object with the update object
      return {
        ...item,
        ...updateObject,
      } as T;
    });

    return newArray;
  } catch (error) {
    // Catch any unexpected errors to prevent app crashes
    console.error('[updateArrayObjectsById] Unexpected error during update:', error);
    return array;
  }
}

/**
 * Deep merge helper function for nested objects
 * Recursively merges source into target, preserving values not in source
 *
 * @template T - The type of the objects being merged
 * @param {T} target - The target object (existing values)
 * @param {Partial<T>} source - The source object (new values)
 * @returns {T} A new object with merged values
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  // Handle null/undefined cases
  if (!target || typeof target !== 'object') {
    return source as T;
  }
  if (!source || typeof source !== 'object') {
    return target;
  }

  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      // Recursively merge nested objects
      (result as Record<string, unknown>)[key] = deepMerge((targetValue || {}) as Record<string, unknown>, sourceValue);
    } else {
      // Directly assign primitive values, arrays, or null
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  });

  return result;
}

/**
 * Generic helper function to update an object in an array by its id with deep merge
 * Deep merges the update object with the existing object, useful for nested structures
 *
 * @template T - The type of objects in the array (must have an 'id' property)
 * @param {T[]} array - The array of objects to search and update
 * @param {Partial<T> & { id: string | number }} updateObject - The object containing id and fields to update
 * @returns {T[]} A new array with the deeply merged object
 */
export function updateArrayObjectByIdDeep<T extends { id: string | number }>(
  array: T[],
  updateObject: Partial<T> & { id: string | number }
): T[] {
  // Reuse the validation logic from the shallow version
  if (!array || !Array.isArray(array)) {
    console.warn('[updateArrayObjectByIdDeep] Invalid array provided, returning empty array');
    return [];
  }

  if (array.length === 0) {
    return array;
  }

  if (!updateObject || typeof updateObject !== 'object') {
    console.warn('[updateArrayObjectByIdDeep] Invalid update object provided, returning original array');
    return array;
  }

  if (updateObject.id === undefined || updateObject.id === null) {
    console.warn('[updateArrayObjectByIdDeep] Update object missing valid id, returning original array');
    return array;
  }

  try {
    // Single-pass O(n) operation using map - faster than findIndex + slice
    let found = false;
    const newArray = array.map((item) => {
      if (!item || typeof item !== 'object') {
        return item;
      }

      if (item.id === updateObject.id) {
        found = true;
        // Use deep merge instead of shallow merge
        return deepMerge(item, updateObject);
      }

      return item;
    });

    if (!found) {
      console.warn(`[updateArrayObjectByIdDeep] No object found with id: ${updateObject.id}`);
      return array;
    }

    return newArray;
  } catch (error) {
    console.error('[updateArrayObjectByIdDeep] Unexpected error during update:', error);
    return array;
  }
}
