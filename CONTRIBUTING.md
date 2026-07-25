# 🤝 Contributing to Hyper-Brain Mediator

Thank you for your interest in contributing to **Hyper-Brain Mediator vReal 6.0**! We welcome contributions from developers, researchers, and open-source enthusiasts.

---

## 🛠️ How to Contribute

1. **Fork the Repository:** Create your own feature branch.
2. **Setup Development Environment:**
   ```bash
   npm install
   npm run dev
   ```
3. **Run Type Checks & Linter:**
   ```bash
   npm run lint
   ```
4. **Submit a Pull Request:** Ensure your code follows TypeScript strict mode and passes all compilation checks (`npm run build`).

---

## 📐 Guidelines

- **Code Style:** Follow standard React/TypeScript functional component patterns.
- **Neural Engine Changes:** Any modifications to `realNeuralEngine.ts` or `binaryWeightStorage.ts` must maintain `Float32Array` type safety and pass matrix multiplication dimension assertions.
- **Localization:** Ensure Arabic text strings and Markdown output retain full RTL compatibility.
