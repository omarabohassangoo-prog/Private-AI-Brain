/**
 * Hyper-Brain vReal 6.0 - Model Exporter & Importer
 * Exports RealBrainWeights to PyTorch state_dict and TensorFlow.js compatible format
 */

import { RealBrainWeights } from "./realNeuralEngine";

export class ModelExporter {
  /**
   * Export to PyTorch state_dict JSON format
   */
  static exportToPyTorch(weights: RealBrainWeights): string {
    const pytorchStateDict: { [tensorName: string]: any } = {};

    for (const [layerName, layer] of Object.entries(weights.layers)) {
      // PyTorch expects weights in shape [outputDim, inputDim] for Linear layers
      const [inDim, outDim] = layer.shape;
      const weightMatrix: number[][] = [];

      for (let o = 0; o < outDim; o++) {
        const row: number[] = [];
        for (let i = 0; i < inDim; i++) {
          row.push(layer.weights[i * outDim + o]);
        }
        weightMatrix.push(row);
      }

      pytorchStateDict[`${layerName}.weight`] = {
        data: weightMatrix,
        shape: [outDim, inDim],
        dtype: "torch.float32",
      };

      pytorchStateDict[`${layerName}.bias`] = {
        data: Array.from(layer.biases),
        shape: [outDim],
        dtype: "torch.float32",
      };
    }

    const payload = {
      format: "PyTorch StateDict (vReal 6.0)",
      framework: "PyTorch 2.x",
      architecture: "3-Layer FeedForward Classifier",
      state_dict: pytorchStateDict,
      metadata: weights.metadata,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export to TensorFlow.js Model Artifacts Format
   */
  static exportToTensorFlow(weights: RealBrainWeights): string {
    const tfjsLayers: any[] = [];
    const weightsManifest: any[] = [];

    for (const [layerName, layer] of Object.entries(weights.layers)) {
      tfjsLayers.push({
        name: layerName,
        class_name: "Dense",
        config: {
          units: layer.shape[1],
          activation: layer.activation,
          use_bias: true,
        },
      });

      weightsManifest.push({
        name: `${layerName}/kernel`,
        shape: layer.shape,
        dtype: "float32",
        values: Array.from(layer.weights),
      });

      weightsManifest.push({
        name: `${layerName}/bias`,
        shape: [layer.shape[1]],
        dtype: "float32",
        values: Array.from(layer.biases),
      });
    }

    const payload = {
      modelTopology: {
        class_name: "Sequential",
        config: {
          name: "HyperBrain_vReal_6.0",
          layers: tfjsLayers,
        },
      },
      weightsManifest: [
        {
          paths: ["weights.bin"],
          weights: weightsManifest,
        },
      ],
      metadata: weights.metadata,
    };

    return JSON.stringify(payload, null, 2);
  }
}
