export interface RoadmapProject {
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone';
  resumeImpact: string;
}

export interface RoadmapCertification {
  title: string;
  issuer: string;
  url: string;
  importance: 'Essential' | 'High Value' | 'Industry Standard';
  description: string;
}

export interface RoadmapYear {
  year: number;
  yearName: string;
  theme: string;
  focusTagline: string;
  skills: {
    name: string;
    category: 'Core Language' | 'Data Structures & Algorithms' | 'Domain & Frameworks' | 'System Architecture' | 'DevOps & Tools';
  }[];
  projects: RoadmapProject[];
  certifications: RoadmapCertification[];
  placementMilestones: string[];
}

export interface BranchRoadmap {
  branchCode: string;
  branchName: string;
  iconName: string;
  industryTrendSummary: string;
  marketOutlook2026: string;
  averageFresherSalaryBracket: string;
  topCareerRoles: string[];
  recommendedTechStack: string[];
  years: RoadmapYear[];
}

export const ENGINEERING_ROADMAPS: Record<string, BranchRoadmap> = {
  // ==========================================
  // 1. COMPUTER SCIENCE & ENGINEERING (CSE)
  // ==========================================
  CSE: {
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    iconName: 'Code',
    industryTrendSummary: 'High demand for resilient software architects, cloud-native backend engineers, and developers adept with AI-assisted software lifecycles and high-concurrency systems.',
    marketOutlook2026: 'Rapid adoption of distributed architectures, Rust/Go backend microservices, and AI-driven dev-workflows across Fortune 500 tech companies and high-growth startups.',
    averageFresherSalaryBracket: '₹8.0 LPA – ₹24.0 LPA (Top Product Companies: ₹30+ LPA)',
    topCareerRoles: [
      'Software Development Engineer (SDE 1)',
      'Backend Systems Engineer',
      'Full Stack Cloud Developer',
      'Site Reliability Engineer (SRE)'
    ],
    recommendedTechStack: ['C++', 'Java / Spring Boot', 'Go', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'AWS'],
    years: [
      {
        year: 1,
        yearName: '1st Year: Foundations & Computational Thinking',
        theme: 'Strong Fundamentals in Programming, Discrete Mathematics & Git',
        focusTagline: 'Build unbreakable programming discipline and problem-solving muscle.',
        skills: [
          { name: 'C / C++ Programming Fundamentals', category: 'Core Language' },
          { name: 'Discrete Mathematics & Boolean Logic', category: 'Core Language' },
          { name: 'Time & Space Complexity (Big-O Analysis)', category: 'Data Structures & Algorithms' },
          { name: 'Linux Terminal & Bash Scripting', category: 'DevOps & Tools' },
          { name: 'Git & GitHub Collaboration Workflow', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'CLI Student Record & Library System in Modern C++',
            description: 'Terminal application implementing custom file serialization, memory-safe pointers, and interactive menu drivers.',
            techStack: ['C++17', 'CMake', 'Linux Bash'],
            difficulty: 'Beginner',
            resumeImpact: 'Demonstrates low-level memory management and structured software architecture.'
          },
          {
            title: 'Algorithmic Visualizer Web Application',
            description: 'Interactive browser canvas visualizing Pathfinding (Dijkstra, A*) and Sorting algorithms (QuickSort, MergeSort).',
            techStack: ['HTML5 Canvas', 'JavaScript', 'Tailwind CSS'],
            difficulty: 'Beginner',
            resumeImpact: 'Showcases deep grasp of algorithm step-execution and UI state synchrony.'
          }
        ],
        certifications: [
          {
            title: 'CS50x: Introduction to Computer Science',
            issuer: 'Harvard University / edX',
            url: 'https://cs50.harvard.edu/x/',
            importance: 'Essential',
            description: 'Gold-standard academic bedrock in algorithms, data structures, and computer architecture.'
          },
          {
            title: 'Version Control with Git & GitHub',
            issuer: 'Linux Foundation / Coursera',
            url: 'https://www.coursera.org',
            importance: 'High Value',
            description: 'Validates industry-standard team code collaboration and branch management.'
          }
        ],
        placementMilestones: [
          'Solve 100+ easy/medium problems on LeetCode / Codeforces.',
          'Create a clean professional GitHub profile with 3 pinned repositories.',
          'Participate in your college 24-hour freshman hackathon.'
        ]
      },
      {
        year: 2,
        yearName: '2nd Year: Data Structures, Core CS & Full-Stack Depth',
        theme: 'Core CS Subjects, Algorithmic Prowess & Database Architecture',
        focusTagline: 'Master academic core subjects that appear in every top-tier technical interview.',
        skills: [
          { name: 'Advanced Data Structures (Trees, Graphs, Disjoint Sets, DP)', category: 'Data Structures & Algorithms' },
          { name: 'Operating Systems (Concurrency, Threads, Deadlocks, Paging)', category: 'System Architecture' },
          { name: 'Database Management Systems (Relational Normalization & SQL)', category: 'System Architecture' },
          { name: 'Computer Networks (TCP/IP, HTTP/3, WebSockets, DNS)', category: 'System Architecture' },
          { name: 'Backend Engineering (Node.js/Express or Spring Boot)', category: 'Domain & Frameworks' }
        ],
        projects: [
          {
            title: 'High-Concurrency Real-Time Collaboration Canvas',
            description: 'Multi-user whiteboarding tool with WebSocket synchronization, conflict-resolution algorithms, and Redis pub/sub room management.',
            techStack: ['TypeScript', 'Node.js', 'Redis', 'WebSockets', 'PostgreSQL'],
            difficulty: 'Intermediate',
            resumeImpact: 'Demonstrates understanding of distributed state synchronization and sub-50ms latency.'
          },
          {
            title: 'Custom In-Memory Key-Value Storage Engine',
            description: 'Lightweight Redis clone with support for LRU eviction, transactional locks, TTL expiration, and persistence via append-only files.',
            techStack: ['Go or C++', 'TCP Sockets', 'Concurrency Primitives'],
            difficulty: 'Intermediate',
            resumeImpact: 'Rare project showcasing systems engineering and low-level socket protocol parsing.'
          }
        ],
        certifications: [
          {
            title: 'Oracle Certified Professional: Java SE Developer',
            issuer: 'Oracle University',
            url: 'https://education.oracle.com',
            importance: 'Industry Standard',
            description: 'Benchmark credential preferred by enterprise engineering recruiters.'
          },
          {
            title: 'PostgreSQL Associate Developer',
            issuer: 'EnterpriseDB (EDB)',
            url: 'https://www.enterprisedb.com',
            importance: 'High Value',
            description: 'Validates production relational schema design, indexing, and query optimization.'
          }
        ],
        placementMilestones: [
          'Cross 300+ LeetCode problems (Graphs, Dynamic Programming, Binary Search).',
          'Attain 1600+ contest rating on CodeChef / Codeforces or Knight badge on LeetCode.',
          'Build and deploy at least 2 full-stack projects to live production URLs.'
        ]
      },
      {
        year: 3,
        yearName: '3rd Year: Distributed Systems, Cloud & Summer Internships',
        theme: 'Production Scale, System Design & High-Stakes Internships',
        focusTagline: 'Transition from coding problems to engineering robust production systems.',
        skills: [
          { name: 'High-Level System Design (Microservices, Caching, Rate Limiting)', category: 'System Architecture' },
          { name: 'Cloud Engineering (AWS EC2, S3, RDS, Lambda, VPC)', category: 'DevOps & Tools' },
          { name: 'Containerization & Orchestration (Docker, Kubernetes)', category: 'DevOps & Tools' },
          { name: 'Message Brokers & Event Streaming (Apache Kafka, RabbitMQ)', category: 'Domain & Frameworks' },
          { name: 'CI/CD Pipelines (GitHub Actions, Automated Testing)', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'Distributed Event-Driven Payment Settlement Service',
            description: 'Idempotent financial ledger processing asynchronous transactions with Apache Kafka, circuit breakers, and distributed tracing.',
            techStack: ['Java Spring Boot', 'Apache Kafka', 'PostgreSQL', 'Docker', 'OpenTelemetry'],
            difficulty: 'Advanced',
            resumeImpact: 'Directly mirrors real-world fintech architectures (PayPal, Razorpay, Stripe).'
          },
          {
            title: 'Edge-Cached Global URL Shortener with Analytics Pipeline',
            description: 'Scalable service capable of handling 50k req/sec with geo-distributed Redis caching, Bloom filters for collision checks, and ClickHouse analytics.',
            techStack: ['Go', 'Redis Cluster', 'ClickHouse', 'AWS ECS', 'Terraform'],
            difficulty: 'Advanced',
            resumeImpact: 'Exemplary system design capstone demonstrating horizontal scalability.'
          }
        ],
        certifications: [
          {
            title: 'AWS Certified Solutions Architect – Associate',
            issuer: 'Amazon Web Services',
            url: 'https://aws.amazon.com/certification/',
            importance: 'Industry Standard',
            description: 'Most requested cloud architecture credential across global product companies.'
          },
          {
            title: 'Certified Kubernetes Application Developer (CKAD)',
            issuer: 'Cloud Native Computing Foundation (CNCF)',
            url: 'https://www.cncf.io/certification/ckad/',
            importance: 'High Value',
            description: 'High-prestige hands-on practical exam proving enterprise container deployment mastery.'
          }
        ],
        placementMilestones: [
          'Clear on-campus or off-campus 3rd-year summer internship (May–July).',
          'Solve 500+ LeetCode problems; achieve rapid 20-minute medium-problem solving speed.',
          'Complete end-to-end System Design primer (Grokking the System Design Interview).'
        ]
      },
      {
        year: 4,
        yearName: '4th Year: Capstone, Placement Drives & Career Transition',
        theme: 'Campus Placement Drives, PPO Conversions & Production Capstone',
        focusTagline: 'Convert top product and Tier-1 dream offers with polished interview performance.',
        skills: [
          { name: 'Low-Level Design (Design Patterns, SOLID, UML, Clean Code)', category: 'System Architecture' },
          { name: 'Advanced System Design (Distributed Consensus, Raft, Paxos)', category: 'System Architecture' },
          { name: 'Performance Profiling & Database Sharding', category: 'Domain & Frameworks' },
          { name: 'Production Telemetry & Observability (Grafana, Prometheus)', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'Autonomous Multi-Agent AI Code Review & Security Sentinel',
            description: 'Enterprise developer tool scanning git pull requests for AST security vulnerabilities, automated test generation, and semantic PR summaries.',
            techStack: ['Python', 'FastAPI', 'LangChain', 'Docker', 'PostgreSQL', 'GitHub Apps API'],
            difficulty: 'Capstone',
            resumeImpact: 'Blends generative AI with real-world developer productivity tooling.'
          }
        ],
        certifications: [
          {
            title: 'Google Cloud Professional Cloud Architect',
            issuer: 'Google Cloud',
            url: 'https://cloud.google.com/certification',
            importance: 'High Value',
            description: 'Senior credential validating scalable enterprise multi-tier infrastructure design.'
          }
        ],
        placementMilestones: [
          'Participate in Day-1 on-campus placement drives (target 20+ LPA product roles).',
          'Mock technical and HR interviews with seniors and industry alumni.',
          'Complete final-year major project thesis and submit conference paper if academic.'
        ]
      }
    ]
  },

  // ==========================================
  // 2. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (CSM / AIML)
  // ==========================================
  CSM: {
    branchCode: 'CSM',
    branchName: 'Computer Science & Engineering (AI & ML)',
    iconName: 'BrainCircuit',
    industryTrendSummary: 'Explosive industry demand for Generative AI, Retrieval-Augmented Generation (RAG), Fine-Tuned LLM agents, and MLOps production deployment engineers.',
    marketOutlook2026: 'Enterprises moving from AI prototypes to enterprise-grade autonomous agents, small language models (SLMs) on device, and scalable model serving infrastructure.',
    averageFresherSalaryBracket: '₹9.0 LPA – ₹26.0 LPA (Specialized AI Labs: ₹35+ LPA)',
    topCareerRoles: [
      'Machine Learning Engineer',
      'AI Systems & MLOps Engineer',
      'Computer Vision Specialist',
      'NLP / LLM Research Engineer'
    ],
    recommendedTechStack: ['Python', 'PyTorch', 'Hugging Face', 'FastAPI', 'Docker', 'LangChain / LlamaIndex', 'Vector DBs (Qdrant/Pinecone)', 'MLflow', 'Triton'],
    years: [
      {
        year: 1,
        yearName: '1st Year: Math for Machine Learning & Python Foundations',
        theme: 'Linear Algebra, Calculus, Probability & Pythonic Programming',
        focusTagline: 'Machine learning is applied linear algebra. Build rock-solid mathematical intuition.',
        skills: [
          { name: 'Python 3 Mastery (OOP, Functional, Memory Model)', category: 'Core Language' },
          { name: 'Linear Algebra (Eigenvectors, SVD, Matrix Decomposition)', category: 'Domain & Frameworks' },
          { name: 'Multivariate Calculus & Optimization (Gradient Descent)', category: 'Domain & Frameworks' },
          { name: 'Probability & Bayesian Statistics', category: 'Domain & Frameworks' },
          { name: 'NumPy, Pandas & Matplotlib Data Processing', category: 'Domain & Frameworks' }
        ],
        projects: [
          {
            title: 'From-Scratch Machine Learning Algorithm Library in NumPy',
            description: 'Hand-coded implementations of Linear/Logistic Regression, Decision Trees, K-Means, and Neural Net Backpropagation without scikit-learn.',
            techStack: ['Python', 'NumPy', 'Math'],
            difficulty: 'Beginner',
            resumeImpact: 'Proves mathematical mastery over black-box library calling.'
          },
          {
            title: 'Exploratory Statistical Analytics Dashboard for Climate Data',
            description: 'Interactive analytics dashboard demonstrating hypothesis testing, correlation matrices, and outlier anomaly detection.',
            techStack: ['Python', 'Streamlit', 'Pandas', 'Seaborn'],
            difficulty: 'Beginner',
            resumeImpact: 'Demonstrates professional data wrangling and storytelling.'
          }
        ],
        certifications: [
          {
            title: 'Mathematics for Machine Learning Specialization',
            issuer: 'Imperial College London / Coursera',
            url: 'https://www.coursera.org',
            importance: 'Essential',
            description: 'Covers Linear Algebra, Multivariate Calculus, and PCA for ML models.'
          },
          {
            title: 'Python for Data Science and Machine Learning Bootcamp',
            issuer: 'Udemy / Jose Portilla',
            url: 'https://www.udemy.com',
            importance: 'High Value',
            description: 'Hands-on practical training in NumPy, Pandas, Scikit-Learn, and Seaborn.'
          }
        ],
        placementMilestones: [
          'Solve 150+ DSA problems in Python or C++.',
          'Complete 2 Kaggle beginner competitions with published public notebooks.',
          'Maintain a technical blog explaining core ML concepts with code visuals.'
        ]
      },
      {
        year: 2,
        yearName: '2nd Year: Deep Learning, PyTorch & Classical NLP/CV',
        theme: 'Neural Network Architectures, Computer Vision & PyTorch Training',
        focusTagline: 'Transition to modern deep learning pipelines and GPU acceleration.',
        skills: [
          { name: 'Deep Learning & Neural Networks with PyTorch', category: 'Domain & Frameworks' },
          { name: 'Convolutional Neural Networks (ResNet, YOLO, EfficientNet)', category: 'Domain & Frameworks' },
          { name: 'Recurrent Nets, LSTMs & Self-Attention Foundations', category: 'Domain & Frameworks' },
          { name: 'Data Structures & Algorithms (Trees, Graphs, DP)', category: 'Data Structures & Algorithms' },
          { name: 'FastAPI for High-Throughput Model Serving', category: 'System Architecture' }
        ],
        projects: [
          {
            title: 'Real-Time Edge Computer Vision Traffic & Hazard Detector',
            description: 'YOLOv10 powered live video analytics pipeline detecting road violations, lane departures, and pedestrian hazards at 60 FPS.',
            techStack: ['PyTorch', 'OpenCV', 'YOLOv10', 'ONNX Runtime', 'FastAPI'],
            difficulty: 'Intermediate',
            resumeImpact: 'Demonstrates real-time model inference optimization and edge hardware constraints.'
          },
          {
            title: 'Medical Image Segmentation for Tumor Identification',
            description: 'U-Net architecture trained on MRI scans to segment anomalies with 94%+ Dice coefficient and Grad-CAM interpretability heatmaps.',
            techStack: ['PyTorch', 'TorchVision', 'Albumentations', 'Weights & Biases'],
            difficulty: 'Intermediate',
            resumeImpact: 'Exemplifies high-precision computer vision and explainable AI.'
          }
        ],
        certifications: [
          {
            title: 'Deep Learning Specialization (Andrew Ng)',
            issuer: 'DeepLearning.AI / Coursera',
            url: 'https://www.deeplearning.ai',
            importance: 'Essential',
            description: 'The defining credential for deep neural network architecture and tuning.'
          },
          {
            title: 'NVIDIA DLI: Fundamentals of Deep Learning',
            issuer: 'NVIDIA Deep Learning Institute',
            url: 'https://www.nvidia.com/dli',
            importance: 'Industry Standard',
            description: 'Hands-on certification for multi-GPU training and CUDA tensor optimization.'
          }
        ],
        placementMilestones: [
          'Solve 300+ LeetCode problems with focus on graph traversals and DP.',
          'Win or place top-10 in a regional university hackathon with an AI prototype.',
          'Deploy at least 2 AI inference APIs to cloud endpoints (Hugging Face Spaces / AWS).'
        ]
      },
      {
        year: 3,
        yearName: '3rd Year: LLMs, Generative AI, RAG & MLOps Pipelines',
        theme: 'Transformers, Agentic Frameworks, Vector DBs & MLOps Automation',
        focusTagline: 'Engineer enterprise-ready generative AI systems and automated training pipelines.',
        skills: [
          { name: 'Transformer Architecture & Attention Mechanisms', category: 'Domain & Frameworks' },
          { name: 'Retrieval-Augmented Generation (RAG) & Vector Databases', category: 'Domain & Frameworks' },
          { name: 'Model Fine-Tuning (LoRA, QLoRA, PEFT, Unsloth)', category: 'Domain & Frameworks' },
          { name: 'MLOps Automation (MLflow, DVC, Docker, Triton Inference Server)', category: 'DevOps & Tools' },
          { name: 'System Design for AI Services (Caching, Token Rate Limits)', category: 'System Architecture' }
        ],
        projects: [
          {
            title: 'Enterprise Multimodal RAG with Re-ranking & Citations',
            description: 'Full-stack document intelligence engine indexing 50,000+ technical PDF manuals using hybrid search (BM25 + Dense Vectors) with hallucination guards.',
            techStack: ['FastAPI', 'LlamaIndex', 'Qdrant', 'Hugging Face', 'Docker', 'Next.js'],
            difficulty: 'Advanced',
            resumeImpact: 'The #1 most requested industry skillset in 2026 enterprise AI recruitment.'
          },
          {
            title: 'Automated CI/CD MLOps Pipeline for Credit Risk Prediction',
            description: 'End-to-end pipeline with automated data drift detection, continuous model retraining, artifact versioning, and zero-downtime deployment.',
            techStack: ['MLflow', 'DVC', 'Evidently AI', 'GitHub Actions', 'AWS SageMaker'],
            difficulty: 'Advanced',
            resumeImpact: 'Demonstrates enterprise maturity beyond notebook-only ML experimentation.'
          }
        ],
        certifications: [
          {
            title: 'AWS Certified Machine Learning – Specialty',
            issuer: 'Amazon Web Services',
            url: 'https://aws.amazon.com/certification/',
            importance: 'Industry Standard',
            description: 'Top-tier cloud AI certification validating enterprise ML pipeline architecture.'
          },
          {
            title: 'TensorFlow Developer Certificate / Hugging Face NLP',
            issuer: 'Hugging Face & Google Developers',
            url: 'https://huggingface.co',
            importance: 'High Value',
            description: 'Demonstrates competence in fine-tuning and deploying transformer pipelines.'
          }
        ],
        placementMilestones: [
          'Land a high-profile 3rd-year summer internship at an AI lab or tech enterprise.',
          'Publish an open-source model or dataset on Hugging Face Hub with community downloads.',
          'Attain 450+ LeetCode problems solved with fluid Python DSA interview mastery.'
        ]
      },
      {
        year: 4,
        yearName: '4th Year: Autonomous Agents, Capstone & Dream Placement',
        theme: 'Autonomous Multi-Agent Systems, High-Package Placement Drives',
        focusTagline: 'Secure flagship AI engineer placements with cutting-edge production capstones.',
        skills: [
          { name: 'Multi-Agent Frameworks (LangGraph, CrewAI, AutoGen)', category: 'Domain & Frameworks' },
          { name: 'LLM Evaluation & Guardrails (Ragas, TruLens, NeMo Guardrails)', category: 'Domain & Frameworks' },
          { name: 'Model Quantization & TensorRT Inference Acceleration', category: 'DevOps & Tools' },
          { name: 'AI Safety, Bias Auditing & Governance', category: 'System Architecture' }
        ],
        projects: [
          {
            title: 'Autonomous Multi-Agent Financial Research Analyst Team',
            description: 'System of coordinated AI agents performing SEC 10-K filings extraction, chart generation, discounted cash flow (DCF) modeling, and risk reports.',
            techStack: ['LangGraph', 'Python', 'FastAPI', 'Llama-3-70B', 'Streamlit', 'Docker'],
            difficulty: 'Capstone',
            resumeImpact: 'Unmatched portfolio capstone illustrating cutting-edge agentic workflows.'
          }
        ],
        certifications: [
          {
            title: 'Google Cloud Professional Machine Learning Engineer',
            issuer: 'Google Cloud',
            url: 'https://cloud.google.com/certification',
            importance: 'Industry Standard',
            description: 'Premier recognition for designing scalable production ML systems on GCP.'
          }
        ],
        placementMilestones: [
          'Crack Day-1 placement drives for AI / Machine Learning roles (target 20–40 LPA).',
          'Present final-year capstone research paper at IEEE or Scopus indexed conference.',
          'Mentor junior students in college coding and AI clubs.'
        ]
      }
    ]
  },

  // ==========================================
  // 3. ELECTRONICS & COMMUNICATION (ECE - VLSI & EMBEDDED)
  // ==========================================
  ECE: {
    branchCode: 'ECE',
    branchName: 'Electronics & Communication Engineering (VLSI & Embedded)',
    iconName: 'Cpu',
    industryTrendSummary: 'Historic boom driven by the India Semiconductor Mission (ISM), semiconductor fabrication plants in Dholera/Sanand, and global chip design giants (Qualcomm, Intel, NVIDIA, TI, AMD).',
    marketOutlook2026: 'Enormous surge in hiring for ASIC design, Physical Design (PD), FPGA prototyping, RISC-V processor engineering, and embedded firmware specialists.',
    averageFresherSalaryBracket: '₹8.5 LPA – ₹25.0 LPA (Semiconductor MNCs: ₹22+ LPA)',
    topCareerRoles: [
      'VLSI Design Engineer',
      'ASIC Verification Engineer (SystemVerilog/UVM)',
      'Physical Design (PD) Engineer',
      'Embedded Firmware / IoT Systems Engineer'
    ],
    recommendedTechStack: ['Verilog', 'SystemVerilog', 'UVM', 'C / C++', 'Python Scripting', 'Cadence Virtuoso', 'Synopsys Design Compiler', 'ModelSim / Questa', 'RISC-V'],
    years: [
      {
        year: 1,
        yearName: '1st Year: Circuit Theory, Digital Logic & C Programming',
        theme: 'Analog/Digital Basics, Boolean Algebra & Low-Level C',
        focusTagline: 'Understand physics of silicon and master boolean logic circuits.',
        skills: [
          { name: 'C Programming & Pointer Arithmetic', category: 'Core Language' },
          { name: 'Digital Electronics & Logic Design (K-Maps, FSMs)', category: 'Core Language' },
          { name: 'Network Theory & Circuit Analysis (Kirchhoff, Thevenin)', category: 'Domain & Frameworks' },
          { name: 'Electronic Devices & Circuits (BJTs, MOSFETs, Diodes)', category: 'Domain & Frameworks' },
          { name: 'MATLAB / Octave Numerical Simulation', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'Digital 8-Bit ALU Circuit Simulation & Breadboard Prototype',
            description: 'Designed and validated a functioning Arithmetic Logic Unit executing addition, subtraction, AND, OR, XOR operations using 74xx ICs.',
            techStack: ['Logisim', 'Breadboard Prototyping', 'Digital ICs'],
            difficulty: 'Beginner',
            resumeImpact: 'Demonstrates tangible hardware comprehension from gate-level upwards.'
          },
          {
            title: 'Audio Frequency Equalizer with Operational Amplifiers',
            description: 'Analog 3-band tone control filter circuit using op-amps with SPICE simulation and frequency response bode plots.',
            techStack: ['LTSpice', 'Analog Circuits', 'PCB Design'],
            difficulty: 'Beginner',
            resumeImpact: 'Demonstrates precision analog circuit analysis and SPICE simulation skills.'
          }
        ],
        certifications: [
          {
            title: 'Digital Systems: From Logic Gates to Processors',
            issuer: 'Autonomous University of Barcelona / Coursera',
            url: 'https://www.coursera.org',
            importance: 'Essential',
            description: 'Comprehensive digital logic design from truth tables to processor datapaths.'
          },
          {
            title: 'Introduction to Electronics',
            issuer: 'Georgia Institute of Technology',
            url: 'https://www.coursera.org',
            importance: 'High Value',
            description: 'Operational amplifier and semiconductor transistor circuit modeling.'
          }
        ],
        placementMilestones: [
          'Master boolean reductions, finite state machines (Mealy & Moore models).',
          'Solve 80+ basic C/C++ algorithms to build core placement aptitude.',
          'Participate in college robotics/hardware tinkering club.'
        ]
      },
      {
        year: 2,
        yearName: '2nd Year: Verilog HDL, Microcontrollers & Signal Processing',
        theme: 'Hardware Description Languages, FPGA Prototyping & Signals',
        focusTagline: 'Write hardware in code and bring programmable logic to life.',
        skills: [
          { name: 'Verilog HDL Synthesizable Coding (RTL Design)', category: 'Domain & Frameworks' },
          { name: 'Signals & Systems (Fourier Transform, Z-Transform)', category: 'Domain & Frameworks' },
          { name: 'Microcontrollers & Embedded C (ARM Cortex-M, STM32, ESP32)', category: 'Core Language' },
          { name: 'Computer Architecture (Pipelining, Cache Memory, RISC vs CISC)', category: 'System Architecture' },
          { name: 'Data Structures & Algorithms in C++', category: 'Data Structures & Algorithms' }
        ],
        projects: [
          {
            title: 'FPGA-Based VGA Game Engine in Verilog HDL',
            description: 'Hardware rendering pipeline generating 640x480 60Hz video output with sprite collision logic and custom hardware state machines.',
            techStack: ['Verilog HDL', 'Xilinx Vivado', 'Basys 3 / Nexys FPGA', 'VGA'],
            difficulty: 'Intermediate',
            resumeImpact: 'Impressive live hardware demo proving RTL timing and synchrony skills.'
          },
          {
            title: 'Smart Health Monitor with FreeRTOS & BLE on STM32',
            description: 'Multi-threaded embedded firmware sampling PPG pulse sensors, running peak-detection algorithms, and transmitting over Bluetooth Low Energy.',
            techStack: ['Embedded C', 'STM32 Nucleo', 'FreeRTOS', 'I2C/SPI Protocols'],
            difficulty: 'Intermediate',
            resumeImpact: 'Proves mastery of real-time operating systems (RTOS) and peripheral buses.'
          }
        ],
        certifications: [
          {
            title: 'FPGA Design for Embedded Systems',
            issuer: 'University of Colorado Boulder / Coursera',
            url: 'https://www.coursera.org',
            importance: 'Essential',
            description: 'Xilinx Vivado workflows, RTL synthesis, static timing analysis (STA).'
          },
          {
            title: 'Embedded Software Essentials with Arm Cortex-M',
            issuer: 'Arm Education / edX',
            url: 'https://www.edx.org',
            importance: 'Industry Standard',
            description: 'Direct industry certification from ARM in embedded microcontroller development.'
          }
        ],
        placementMilestones: [
          'Solve 250+ DSA problems in C++ (for dual-track eligibility in both core and tech companies).',
          'Complete timing simulation and RTL synthesis on 5+ hardware modules.',
          'Prepare for core semiconductor intern tests (Qualcomm, TI, Intel aptitude formats).'
        ]
      },
      {
        year: 3,
        yearName: '3rd Year: SystemVerilog, UVM, Physical Design & Core Internships',
        theme: 'Verification Methodologies, STA, Semiconductor Internships',
        focusTagline: 'Qualify for high-paying ASIC Verification and Physical Design roles.',
        skills: [
          { name: 'SystemVerilog for Design & Functional Verification', category: 'Domain & Frameworks' },
          { name: 'Universal Verification Methodology (UVM Architecture)', category: 'Domain & Frameworks' },
          { name: 'Static Timing Analysis (Setup/Hold Times, Clock Skew)', category: 'System Architecture' },
          { name: 'Python & Perl/Tcl Scripting for EDA Automation', category: 'DevOps & Tools' },
          { name: 'CMOS VLSI Layout & DRC/LVS Rule Checks', category: 'Domain & Frameworks' }
        ],
        projects: [
          {
            title: '5-Stage Pipelined 32-Bit RISC-V Processor Core in SystemVerilog',
            description: 'RV32I instruction set architecture implementation with hazard detection, branch prediction, forwarding unit, and dual-port cache memory.',
            techStack: ['SystemVerilog', 'ModelSim', 'RISC-V Toolchain', 'GTKWave'],
            difficulty: 'Advanced',
            resumeImpact: 'The holy-grail undergraduate portfolio project guaranteed to impress chip designers.'
          },
          {
            title: 'UVM Testbench for AXI4-Lite Protocol Bus Interface',
            description: 'Production-grade verification environment featuring constrained random stimulus, functional coverage models, scoreboards, and assertions (SVA).',
            techStack: ['SystemVerilog UVM', 'Synopsys VCS / Questa', 'Tcl Scripting'],
            difficulty: 'Advanced',
            resumeImpact: 'Direct match for ASIC verification roles at Qualcomm, Intel, and AMD.'
          }
        ],
        certifications: [
          {
            title: 'Cadence Certified SystemVerilog for Verification',
            issuer: 'Cadence Design Systems',
            url: 'https://www.cadence.com/training',
            importance: 'Industry Standard',
            description: 'Official EDA vendor credential validating testbench design competence.'
          },
          {
            title: 'Synopsys Static Timing Analysis (STA) Professional',
            issuer: 'Synopsys Training Services',
            url: 'https://www.synopsys.com',
            importance: 'High Value',
            description: 'Covers timing constraints (SDC), clock domain crossing (CDC), and slack optimization.'
          }
        ],
        placementMilestones: [
          'Secure 3rd-year core semiconductor summer internship (Qualcomm, Texas Instruments, Intel, AMD).',
          'Master Static Timing Analysis numerical questions and setup/hold time violations.',
          'Solve 400+ coding problems to retain full software placement backup flexibility.'
        ]
      },
      {
        year: 4,
        yearName: '4th Year: Tapeout Flows, Capstone & Semiconductor Placements',
        theme: 'ASIC Backend Flow, Core Chip Design Interviews & Dream Offer',
        focusTagline: 'Convert top hardware engineering offers and finish open-source ASIC tapeout.',
        skills: [
          { name: 'ASIC Floorplanning, Placement & Routing (P&R Flow)', category: 'System Architecture' },
          { name: 'Open-Source Silicon Flows (OpenLane, SkyWater 130nm PDK)', category: 'Domain & Frameworks' },
          { name: 'High-Speed Digital Interconnects (PCIe, DDR, USB-C PHY)', category: 'Domain & Frameworks' },
          { name: 'Low Power Design Techniques (Clock Gating, Power Domains)', category: 'System Architecture' }
        ],
        projects: [
          {
            title: 'OpenLane Tapeout of a Cryptographic Accelerator (AES-128) on Sky130 PDK',
            description: 'GDSII generation for hardware crypto-engine meeting DRC/LVS clean checks on SkyWater 130nm process with under 2.5ns critical path.',
            techStack: ['OpenLane', 'SkyWater 130nm', 'Magic VLSI', 'KLayout', 'SystemVerilog'],
            difficulty: 'Capstone',
            resumeImpact: 'Demonstrates end-to-end silicon design capabilities ready for fabrication.'
          }
        ],
        certifications: [
          {
            title: 'NASSCOM FutureSkills Prime Semiconductor VLSI Design',
            issuer: 'Ministry of Electronics & IT (MeitY) / NASSCOM',
            url: 'https://futureskillsprime.in',
            importance: 'High Value',
            description: 'Government-recognized credential supporting India Semiconductor Mission recruitment.'
          }
        ],
        placementMilestones: [
          'Crack core VLSI / Embedded placements on Day 0 / Day 1 (target 18–35 LPA).',
          'Deliver final capstone hardware demonstration in college symposium.',
          'Guide junior batches through competitive semiconductor internship selection tests.'
        ]
      }
    ]
  },

  // ==========================================
  // 4. DATA SCIENCE (CSD)
  // ==========================================
  CSD: {
    branchCode: 'CSD',
    branchName: 'Computer Science & Engineering (Data Science)',
    iconName: 'Database',
    industryTrendSummary: 'Unprecedented growth in business intelligence, real-time streaming data analytics, predictive modeling, and scalable data warehousing (Snowflake, Databricks).',
    marketOutlook2026: 'Exploding demand for Analytics Engineers, Big Data Architects, and Quantitative Analysts bridging raw databases to predictive business decisions.',
    averageFresherSalaryBracket: '₹8.0 LPA – ₹22.0 LPA',
    topCareerRoles: [
      'Data Engineer',
      'Data Scientist',
      'Business Intelligence Architect',
      'Quantitative Data Analyst'
    ],
    recommendedTechStack: ['Python', 'SQL', 'Apache Spark (PySpark)', 'dbt', 'Snowflake', 'Tableau / PowerBI', 'Airflow', 'Docker', 'PostgreSQL'],
    years: [
      {
        year: 1,
        yearName: '1st Year: Foundations in Data, SQL & Mathematical Statistics',
        theme: 'Relational Querying, Descriptive Statistics & Data Wrangling',
        focusTagline: 'Build unmatched mastery over SQL queries and exploratory data analysis.',
        skills: [
          { name: 'Advanced SQL (Window Functions, CTEs, Recursive Queries)', category: 'Core Language' },
          { name: 'Python for Data Analysis (Pandas, Polars, NumPy)', category: 'Core Language' },
          { name: 'Descriptive & Inferential Statistics', category: 'Domain & Frameworks' },
          { name: 'Data Visualization (Seaborn, Plotly, Streamlit)', category: 'Domain & Frameworks' },
          { name: 'Git & Command-Line Tools', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'E-Commerce Behavioral Segmentation & SQL Analytics Engine',
            description: 'Analysis of 1M+ user transactions calculating Customer Lifetime Value (CLV), RFM segmentation, and cohort churn rates using pure SQL.',
            techStack: ['PostgreSQL', 'Python', 'Plotly', 'Streamlit'],
            difficulty: 'Beginner',
            resumeImpact: 'Proves advanced SQL competency and commercial business intuition.'
          }
        ],
        certifications: [
          {
            title: 'Google Data Analytics Professional Certificate',
            issuer: 'Google / Coursera',
            url: 'https://grow.google/certificates/data-analytics/',
            importance: 'Essential',
            description: 'Industry benchmark certification covering end-to-end data processing.'
          }
        ],
        placementMilestones: [
          'Solve 100+ SQL LeetCode / HackerRank problems (hard category).',
          'Publish 3 rich data analysis notebooks on Kaggle with upvotes.',
          'Build strong foundation in C++ or Python DSA (100+ LeetCode problems).'
        ]
      },
      {
        year: 2,
        yearName: '2nd Year: Machine Learning, Statistical Inference & BI Tools',
        theme: 'Predictive Modeling, Feature Engineering & PowerBI Dashboards',
        focusTagline: 'Turn raw datasets into predictive statistical models with validated metrics.',
        skills: [
          { name: 'Supervised & Unsupervised Machine Learning (Scikit-Learn)', category: 'Domain & Frameworks' },
          { name: 'Feature Engineering & Cross-Validation Strategies', category: 'Domain & Frameworks' },
          { name: 'Data Warehousing Fundamentals (Star/Snowflake Schemas)', category: 'System Architecture' },
          { name: 'Enterprise PowerBI / Tableau Dashboard Design', category: 'Domain & Frameworks' },
          { name: 'Data Structures & Algorithms in Python/C++', category: 'Data Structures & Algorithms' }
        ],
        projects: [
          {
            title: 'Automated Loan Default Prediction Engine with Explainability',
            description: 'XGBoost ensemble model trained on credit history data with SHAP values for model interpretability and bias audit.',
            techStack: ['Python', 'XGBoost', 'SHAP', 'Scikit-Learn', 'FastAPI'],
            difficulty: 'Intermediate',
            resumeImpact: 'Shows understanding of financial risk metrics, ROC-AUC, and explainable AI.'
          }
        ],
        certifications: [
          {
            title: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
            issuer: 'Microsoft',
            url: 'https://learn.microsoft.com/certifications/',
            importance: 'Industry Standard',
            description: 'The definitive enterprise dashboard and business intelligence credential.'
          }
        ],
        placementMilestones: [
          'Solve 250+ LeetCode problems.',
          'Win or medal in a competitive data science hackathon.',
          'Build an end-to-end dashboard embedded in a portfolio web app.'
        ]
      },
      {
        year: 3,
        yearName: '3rd Year: Big Data Engineering, Spark, Kafka & Cloud Lakes',
        theme: 'Distributed Processing with PySpark, Orchestration & Internships',
        focusTagline: 'Scale data pipelines from gigabytes to petabytes using distributed computing.',
        skills: [
          { name: 'Distributed Data Processing with Apache Spark (PySpark)', category: 'Domain & Frameworks' },
          { name: 'Data Pipeline Orchestration with Apache Airflow', category: 'DevOps & Tools' },
          { name: 'Data Lakehouse Architecture (Delta Lake, Snowflake)', category: 'System Architecture' },
          { name: 'Streaming Data Pipelines with Apache Kafka', category: 'Domain & Frameworks' },
          { name: 'dbt (Data Build Tool) for Modern Analytics Engineering', category: 'DevOps & Tools' }
        ],
        projects: [
          {
            title: 'Real-Time Financial Fraud Detection Streaming Pipeline',
            description: 'Event-driven streaming pipeline ingesting 10k events/sec with Kafka, transforming in PySpark Streaming, and storing in Snowflake with Airflow orchestration.',
            techStack: ['Apache Kafka', 'PySpark', 'Snowflake', 'Apache Airflow', 'Docker'],
            difficulty: 'Advanced',
            resumeImpact: 'Mirrors real-world data engineering infrastructure at Uber, Netflix, and Swiggy.'
          }
        ],
        certifications: [
          {
            title: 'Databricks Certified Associate Developer for Apache Spark',
            issuer: 'Databricks',
            url: 'https://www.databricks.com/learn/certification',
            importance: 'Industry Standard',
            description: 'High-value credential proving big data distributed compute capabilities.'
          },
          {
            title: 'Snowflake SnowPro Core Certification',
            issuer: 'Snowflake',
            url: 'https://www.snowflake.com/certifications/',
            importance: 'High Value',
            description: 'Validates modern cloud data warehouse design and SQL performance.'
          }
        ],
        placementMilestones: [
          'Crack a 3rd-year summer internship in Data Science / Data Engineering.',
          'Attain 400+ LeetCode problems solved (focus on hash maps, graphs, arrays).',
          'Deploy an automated data pipeline running daily cron jobs on AWS / GCP.'
        ]
      },
      {
        year: 4,
        yearName: '4th Year: Production Data Systems, Placement Drives & Capstone',
        theme: 'Enterprise Capstone, High-CTC Analytics Placements',
        focusTagline: 'Secure premier product and consulting offers as a full-fledged data technologist.',
        skills: [
          { name: 'MLOps & Model Monitoring in Production (Evidently AI, MLflow)', category: 'DevOps & Tools' },
          { name: 'Vector Databases for Semantic Search & Analytics', category: 'Domain & Frameworks' },
          { name: 'Data Governance, Lineage & Privacy Compliance (GDPR/DPDP)', category: 'System Architecture' }
        ],
        projects: [
          {
            title: 'Scalable Multimodal Healthcare Insights Data Lakehouse',
            description: 'Unified clinical data platform correlating patient EHR records, genomic sequencing data, and radiology reports using distributed embeddings.',
            techStack: ['PySpark', 'Delta Lake', 'Airflow', 'FastAPI', 'AWS S3', 'Terraform'],
            difficulty: 'Capstone',
            resumeImpact: 'Demonstrates end-to-end data architecture for complex enterprise domains.'
          }
        ],
        certifications: [
          {
            title: 'Google Cloud Professional Data Engineer',
            issuer: 'Google Cloud',
            url: 'https://cloud.google.com/certification',
            importance: 'Industry Standard',
            description: 'Premier cloud credential for production big data pipeline design.'
          }
        ],
        placementMilestones: [
          'Target Day-1 placement drives for Data Engineer / Data Scientist roles (18–30 LPA).',
          'Deliver thesis capstone presentation and publish project whitepaper.'
        ]
      }
    ]
  }
};
