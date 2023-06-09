import { deserialize as deserialize_ } from './utils/deserialize.js'
import { serialize as serialize_ } from './utils/serialize.js'

// key-values for loose autocomplete and typing
/**
 * @typedef {Object} StorageItemMap
 * @property {import('@tanstack/query-persist-client-core').PersistedClient} cache
 * @property {string} recentConnectorId
 * @property {import('./config.js').PartializedState} state
 */

/**
 * @template {Record<string, unknown>} [itemMap={}]
 * @template {StorageItemMap} [storageItemMap=StorageItemMap & itemMap]
 *
 * @typedef {Object} Storage
 * @property {<key extends keyof storageItemMap, value extends storageItemMap[key], defaultValue extends value | null>(key: key, defaultValue?: defaultValue) => defaultValue extends null ? value | null : value} getItem
 * @property {<key extends keyof storageItemMap, value extends storageItemMap[key] | null>(key: key, value: value) => void} setItem
 * @property {(key: keyof storageItemMap) => void} removeItem
 */

/**
 * @typedef {Object} BaseStorage
 * @property {(key: string) => string | null} getItem
 * @property {(key: string, value: string) => void} setItem
 * @property {(key: string) => void} removeItem
 */

/**
 * @template {Record<string, unknown>} [itemMap={}]
 * @template {StorageItemMap} [storageItemMap=StorageItemMap & itemMap]
 *
 * @param {Object} options
 * @param {(<T>(value: string) => T)=} [options.deserialize]
 * @param {string=} [options.key]
 * @param {(<T>(value: T) => string)=} [options.serialize]
 * @param {BaseStorage} options.storage
 * @returns {Storage<storageItemMap>}
 */
export function createStorage({
  deserialize = deserialize_,
  key: prefix = 'wagmi',
  serialize = serialize_,
  storage,
}) {
  return {
    ...storage,
    getItem(key, defaultValue) {
      const value = storage.getItem(`${prefix}.${/** @type {string} */ (key)}`)
      try {
        if (value) return deserialize(value)
        return /** @type {any} */ (defaultValue ?? null)
      } catch (error) {
        console.warn(error)
        return defaultValue ?? null
      }
    },
    setItem(key, value) {
      const storageKey = `${prefix}.${/** @type {string} */ (key)}`
      if (value === null) {
        storage.removeItem(storageKey)
      } else {
        try {
          storage.setItem(storageKey, serialize(value))
        } catch (err) {
          console.error(err)
        }
      }
    },
    removeItem(key) {
      storage.removeItem(`${prefix}.${/** @type {string} */ (key)}`)
    },
  }
}

/** @type {BaseStorage} */
export const noopStorage = {
  getItem: (_key) => '',
  setItem: (_key, _value) => null,
  removeItem: (_key) => null,
}
