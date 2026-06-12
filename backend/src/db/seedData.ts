export interface SeedChapter {
  order: number
  title: string
  summary: string
  resourceUrl: string
  resourceLabel: string
  estMinutes: number
}

export interface SeedText {
  title: string
  author: string
  realm: string
  description: string
  difficulty: string
  coverEmoji: string
  attribution: string
  chapters: SeedChapter[]
}

export interface SeedTask {
  title: string
  description: string
  realm: string
  difficulty: string
  type: string
  points: number
}

const AIB = 'https://github.com/microsoft/AI-For-Beginners/tree/main/lessons'
const MLCC = 'https://developers.google.com/machine-learning/crash-course'
const D2L = 'https://d2l.ai'
const MWML = 'https://madewithml.com'

export const seedTexts: SeedText[] = [
  {
    title: 'The Flame of Prometheus',
    author: 'Foundations of Artificial Intelligence',
    realm: 'Prometheon',
    description:
      'Steal the fire of intelligence itself. From symbolic reasoning to neural networks, vision, language and ethics — the complete foundations of AI.',
    difficulty: 'Beginner',
    coverEmoji: '🔥',
    attribution: 'Based on Microsoft "AI For Beginners" (MIT license) — github.com/microsoft/AI-For-Beginners',
    chapters: [
      { order: 1, title: 'What is AI?', summary: 'Definitions of intelligence, the Turing test, and the difference between weak and strong AI.', resourceUrl: `${AIB}/1-Intro`, resourceLabel: 'AI For Beginners — Lesson 1', estMinutes: 45 },
      { order: 2, title: 'A Brief History of AI', summary: 'From the Dartmouth workshop through AI winters to the deep learning era.', resourceUrl: `${AIB}/1-Intro`, resourceLabel: 'AI For Beginners — Lesson 1 (History section)', estMinutes: 30 },
      { order: 3, title: 'Symbolic AI & Knowledge Representation', summary: 'Expert systems, ontologies and why hand-coding knowledge hits a wall.', resourceUrl: `${AIB}/2-Symbolic`, resourceLabel: 'AI For Beginners — Lesson 2', estMinutes: 60 },
      { order: 4, title: 'The Perceptron', summary: 'The simplest neural network: weights, bias and a learning rule from 1957 that started it all.', resourceUrl: `${AIB}/3-NeuralNetworks/03-Perceptron`, resourceLabel: 'AI For Beginners — Lesson 3', estMinutes: 60 },
      { order: 5, title: 'Multi-Layer Networks & Backpropagation', summary: 'Stacking layers, computing gradients, and building a tiny framework by hand.', resourceUrl: `${AIB}/3-NeuralNetworks/04-OwnFramework`, resourceLabel: 'AI For Beginners — Lesson 4', estMinutes: 90 },
      { order: 6, title: 'Neural Frameworks (PyTorch/TensorFlow)', summary: 'Let autograd do the gradients: the same network in a real framework.', resourceUrl: `${AIB}/3-NeuralNetworks/05-Frameworks`, resourceLabel: 'AI For Beginners — Lesson 5', estMinutes: 90 },
      { order: 7, title: 'Computer Vision & CNNs', summary: 'Convolutions, pooling and why CNNs see images the way they do.', resourceUrl: `${AIB}/4-ComputerVision`, resourceLabel: 'AI For Beginners — Computer Vision section', estMinutes: 120 },
      { order: 8, title: 'Natural Language & Embeddings', summary: 'Bag-of-words to word2vec: turning text into vectors machines can reason about.', resourceUrl: `${AIB}/5-NLP`, resourceLabel: 'AI For Beginners — NLP section', estMinutes: 120 },
      { order: 9, title: 'Language Models & Transformers', summary: 'Attention, transformers and the architecture behind modern LLMs.', resourceUrl: `${AIB}/5-NLP`, resourceLabel: 'AI For Beginners — NLP section (transformers)', estMinutes: 90 },
      { order: 10, title: 'Genetic Algorithms', summary: 'Evolution as a search strategy: selection, crossover and mutation.', resourceUrl: `${AIB}/6-Other`, resourceLabel: 'AI For Beginners — Other AI methods', estMinutes: 60 },
      { order: 11, title: 'Reinforcement Learning', summary: 'Agents, rewards and learning by trial and error — from CartPole to game-playing AIs.', resourceUrl: `${AIB}/6-Other`, resourceLabel: 'AI For Beginners — Other AI methods (RL)', estMinutes: 90 },
      { order: 12, title: 'AI Ethics & Responsible AI', summary: 'Bias, fairness, transparency — the obligations that come with stolen fire.', resourceUrl: `${AIB}/7-Ethics`, resourceLabel: 'AI For Beginners — Ethics', estMinutes: 45 },
    ],
  },
  {
    title: 'The Loom of the Fates',
    author: 'Mastering Machine Learning',
    realm: 'Asgard',
    description:
      'Weave patterns from raw threads of data. Fundamentals with Google’s ML Crash Course, then deep into the loom with Dive into Deep Learning.',
    difficulty: 'Intermediate',
    coverEmoji: '🧵',
    attribution: 'Based on Google "ML Crash Course" (CC-BY) and "Dive into Deep Learning" (d2l.ai)',
    chapters: [
      { order: 1, title: 'What is Machine Learning?', summary: 'Supervised vs unsupervised learning and the anatomy of an ML problem.', resourceUrl: `${MLCC}`, resourceLabel: 'ML Crash Course — Intro', estMinutes: 30 },
      { order: 2, title: 'Linear Regression & Loss', summary: 'Fitting a line, measuring error with MSE, and what "learning" actually minimizes.', resourceUrl: `${MLCC}/linear-regression`, resourceLabel: 'ML Crash Course — Linear Regression', estMinutes: 60 },
      { order: 3, title: 'Gradient Descent', summary: 'Walking downhill on the loss surface: learning rate, convergence, and stochastic variants.', resourceUrl: `${MLCC}/linear-regression`, resourceLabel: 'ML Crash Course — Linear Regression (gradient descent)', estMinutes: 45 },
      { order: 4, title: 'Classification & Logistic Regression', summary: 'From regression to decision boundaries: sigmoid, log loss, precision/recall and ROC.', resourceUrl: `${MLCC}/logistic-regression`, resourceLabel: 'ML Crash Course — Logistic Regression', estMinutes: 60 },
      { order: 5, title: 'Generalization: Train, Validate, Test', summary: 'Overfitting, data splits and why your model lies to you on training data.', resourceUrl: `${MLCC}/overfitting`, resourceLabel: 'ML Crash Course — Overfitting', estMinutes: 45 },
      { order: 6, title: 'Working with Data: Features', summary: 'Numerical and categorical features, normalization, and feature crosses.', resourceUrl: `${MLCC}/numerical-data`, resourceLabel: 'ML Crash Course — Working with data', estMinutes: 60 },
      { order: 7, title: 'Linear Neural Networks (d2l)', summary: 'The same regression/classification, rebuilt rigorously with tensors and autograd.', resourceUrl: `${D2L}/chapter_linear-regression/index.html`, resourceLabel: 'Dive into Deep Learning — Linear Networks', estMinutes: 120 },
      { order: 8, title: 'Multilayer Perceptrons', summary: 'Hidden layers, activation functions, dropout and weight decay.', resourceUrl: `${D2L}/chapter_multilayer-perceptrons/index.html`, resourceLabel: 'Dive into Deep Learning — MLPs', estMinutes: 150 },
      { order: 9, title: 'Convolutional Neural Networks', summary: 'Convolutions from first principles: LeNet to modern CNN design.', resourceUrl: `${D2L}/chapter_convolutional-neural-networks/index.html`, resourceLabel: 'Dive into Deep Learning — CNNs', estMinutes: 150 },
      { order: 10, title: 'Recurrent Networks & Sequences', summary: 'Modeling sequences: RNNs, LSTMs, GRUs and their failure modes.', resourceUrl: `${D2L}/chapter_recurrent-neural-networks/index.html`, resourceLabel: 'Dive into Deep Learning — RNNs', estMinutes: 150 },
      { order: 11, title: 'Attention & Transformers', summary: 'Queries, keys, values — the mechanism that replaced recurrence.', resourceUrl: `${D2L}/chapter_attention-mechanisms-and-transformers/index.html`, resourceLabel: 'Dive into Deep Learning — Attention', estMinutes: 180 },
      { order: 12, title: 'Optimization Algorithms', summary: 'SGD, momentum, Adam — why training converges (or doesn’t).', resourceUrl: `${D2L}/chapter_optimization/index.html`, resourceLabel: 'Dive into Deep Learning — Optimization', estMinutes: 120 },
    ],
  },
  {
    title: 'The Forge of Olympus',
    author: 'Cloud Infrastructure for AI',
    realm: 'Olympus',
    description:
      'Forge ML systems that survive contact with production: design, deploy, monitor and scale machine learning in the cloud.',
    difficulty: 'Advanced',
    coverEmoji: '⚒️',
    attribution: 'Based on "Made With ML" by Goku Mohandas (MIT license) — madewithml.com',
    chapters: [
      { order: 1, title: 'ML Systems Design', summary: 'Product thinking for ML: framing the problem before touching a model.', resourceUrl: `${MWML}/courses/mlops/design/`, resourceLabel: 'Made With ML — Design', estMinutes: 60 },
      { order: 2, title: 'Data Engineering & Preparation', summary: 'Splitting, preprocessing and versioning the data your system depends on.', resourceUrl: `${MWML}/courses/mlops/preparation/`, resourceLabel: 'Made With ML — Data preparation', estMinutes: 90 },
      { order: 3, title: 'Distributed Training', summary: 'Training beyond one machine: data parallelism and compute scaling.', resourceUrl: `${MWML}/courses/mlops/training/`, resourceLabel: 'Made With ML — Training', estMinutes: 120 },
      { order: 4, title: 'Experiment Tracking', summary: 'MLflow-style tracking: never lose a run, a metric, or a model again.', resourceUrl: `${MWML}/courses/mlops/experiment-tracking/`, resourceLabel: 'Made With ML — Experiment tracking', estMinutes: 60 },
      { order: 5, title: 'Testing ML Systems', summary: 'Testing code, data and models — pytest for pipelines, expectations for data.', resourceUrl: `${MWML}/courses/mlops/testing/`, resourceLabel: 'Made With ML — Testing', estMinutes: 120 },
      { order: 6, title: 'Model Serving', summary: 'Batch vs real-time inference; serving predictions behind an API.', resourceUrl: `${MWML}/courses/mlops/serving/`, resourceLabel: 'Made With ML — Serving', estMinutes: 90 },
      { order: 7, title: 'Containerization (Docker)', summary: 'Reproducible environments: packaging training and serving into containers.', resourceUrl: `${MWML}/courses/mlops/docker/`, resourceLabel: 'Made With ML — Docker', estMinutes: 60 },
      { order: 8, title: 'Workflow Orchestration', summary: 'DAGs and schedulers: turning notebooks into reliable pipelines.', resourceUrl: `${MWML}/courses/mlops/orchestration/`, resourceLabel: 'Made With ML — Orchestration', estMinutes: 90 },
      { order: 9, title: 'CI/CD for Machine Learning', summary: 'Automated testing and deployment workflows for models, not just code.', resourceUrl: `${MWML}/courses/mlops/cicd/`, resourceLabel: 'Made With ML — CI/CD', estMinutes: 90 },
      { order: 10, title: 'Monitoring & Drift', summary: 'Production vigilance: performance decay, data drift and alerting.', resourceUrl: `${MWML}/courses/mlops/monitoring/`, resourceLabel: 'Made With ML — Monitoring', estMinutes: 90 },
      { order: 11, title: 'Data Stack & Feature Stores', summary: 'Warehouses, feature stores and keeping training/serving features consistent.', resourceUrl: `${MWML}/courses/mlops/feature-store/`, resourceLabel: 'Made With ML — Feature store', estMinutes: 60 },
      { order: 12, title: 'Scaling & Cost in the Cloud', summary: 'Right-sizing compute, spot instances and the economics of ML infrastructure.', resourceUrl: `${MWML}/courses/mlops/systems-design/`, resourceLabel: 'Made With ML — Systems design', estMinutes: 60 },
    ],
  },
]

export const seedTasks: SeedTask[] = [
  // Flame of Prometheus (Prometheon)
  { title: 'Build a Perceptron from Scratch', description: 'Implement the perceptron learning rule in plain Python/NumPy and train it on a linearly separable dataset. No frameworks allowed.', realm: 'Prometheon', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Train a CNN on MNIST', description: 'Use PyTorch or TensorFlow to build and train a small convolutional network on MNIST. Report accuracy and show 5 misclassified digits.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Minimax Tic-Tac-Toe', description: 'Implement an unbeatable tic-tac-toe AI using minimax with alpha-beta pruning. Play 10 games against it to verify.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Explore Word Embeddings', description: 'Load pre-trained word vectors and explore analogies (king - man + woman ≈ ?). Write up 5 interesting/broken analogies you find.', realm: 'Prometheon', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Evolve a Solution', description: 'Implement a genetic algorithm that evolves a string toward a target phrase. Chart fitness over generations.', realm: 'Prometheon', difficulty: 'Medium', type: 'Coding', points: 200 },
  // Loom of the Fates (Asgard)
  { title: 'Linear Regression by Hand', description: 'Derive and implement gradient descent for linear regression without any ML library. Verify against scikit-learn on the same data.', realm: 'Asgard', difficulty: 'Easy', type: 'Coding', points: 100 },
  { title: 'Feature Engineering Lab', description: 'Take a messy tabular dataset, engineer features (normalization, crosses, encodings) and measure the accuracy delta on a simple model.', realm: 'Asgard', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'MLP from Scratch', description: 'Implement a two-layer perceptron with backpropagation in NumPy (d2l exercise). Match framework results on a small dataset.', realm: 'Asgard', difficulty: 'Hard', type: 'Coding', points: 400 },
  { title: 'Regularize a Network', description: 'Demonstrate overfitting on purpose, then fix it: apply dropout and weight decay, and chart train vs validation curves before/after.', realm: 'Asgard', difficulty: 'Medium', type: 'Coding', points: 250 },
  { title: 'Implement Attention Scoring', description: 'Implement scaled dot-product attention from the formula and verify your output against a framework implementation.', realm: 'Asgard', difficulty: 'Hard', type: 'Coding', points: 400 },
  // Forge of Olympus (Olympus)
  { title: 'Serve a Model with FastAPI', description: 'Wrap a trained model in a FastAPI prediction endpoint with input validation and a /health route. Load-test it with 100 requests.', realm: 'Olympus', difficulty: 'Medium', type: 'Coding', points: 250 },
  { title: 'Dockerize a Training Job', description: 'Write a Dockerfile that runs a training script reproducibly. Same results inside and outside the container.', realm: 'Olympus', difficulty: 'Medium', type: 'Coding', points: 200 },
  { title: 'Test an ML Pipeline', description: 'Write pytest tests for an ML pipeline: data validation tests, a model behavioral test, and a training smoke test.', realm: 'Olympus', difficulty: 'Hard', type: 'Coding', points: 400 },
  { title: 'Track Your Experiments', description: 'Set up MLflow (or W&B free tier) and log 5 training runs with different hyperparameters. Compare them in the UI.', realm: 'Olympus', difficulty: 'Easy', type: 'Coding', points: 150 },
  { title: 'Design a Drift Detector', description: 'Research data drift detection methods, then implement a simple statistical drift check between two dataset snapshots and write up your approach.', realm: 'Olympus', difficulty: 'Hard', type: 'Research', points: 500 },
]
