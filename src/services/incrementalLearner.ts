/**
 * Hyper-Brain vReal 6.0 - Incremental Learning & Adaptive Systems Engine
 * Real weight accumulation, continuous synaptic pruning, and dynamic architecture adaptation
 */

import { RealBrainWeights, RealNeuralNetwork } from "./realNeuralEngine";

export class IncrementalLearner {
  /**
   * Fuse & accumulate new trained session weights into existing persistent brain weights
   */
  static accumulateKnowledge(
    existing: RealBrainWeights,
    incoming: RealBrainWeights,
    blendFactor: number = 0.25
  ): RealBrainWeights {
    const fusedLayers: { [layerName: string]: any } = {};

    for (const [layerName, eLayer] of Object.entries(existing.layers)) {
      const iLayer = incoming.layers[layerName];
      if (!iLayer) {
        fusedLayers[layerName] = eLayer;
        continue;
      }

      const fusedW = new Float32Array(eLayer.weights.length);
      for (let i = 0; i < fusedW.length; i++) {
        fusedW[i] = (1 - blendFactor) * eLayer.weights[i] + blendFactor * iLayer.weights[i];
      }

      const fusedB = new Float32Array(eLayer.biases.length);
      for (let j = 0; j < fusedB.length; j++) {
        fusedB[j] = (1 - blendFactor) * eLayer.biases[j] + blendFactor * iLayer.biases[j];
      }

      fusedLayers[layerName] = {
        ...eLayer,
        weights: fusedW,
        biases: fusedB,
      };
    }

    const newLossHistory = [
      ...(existing.metadata.loss_history || []),
      ...(incoming.metadata.loss_history || []),
    ].slice(-50);

    return {
      session_id: existing.session_id,
      version: "vReal-6.0",
      timestamp: new Date().toISOString(),
      layers: fusedLayers,
      optimizer_state: {
        ...existing.optimizer_state,
        step: (existing.optimizer_state.step || 1) + (incoming.optimizer_state.step || 1),
      },
      metadata: {
        ...existing.metadata,
        training_steps: (existing.metadata.training_steps || 0) + 1,
        loss_history: newLossHistory,
      },
    };
  }

  /**
   * Synaptic Pruning: Removes near-zero redundant weights below absolute threshold
   */
  static pruneSynapses(network: RealNeuralNetwork, threshold: number = 1e-4): number {
    let prunedCount = 0;
    for (const layer of network.layers) {
      for (let i = 0; i < layer.weights.length; i++) {
        if (Math.abs(layer.weights[i]) < threshold) {
          layer.weights[i] = 0;
          prunedCount++;
        }
      }
    }
    return prunedCount;
  }
}

export class AdaptiveSystem {
  /**
   * Dynamically adjust learning rate based on loss trajectory
   */
  static adjustLearningRate(currentLr: number, lossHistory: number[]): number {
    if (lossHistory.length < 3) return currentLr;

    const recent = lossHistory.slice(-3);
    const avgPrev = (recent[0] + recent[1]) / 2;
    const currentLoss = recent[2];

    // If loss is increasing, reduce learning rate to stabilize
    if (currentLoss > avgPrev * 1.05) {
      return Math.max(0.0001, currentLr * 0.85);
    }
    // If loss is decreasing smoothly, slightly boost learning rate
    if (currentLoss < avgPrev * 0.95) {
      return Math.min(0.05, currentLr * 1.05);
    }

    return currentLr;
  }
}
