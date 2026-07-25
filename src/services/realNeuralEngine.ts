/**
 * Hyper-Brain vReal 6.0 - Real Neural Engine Core
 * Real Matrix Operations, Real Float32Array Tensors, Forward Pass & Backpropagation
 */

export interface RealLayerWeights {
  name: string;
  weights: Float32Array;
  biases: Float32Array;
  shape: [number, number]; // [inputDim, outputDim]
  activation: 'relu' | 'sigmoid' | 'softmax' | 'none';
  gradW?: Float32Array;
  gradB?: Float32Array;
  m_w?: Float32Array; // Adam momentum
  v_w?: Float32Array; // Adam variance
  m_b?: Float32Array;
  v_b?: Float32Array;
}

export interface RealBrainWeights {
  session_id: string;
  version: string;
  timestamp: string;
  layers: { [layerName: string]: RealLayerWeights };
  optimizer_state: {
    type: 'adam' | 'sgd';
    learning_rate: number;
    beta1: number;
    beta2: number;
    epsilon: number;
    step: number;
  };
  metadata: {
    training_steps: number;
    loss_history: number[];
    accuracy_history: number[];
    embedding_dim: number;
    total_parameters: number;
  };
}

export interface TrainingSample {
  text: string;
  targetCategory?: number; // 0..N
  targetVector?: Float32Array;
}

export interface TrainingMetrics {
  loss: number;
  accuracy: number;
  step: number;
  gradNorm: number;
  executionTimeMs: number;
}

/**
 * 1. Matrix & Vector Operations Engine for Float32Array
 */
export class MatrixOperations {
  /**
   * Xavier / Glorot Initialization for Weight Matrices
   */
  static xavierInit(rows: number, cols: number): Float32Array {
    const scale = Math.sqrt(2.0 / (rows + cols));
    const out = new Float32Array(rows * cols);
    for (let i = 0; i < out.length; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random() || 1e-7;
      const u2 = Math.random() || 1e-7;
      const randNorm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      out[i] = randNorm * scale;
    }
    return out;
  }

  /**
   * Matrix Multiplication: C (1 x colsB) = A (1 x colsA) * B (rowsB x colsB)
   * where colsA == rowsB
   */
  static matmulVectorMatrix(v: Float32Array, M: Float32Array, rowsM: number, colsM: number): Float32Array {
    if (v.length !== rowsM) {
      throw new Error(`Matrix multiplication dimension mismatch: vector len ${v.length} vs matrix rows ${rowsM}`);
    }
    const out = new Float32Array(colsM);
    for (let j = 0; j < colsM; j++) {
      let sum = 0;
      for (let i = 0; i < rowsM; i++) {
        sum += v[i] * M[i * colsM + j];
      }
      out[j] = sum;
    }
    return out;
  }

  /**
   * Outer product of two vectors: A (N) x B (M) -> Matrix (N x M)
   */
  static outerProduct(a: Float32Array, b: Float32Array): Float32Array {
    const out = new Float32Array(a.length * b.length);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        out[i * b.length + j] = a[i] * b[j];
      }
    }
    return out;
  }

  /**
   * Element-wise Addition
   */
  static add(a: Float32Array, b: Float32Array): Float32Array {
    const out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      out[i] = a[i] + b[i];
    }
    return out;
  }

  /**
   * Element-wise Subtraction
   */
  static subtract(a: Float32Array, b: Float32Array): Float32Array {
    const out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) {
      out[i] = a[i] - b[i];
    }
    return out;
  }

  /**
   * ReLU Activation & Derivative
   */
  static relu(x: Float32Array): Float32Array {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      out[i] = Math.max(0, x[i]);
    }
    return out;
  }

  static reluDerivative(x: Float32Array): Float32Array {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      out[i] = x[i] > 0 ? 1 : 0;
    }
    return out;
  }

  /**
   * Sigmoid Activation & Derivative
   */
  static sigmoid(x: Float32Array): Float32Array {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      out[i] = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x[i]))));
    }
    return out;
  }

  static sigmoidDerivative(activated: Float32Array): Float32Array {
    const out = new Float32Array(activated.length);
    for (let i = 0; i < activated.length; i++) {
      out[i] = activated[i] * (1 - activated[i]);
    }
    return out;
  }

  /**
   * Softmax Activation
   */
  static softmax(x: Float32Array): Float32Array {
    const out = new Float32Array(x.length);
    let max = -Infinity;
    for (let i = 0; i < x.length; i++) if (x[i] > max) max = x[i];
    
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
      out[i] = Math.exp(x[i] - max);
      sum += out[i];
    }
    const invSum = sum > 0 ? 1 / sum : 1;
    for (let i = 0; i < x.length; i++) {
      out[i] *= invSum;
    }
    return out;
  }

  /**
   * Mean Squared Error (MSE) Loss
   */
  static mseLoss(pred: Float32Array, target: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < pred.length; i++) {
      const diff = pred[i] - target[i];
      sum += diff * diff;
    }
    return sum / pred.length;
  }

  /**
   * Cross Entropy Loss
   */
  static crossEntropyLoss(pred: Float32Array, targetIndex: number): number {
    const eps = 1e-12;
    const p = Math.max(eps, Math.min(1 - eps, pred[targetIndex]));
    return -Math.log(p);
  }
}

/**
 * 2. Real Text Embedder - Converts text to continuous 32D / 64D Float32Array
 */
export class TextEmbedder {
  static EMBEDDING_DIM = 32;

  /**
   * Hash string to deterministic integer seed
   */
  private static hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  /**
   * Convert Arabic / Multilingual text into a dense 32D Float32Array embedding vector
   */
  static embed(text: string): Float32Array {
    const vec = new Float32Array(this.EMBEDDING_DIM);
    const cleaned = text.trim().toLowerCase().replace(/[^\w\u0600-\u06FF\s]/g, "");
    const words = cleaned.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return vec;
    }

    // 1. Character N-Gram & Word Hashing onto vector coordinates
    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const word = words[wIdx];
      const wordHash = this.hashString(word);
      const posWeight = 1.0 / (1.0 + 0.1 * wIdx);

      // Distribute word hash features across vector dimensions
      for (let dim = 0; dim < this.EMBEDDING_DIM; dim++) {
        const featureSeed = this.hashString(`${word}_${dim}`);
        const featureValue = Math.sin(featureSeed) * posWeight;
        vec[dim] += featureValue;
      }

      // Sub-char bi-grams for morphological Arabic features
      for (let c = 0; c < word.length - 1; c++) {
        const bigram = word.substring(c, c + 2);
        const bgHash = this.hashString(bigram);
        const targetDim = bgHash % this.EMBEDDING_DIM;
        vec[targetDim] += 0.25;
      }
    }

    // L2 Normalize
    let normSq = 0;
    for (let i = 0; i < vec.length; i++) normSq += vec[i] * vec[i];
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    }

    return vec;
  }
}

/**
 * 3. Dense Layer with Real Forward & Backward Propagation
 */
export class DenseLayer {
  name: string;
  weights: Float32Array; // shape: [inputDim, outputDim]
  biases: Float32Array;  // shape: [outputDim]
  inputDim: number;
  outputDim: number;
  activation: 'relu' | 'sigmoid' | 'softmax' | 'none';

  // Cache for Backprop
  lastInput: Float32Array | null = null;
  lastZ: Float32Array | null = null;
  lastA: Float32Array | null = null;

  // Adam Optimizer Caches
  m_w: Float32Array;
  v_w: Float32Array;
  m_b: Float32Array;
  v_b: Float32Array;

  constructor(
    name: string,
    inputDim: number,
    outputDim: number,
    activation: 'relu' | 'sigmoid' | 'softmax' | 'none' = 'relu',
    existingWeights?: Float32Array,
    existingBiases?: Float32Array
  ) {
    this.name = name;
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.activation = activation;

    this.weights = existingWeights || MatrixOperations.xavierInit(inputDim, outputDim);
    this.biases = existingBiases || new Float32Array(outputDim);

    this.m_w = new Float32Array(inputDim * outputDim);
    this.v_w = new Float32Array(inputDim * outputDim);
    this.m_b = new Float32Array(outputDim);
    this.v_b = new Float32Array(outputDim);
  }

  /**
   * Forward Pass: Z = X * W + B, A = activate(Z)
   */
  forward(input: Float32Array): Float32Array {
    this.lastInput = new Float32Array(input);
    const z = MatrixOperations.add(
      MatrixOperations.matmulVectorMatrix(input, this.weights, this.inputDim, this.outputDim),
      this.biases
    );
    this.lastZ = z;

    let a: Float32Array;
    if (this.activation === 'relu') {
      a = MatrixOperations.relu(z);
    } else if (this.activation === 'sigmoid') {
      a = MatrixOperations.sigmoid(z);
    } else if (this.activation === 'softmax') {
      a = MatrixOperations.softmax(z);
    } else {
      a = new Float32Array(z);
    }

    this.lastA = a;
    return a;
  }

  /**
   * Backward Pass: calculate gradients & propagate error to previous layer
   * dA = gradient coming from next layer
   * returns dX = gradient to pass to previous layer
   */
  backward(
    dA: Float32Array,
    lr: number = 0.01,
    step: number = 1,
    beta1: number = 0.9,
    beta2: number = 0.999,
    eps: number = 1e-8
  ): { dX: Float32Array; gradW: Float32Array; gradB: Float32Array } {
    if (!this.lastInput || !this.lastZ || !this.lastA) {
      throw new Error(`Cannot run backward pass on layer ${this.name} before forward pass.`);
    }

    // 1. Calculate dZ = dA * activation_derivative(Z)
    const dZ = new Float32Array(this.outputDim);
    if (this.activation === 'relu') {
      const dRelu = MatrixOperations.reluDerivative(this.lastZ);
      for (let i = 0; i < this.outputDim; i++) dZ[i] = dA[i] * dRelu[i];
    } else if (this.activation === 'sigmoid') {
      const dSig = MatrixOperations.sigmoidDerivative(this.lastA);
      for (let i = 0; i < this.outputDim; i++) dZ[i] = dA[i] * dSig[i];
    } else if (this.activation === 'softmax') {
      // Assuming Cross-Entropy loss where dA is already (pred - target)
      for (let i = 0; i < this.outputDim; i++) dZ[i] = dA[i];
    } else {
      for (let i = 0; i < this.outputDim; i++) dZ[i] = dA[i];
    }

    // 2. Calculate gradW = outerProduct(lastInput, dZ)
    const gradW = MatrixOperations.outerProduct(this.lastInput, dZ);

    // 3. Calculate gradB = dZ
    const gradB = new Float32Array(dZ);

    // 4. Calculate dX = dZ * W^T
    const dX = new Float32Array(this.inputDim);
    for (let i = 0; i < this.inputDim; i++) {
      let sum = 0;
      for (let j = 0; j < this.outputDim; j++) {
        sum += dZ[j] * this.weights[i * this.outputDim + j];
      }
      dX[i] = sum;
    }

    // 5. Update Weights with Adam Optimizer
    for (let i = 0; i < this.weights.length; i++) {
      const g = gradW[i];
      this.m_w[i] = beta1 * this.m_w[i] + (1 - beta1) * g;
      this.v_w[i] = beta2 * this.v_w[i] + (1 - beta2) * (g * g);

      const mHat = this.m_w[i] / (1 - Math.pow(beta1, step));
      const vHat = this.v_w[i] / (1 - Math.pow(beta2, step));

      this.weights[i] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
    }

    // 6. Update Biases with Adam Optimizer
    for (let j = 0; j < this.biases.length; j++) {
      const g = gradB[j];
      this.m_b[j] = beta1 * this.m_b[j] + (1 - beta1) * g;
      this.v_b[j] = beta2 * this.v_b[j] + (1 - beta2) * (g * g);

      const mHat = this.m_b[j] / (1 - Math.pow(beta1, step));
      const vHat = this.v_b[j] / (1 - Math.pow(beta2, step));

      this.biases[j] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
    }

    return { dX, gradW, gradB };
  }

  toData(): RealLayerWeights {
    return {
      name: this.name,
      weights: new Float32Array(this.weights),
      biases: new Float32Array(this.biases),
      shape: [this.inputDim, this.outputDim],
      activation: this.activation,
      m_w: new Float32Array(this.m_w),
      v_w: new Float32Array(this.v_w),
      m_b: new Float32Array(this.m_b),
      v_b: new Float32Array(this.v_b),
    };
  }
}

/**
 * 4. Real Neural Network Class (3-Layer Architecture)
 */
export class RealNeuralNetwork {
  layers: DenseLayer[];
  step: number = 1;
  learningRate: number = 0.01;
  lossHistory: number[] = [];
  accuracyHistory: number[] = [];

  constructor(existingWeights?: RealBrainWeights) {
    if (existingWeights && existingWeights.layers) {
      this.step = existingWeights.optimizer_state?.step || 1;
      this.learningRate = existingWeights.optimizer_state?.learning_rate || 0.01;
      this.lossHistory = existingWeights.metadata?.loss_history || [];
      this.accuracyHistory = existingWeights.metadata?.accuracy_history || [];

      this.layers = Object.values(existingWeights.layers).map(l => {
        const layer = new DenseLayer(
          l.name,
          l.shape[0],
          l.shape[1],
          l.activation,
          new Float32Array(l.weights),
          new Float32Array(l.biases)
        );
        if (l.m_w) layer.m_w = new Float32Array(l.m_w);
        if (l.v_w) layer.v_w = new Float32Array(l.v_w);
        if (l.m_b) layer.m_b = new Float32Array(l.m_b);
        if (l.v_b) layer.v_b = new Float32Array(l.v_b);
        return layer;
      });
    } else {
      // Default Architecture: Input (32D) -> Dense1 (64D) -> Dense2 (32D) -> Output (16D)
      this.layers = [
        new DenseLayer("layer_1_input_feature", 32, 64, "relu"),
        new DenseLayer("layer_2_cognitive_hidden", 64, 32, "relu"),
        new DenseLayer("layer_3_semantic_output", 32, 16, "softmax"),
      ];
    }
  }

  /**
   * Forward Pass through all layers
   */
  forward(input: Float32Array): {
    output: Float32Array;
    layerActivations: Array<{ name: string; activation: Float32Array }>;
  } {
    let current = input;
    const layerActivations: Array<{ name: string; activation: Float32Array }> = [];

    for (const layer of this.layers) {
      current = layer.forward(current);
      layerActivations.push({
        name: layer.name,
        activation: new Float32Array(current),
      });
    }

    return { output: current, layerActivations };
  }

  /**
   * Train Network on a single sample (Forward Pass -> Loss -> Backpropagation)
   */
  trainSample(input: Float32Array, targetCategoryIndex: number): TrainingMetrics {
    const startTime = performance.now();
    const { output } = this.forward(input);

    // Target One-Hot Vector
    const targetVector = new Float32Array(this.layers[this.layers.length - 1].outputDim);
    targetVector[targetCategoryIndex % targetVector.length] = 1.0;

    // Cross Entropy Loss & Output Gradient (pred - target)
    const loss = MatrixOperations.crossEntropyLoss(output, targetCategoryIndex % targetVector.length);
    const dOutput = MatrixOperations.subtract(output, targetVector);

    // Backpropagation from last layer to first
    let currentGrad = dOutput;
    let totalGradNorm = 0;

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const { dX, gradW } = this.layers[i].backward(currentGrad, this.learningRate, this.step);
      currentGrad = dX;

      // Accumulate gradient norm for monitoring
      for (let g = 0; g < gradW.length; g++) totalGradNorm += gradW[g] * gradW[g];
    }

    this.step++;
    this.lossHistory.push(loss);
    if (this.lossHistory.length > 50) this.lossHistory.shift();

    // Check Accuracy
    let maxArg = 0;
    let maxVal = -1;
    for (let k = 0; k < output.length; k++) {
      if (output[k] > maxVal) {
        maxVal = output[k];
        maxArg = k;
      }
    }
    const acc = maxArg === (targetCategoryIndex % targetVector.length) ? 1.0 : 0.0;
    this.accuracyHistory.push(acc);
    if (this.accuracyHistory.length > 50) this.accuracyHistory.shift();

    const executionTimeMs = performance.now() - startTime;

    return {
      loss,
      accuracy: acc,
      step: this.step,
      gradNorm: Math.sqrt(totalGradNorm),
      executionTimeMs,
    };
  }

  /**
   * Export network state to RealBrainWeights object
   */
  exportState(sessionId: string): RealBrainWeights {
    const layersData: { [key: string]: RealLayerWeights } = {};
    let totalParameters = 0;

    for (const layer of this.layers) {
      layersData[layer.name] = layer.toData();
      totalParameters += layer.weights.length + layer.biases.length;
    }

    return {
      session_id: sessionId,
      version: "vReal-6.0",
      timestamp: new Date().toISOString(),
      layers: layersData,
      optimizer_state: {
        type: 'adam',
        learning_rate: this.learningRate,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8,
        step: this.step,
      },
      metadata: {
        training_steps: this.step,
        loss_history: [...this.lossHistory],
        accuracy_history: [...this.accuracyHistory],
        embedding_dim: 32,
        total_parameters: totalParameters,
      },
    };
  }
}
