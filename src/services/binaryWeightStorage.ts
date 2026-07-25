/**
 * Hyper-Brain vReal 6.0 - High-Capacity IndexedDB Binary Weight Storage
 * Stores real neural network weights directly as Float32Array binary buffers
 */

import { RealBrainWeights, RealLayerWeights } from "./realNeuralEngine";

const DB_NAME = "HyperBrainBinaryWeightsDB";
const STORE_NAME = "real_weights_store";
const DB_VERSION = 1;

export class BinaryWeightStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "session_id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Save RealBrainWeights into IndexedDB as binary ArrayBuffers
   */
  static async saveWeights(sessionId: string, weights: RealBrainWeights): Promise<void> {
    try {
      const db = await this.getDB();
      const serializedLayers: { [key: string]: any } = {};

      for (const [layerName, layer] of Object.entries(weights.layers)) {
        serializedLayers[layerName] = {
          name: layer.name,
          shape: layer.shape,
          activation: layer.activation,
          weightsBuffer: layer.weights.buffer,
          biasesBuffer: layer.biases.buffer,
          m_wBuffer: layer.m_w ? layer.m_w.buffer : null,
          v_wBuffer: layer.v_w ? layer.v_w.buffer : null,
          m_bBuffer: layer.m_b ? layer.m_b.buffer : null,
          v_bBuffer: layer.v_b ? layer.v_b.buffer : null,
        };
      }

      const record = {
        session_id: sessionId,
        version: weights.version,
        timestamp: weights.timestamp,
        layers: serializedLayers,
        optimizer_state: weights.optimizer_state,
        metadata: weights.metadata,
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("BinaryWeightStorage save error:", err);
    }
  }

  /**
   * Load RealBrainWeights from IndexedDB and reconstruct Float32Array instances
   */
  static async loadWeights(sessionId: string): Promise<RealBrainWeights | null> {
    try {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(sessionId);

        req.onsuccess = () => {
          const record = req.result;
          if (!record) return resolve(null);

          const layers: { [key: string]: RealLayerWeights } = {};
          for (const [layerName, lData] of Object.entries<any>(record.layers)) {
            layers[layerName] = {
              name: lData.name,
              shape: lData.shape,
              activation: lData.activation,
              weights: new Float32Array(lData.weightsBuffer),
              biases: new Float32Array(lData.biasesBuffer),
              m_w: lData.m_wBuffer ? new Float32Array(lData.m_wBuffer) : undefined,
              v_w: lData.v_wBuffer ? new Float32Array(lData.v_wBuffer) : undefined,
              m_b: lData.m_bBuffer ? new Float32Array(lData.m_bBuffer) : undefined,
              v_b: lData.v_bBuffer ? new Float32Array(lData.v_bBuffer) : undefined,
            };
          }

          resolve({
            session_id: record.session_id,
            version: record.version,
            timestamp: record.timestamp,
            layers,
            optimizer_state: record.optimizer_state,
            metadata: record.metadata,
          });
        };

        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("BinaryWeightStorage load error:", err);
      return null;
    }
  }

  /**
   * Export all weights as a downloadable binary JSON file with Base64 Float32Array encoding
   */
  static exportWeightsToJSON(weights: RealBrainWeights): string {
    const jsonFriendly: any = {
      session_id: weights.session_id,
      version: weights.version,
      timestamp: weights.timestamp,
      optimizer_state: weights.optimizer_state,
      metadata: weights.metadata,
      layers: {},
    };

    for (const [layerName, layer] of Object.entries(weights.layers)) {
      jsonFriendly.layers[layerName] = {
        name: layer.name,
        shape: layer.shape,
        activation: layer.activation,
        weights: Array.from(layer.weights),
        biases: Array.from(layer.biases),
      };
    }

    return JSON.stringify(jsonFriendly, null, 2);
  }

  /**
   * Import RealBrainWeights from JSON
   */
  static importWeightsFromJSON(jsonString: string): RealBrainWeights {
    const raw = JSON.parse(jsonString);
    const layers: { [key: string]: RealLayerWeights } = {};

    for (const [layerName, lData] of Object.entries<any>(raw.layers || {})) {
      layers[layerName] = {
        name: lData.name,
        shape: lData.shape,
        activation: lData.activation,
        weights: new Float32Array(lData.weights),
        biases: new Float32Array(lData.biases),
      };
    }

    return {
      session_id: raw.session_id || `session_${Date.now()}`,
      version: raw.version || "vReal-6.0",
      timestamp: raw.timestamp || new Date().toISOString(),
      layers,
      optimizer_state: raw.optimizer_state || {
        type: "adam",
        learning_rate: 0.01,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8,
        step: 1,
      },
      metadata: raw.metadata || {
        training_steps: 1,
        loss_history: [],
        accuracy_history: [],
        embedding_dim: 32,
        total_parameters: 0,
      },
    };
  }

  /**
   * Clear all IndexedDB stores
   */
  static async clearAllBinaryWeights(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error("BinaryWeightStorage clear error:", err);
    }
  }
}
