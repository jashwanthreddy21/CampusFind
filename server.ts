import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = `You are "CampusFind AI Counselor", an expert academic counseling and admissions advisor for Indian engineering colleges.
You specialize in:
1. IITs (all 23 institutes, JEE Advanced, JoSAA cutoff trends & placements).
2. NITs (all 31 institutes, JEE Main, JoSAA/CSAB counseling, Home State vs Other State quotas).
3. IIITs (both MHRD & PPP model institutes, JEE Main).
4. Telangana Engineering Colleges (TG EAPCET / EAMCET - JNTUH, Osmania OUCE, CBIT, VNR VJIET, Vasavi, CVR, Vardhaman, GRIET, MVSR, MGIT, BVRIT, etc.).
5. Andhra Pradesh Colleges (AP EAPCET / EAMCET - AUCE, JNTUK, JNTUA, Gayatri Vidya Parishad GVP, VR Siddhartha, RVR&JC, Vishnu, AU College of Pharmaceutical Sciences AUCP, Chalapathi CLPT, Aditya ACPS, Shri Vishnu SCPB, KVSR Siddhartha VRSP, Hindu College of Pharmacy HICP, etc. offering Engineering, B.Pharm PHM & Pharm.D PHD).
6. JoSAA & State Counseling Processes:
   - "Freeze": Accept the allotted seat and exit counseling rounds.
   - "Float": Accept the allotted seat, but remain open to upgrade to ANY higher preferred college/branch in subsequent rounds.
   - "Slide": Accept the allotted seat, but only remain open to a higher preferred branch within the SAME institute.
7. Fee Structures & State Reimbursement:
   - Telangana ePASS: 100% tuition reimbursement for ranks < 10,000 in eligible categories; capped reimbursement (~₹35,000) for ranks > 10,000 in private colleges.
   - AP Jagananna Vidya Deevena (JVD): Full tuition fee reimbursement for eligible categories and income limits.

Guidelines:
- Give clear, structured, and realistic advice with approximate closing rank brackets for Open Category (OC/General) and reserved categories if asked.
- When referencing specific colleges, mention their popular short form or counseling code (e.g., CBIT, VNRV, VASV, OUCE, JNTH, NIT Warangal, IIT Bombay).
- Keep formatting clean and readable using bold headings and bullet points.
- If a student asks for recommendation based on their rank and category, suggest 3-5 realistic "Safe", "Target", and "Ambitious" college choices.
- Always be encouraging, realistic, and objective.`;

// Intelligent counselor fallback if Gemini API key is missing or encounters a network error
function generateFallbackCounselorResponse(query: string, examStream?: string): string {
  const q = query.toLowerCase();

  if (q.includes('freeze') || q.includes('float') || q.includes('slide')) {
    return `### JoSAA Seat Acceptance Options Explained:

1. **❄️ Freeze**:
   - You accept the seat and branch allotted to you in the current round.
   - You **do not** wish to participate in subsequent rounds for higher choices.
   - Your admission in this institute and branch is finalized.

2. **🌊 Float**:
   - You accept the currently allotted seat to secure it.
   - If a seat in a **higher preference** (in **ANY college/branch**) is allotted in upcoming rounds, you will be upgraded.
   - If not upgraded, your current seat remains intact.

3. **🛝 Slide**:
   - You accept the currently allotted seat.
   - You only want to upgrade to a **higher branch within the SAME institute**.
   - You will not be considered for any other colleges.

💡 **Strategy Tip**: Unless you are 100% satisfied with your branch and college (or got your #1 choice), select **Float** to keep opportunities open!`;
  }

  if (q.includes('fee') || q.includes('reimbursement') || q.includes('scholarship') || q.includes('epass')) {
    return `### 💰 Tuition Fees & Government Reimbursement Guidelines:

1. **Telangana (TG EAPCET / ePASS)**:
   - **Ranks below 10,000**: Eligible OC-EWS, BC, SC, ST candidates with parental annual income < ₹2,00,000 (rural) or < ₹1,50,000 (urban) receive **100% full tuition fee reimbursement** even in top private autonomous colleges (CBIT, VNR, Vasavi).
   - **Ranks above 10,000**: Government reimburses a fixed baseline grant of approx **₹35,000 per year**. The remaining fee (₹70,000 - ₹1,40,000+) must be paid by the student.
   - **SC/ST candidates**: Eligible for 100% reimbursement irrespective of rank if income criteria is met.

2. **Andhra Pradesh (Jagananna Vidya Deevena - JVD)**:
   - Full tuition fee assistance is deposited directly to the mother's account for eligible students meeting income (< ₹2.5 LPA) and landholding criteria.

3. **IITs & NITs**:
   - 100% tuition waiver for SC/ST/PwD.
   - Full tuition waiver for General/OBC students with family income < ₹1 LPA.
   - 2/3rd tuition waiver for family income between ₹1 LPA and ₹5 LPA.`;
  }

  if (q.includes('cbit') || q.includes('vnr') || q.includes('vasavi')) {
    return `### 🏆 Top Telangana Engineering Colleges Comparison:

- **CBIT (Chaitanya Bharathi Institute of Technology, Gandipet)**:
  - **Code**: \`CBIT\` | **Est**: 1979 | Autonomous | NAAC A++
  - **CSE OC Closing Rank**: ~1,200 - 1,800
  - **Tuition Fee**: ₹1,40,000/year
  - **Placements**: 85-90% placed, Top ₹50+ LPA, Avg ₹9.2 LPA. Known for strong alumni network.

- **VNR VJIET (Vignana Jyothi, Bachupally)**:
  - **Code**: \`VNRV\` | **Est**: 1995 | Autonomous | NAAC A++
  - **CSE OC Closing Rank**: ~1,500 - 2,200
  - **Tuition Fee**: ₹1,35,000/year
  - **Placements**: Superb coding culture, Avg ₹8.8 LPA, top tech recruiters (Amazon, Oracle, JP Morgan).

- **Vasavi College of Engineering (Ibrahimbagh)**:
  - **Code**: \`VASV\` | **Est**: 1981 | Autonomous | NAAC A++
  - **CSE OC Closing Rank**: ~1,800 - 2,600
  - **Tuition Fee**: ₹1,40,000/year
  - **Placements**: High academic discipline, Avg ₹8.5 LPA, consistent software hiring.`;
  }

  if (q.includes('nit warangal') || q.includes('iit hyderabad')) {
    return `### 🏛️ IIT Hyderabad vs NIT Warangal:

| Feature | IIT Hyderabad (IITH) | NIT Warangal (NITW) |
|---|---|---|
| **Institute Type** | 2nd Gen Premier IIT | Top 3 National Institute of Technology |
| **Location** | Kandi, Sangareddy, Telangana | Kazipet, Hanamkonda, Telangana |
| **Admission** | JEE Advanced (JoSAA) | JEE Main (JoSAA - HS/OS Quotas) |
| **CSE Cutoff** | ~600 - 750 (All India) | ~2,500 (OS) / ~3,500 (HS) |
| **Avg Package** | ₹20.5 - 22 LPA | ₹17.5 - 19 LPA |
| **Strengths** | Cutting-edge research, fractal academics | Historic legacy, huge campus & alumni network |`;
  }

  if (q.includes('rank') || q.includes('cutoff') || q.includes('predict') || q.includes('recommend')) {
    return `### 🎯 College Recommendation Guidance:

To give you the most accurate college choices, please share:
1. **Your Rank** (e.g., 5,500 or 22,000)
2. **Exam & Category** (e.g., TS EAMCET / AP EAMCET / JEE Main, Category: OC / BC / SC / ST / EWS)
3. **Gender** (Boys / Girls quota)
4. **Preferred Branches** (e.g., CSE, IT, AI&ML, ECE)

**General TS EAMCET OC CSE Brackets**:
- **Top 2,500**: JNTUH, OUCE, CBIT, VNR VJIET
- **2,500 - 6,000**: Vasavi, CVR, Vardhaman, GRIET
- **6,000 - 15,000**: MVSR, MGIT, BVRIT, KMIT, G. Narayanamma (Women)
- **15,000 - 30,000**: IARE, SNIST, CMRK, MLRIT, Vardhaman (ECE/CSD/CSM)`;
  }

  return `### 👋 Welcome to CampusFind AI Counselor!

I'm here to help you navigate engineering admissions across **IITs**, **NITs**, **IIITs**, and **TS / AP EAMCET** colleges.

**What I can help you with:**
- 🎯 **College Recommendations**: Share your rank and category to discover Safe, Target, and Dream colleges.
- 📊 **Cutoff Analysis**: Detailed closing ranks for CSE, IT, ECE, Data Science, and core branches.
- ⚖️ **College Comparisons**: CBIT vs VNR, NIT Warangal vs IIT Hyderabad, AUCE vs JNTUK.
- 📋 **Counseling Strategy**: Understanding **Freeze**, **Float**, **Slide**, and optimal web option filling.
- 💰 **Tuition Fees & ePASS**: Fee reimbursement rules, government schemes, and financial planning.

*What college or counseling question would you like to explore today?*`;
}

// Fallback Branch Recommender Engine if offline or Gemini API key is missing
function generateFallbackBranchRecommendations(college: any, subjects: string[], studentBackground?: any) {
  const normSubjects = subjects.map((s) => s.toLowerCase());
  const collegeCourses: string[] = college.courses || college.cutoffs?.map((c: any) => c.branchCode) || ['CSE', 'CSM', 'CSD', 'IT', 'ECE', 'EEE', 'MECH'];
  const avgCtc = college.placement?.averageLPA || 7.2;
  const highestCtc = college.placement?.highestLPA || 24;
  const topCompanies = (college.placement?.topRecruiters || ['Amazon', 'Microsoft', 'TCS Digital', 'Qualcomm']).slice(0, 3).join(', ');

  const branchCatalog: Record<string, {
    name: string;
    keywords: string[];
    specializations: string[];
    skills: string[];
    roles: string[];
    baseScore: number;
    placementBoost: number;
  }> = {
    CSM: {
      name: 'Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'data', 'math', 'python', 'vision', 'nlp'],
      specializations: ['Generative AI & LLMs', 'Computer Vision', 'Deep Learning Systems', 'Reinforcement Learning'],
      skills: ['Python', 'PyTorch / TensorFlow', 'Hugging Face Transformers', 'Vector Databases (Pinecone/Milvus)'],
      roles: ['AI/ML Engineer', 'Computer Vision Specialist', 'Applied AI Scientist'],
      baseScore: 82,
      placementBoost: 8,
    },
    CSD: {
      name: 'Computer Science & Engineering (Data Science)',
      keywords: ['data', 'data science', 'analytics', 'statistics', 'math', 'probability', 'big data', 'database', 'sql'],
      specializations: ['Predictive Modeling', 'Big Data Engineering', 'Business Intelligence', 'Data Architecture'],
      skills: ['SQL', 'Python / R', 'Apache Spark', 'Tableau / PowerBI', 'Scikit-learn'],
      roles: ['Data Scientist', 'Data Analytics Consultant', 'Quantitative Analyst'],
      baseScore: 80,
      placementBoost: 7,
    },
    CSE: {
      name: 'Computer Science & Engineering',
      keywords: ['software', 'algorithms', 'web', 'cloud', 'cybersecurity', 'programming', 'distributed systems', 'networks', 'math', 'python', 'data structures'],
      specializations: ['Full Stack Systems', 'Cloud & Distributed Computing', 'Cybersecurity', 'High-Performance Algorithms'],
      skills: ['Data Structures & Algorithms', 'C++ / Java', 'Docker & Kubernetes', 'System Design'],
      roles: ['Software Development Engineer (SDE)', 'Cloud Architect', 'Cybersecurity Analyst'],
      baseScore: 84,
      placementBoost: 9,
    },
    IT: {
      name: 'Information Technology',
      keywords: ['cloud', 'devops', 'software', 'database', 'networks', 'information', 'web', 'cybersecurity'],
      specializations: ['DevOps & Cloud Infrastructure', 'Enterprise Web Systems', 'Network Engineering', 'Database Administration'],
      skills: ['Linux & Bash', 'AWS / Azure', 'JavaScript / TypeScript', 'PostgreSQL'],
      roles: ['DevOps Engineer', 'Full Stack Developer', 'Cloud Infrastructure Engineer'],
      baseScore: 78,
      placementBoost: 6,
    },
    ECE: {
      name: 'Electronics & Communication Engineering (VLSI & Embedded Systems)',
      keywords: ['vlsi', 'chip design', 'electronics', 'semiconductor', 'hardware', 'embedded', 'iot', 'signals', 'sensors', 'circuits', 'fpga'],
      specializations: ['VLSI Digital / Analog Design', 'FPGA Prototyping', 'Embedded Firmware & IoT', '5G / Wireless Systems'],
      skills: ['Verilog / SystemVerilog', 'C / C++ for Embedded', 'EDA Tools (Cadence/Synopsys)', 'MATLAB'],
      roles: ['VLSI Design Engineer', 'ASIC Verification Engineer', 'Embedded Systems Architect'],
      baseScore: 80,
      placementBoost: 7,
    },
    EEE: {
      name: 'Electrical & Electronics Engineering',
      keywords: ['power', 'electrical', 'renewable energy', 'electric vehicles', 'ev', 'energy', 'circuits', 'control systems'],
      specializations: ['Electric Vehicle Powertrain Design', 'Smart Grid & Renewable Energy', 'Power Electronics', 'Industrial Automation'],
      skills: ['MATLAB / Simulink', 'Power System Analysis', 'Battery Management Systems (BMS)', 'PLC & SCADA'],
      roles: ['EV Systems Engineer', 'Power Electronics Specialist', 'Energy Consultant'],
      baseScore: 72,
      placementBoost: 4,
    },
    MECH: {
      name: 'Mechanical Engineering (Robotics & Automation)',
      keywords: ['robotics', 'automation', 'cad', 'cam', 'thermodynamics', 'manufacturing', 'mechanical', 'design', 'automotive'],
      specializations: ['Robotics & Mechatronics', 'CAD/CAM Finite Element Analysis', 'Additive Manufacturing', 'Electric Vehicle Chassis'],
      skills: ['SolidWorks / CATIA', 'ANSYS Simulation', 'ROS (Robot Operating System)', 'CNC Programming'],
      roles: ['Robotics Automation Engineer', 'Mechanical Design Engineer', 'R&D Mechatronics Specialist'],
      baseScore: 70,
      placementBoost: 3,
    },
  };

  const scoredRecommendations: any[] = [];

  // Evaluate each branch that the college offers or general engineering list
  const activeCodes = Object.keys(branchCatalog).filter((code) => 
    collegeCourses.includes(code) || collegeCourses.some((c: string) => c.toUpperCase().includes(code))
  );

  const branchesToEvaluate = activeCodes.length >= 3 ? activeCodes : Object.keys(branchCatalog);

  for (const code of branchesToEvaluate) {
    const meta = branchCatalog[code];
    let matchedKeywordCount = 0;

    for (const kw of meta.keywords) {
      if (normSubjects.some((s) => s.includes(kw) || kw.includes(s))) {
        matchedKeywordCount += 1;
      }
    }

    // Dynamic match score computation
    const relevanceFraction = Math.min(1, matchedKeywordCount / Math.max(1, Math.min(3, normSubjects.length)));
    const calculatedScore = Math.min(98, Math.max(52, Math.round(meta.baseScore + (relevanceFraction * 14) + meta.placementBoost - (relevanceFraction === 0 ? 18 : 0))));

    const fitLevel = calculatedScore >= 88 ? 'Top Recommendation' : calculatedScore >= 76 ? 'Strong Alternative' : 'Promising Core Choice';

    const topKeywordsMatched = meta.keywords.filter((kw) => normSubjects.some((s) => s.includes(kw) || kw.includes(s)));
    const matchReason = topKeywordsMatched.length > 0
      ? `Directly capitalizes on your passion for ${topKeywordsMatched.slice(0, 3).join(', ')}.`
      : `Broad foundation aligning with analytical engineering disciplines and technological innovation.`;

    const placementReason = `Graduates of ${code} at ${college.name} benefit from an average CTC of ₹${avgCtc} LPA (peak ₹${highestCtc} LPA), with premier recruiters like ${topCompanies}.`;

    scoredRecommendations.push({
      branchCode: code,
      branchName: meta.name,
      matchScore: calculatedScore,
      fitLevel,
      interestAlignment: matchReason,
      placementOutlook: placementReason,
      specializations: meta.specializations,
      keySkillsToLearn: meta.skills,
      targetRoles: meta.roles,
    });
  }

  scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

  const topBranch = scoredRecommendations[0];
  const advice = `Based on your interest in ${subjects.slice(0, 3).join(', ')}, ${topBranch?.branchName || 'Computer Science'} emerges as your highest matching track at ${college.name}. Given the college's verified placement track record (₹${avgCtc} LPA average package with recruiters like ${topCompanies}), focusing on practical project portfolios and core semester coursework will position you well for campus placement.`;

  return {
    overallAdvice: advice,
    recommendations: scoredRecommendations,
  };
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // Health check endpoint
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'CampusFind TS & AP EAMCET Portal',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // AI Chatbot endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, messages, context } = req.body;
      const userQuery = message || (messages && messages[messages.length - 1]?.content) || '';

      if (!userQuery.trim()) {
        res.status(400).json({ error: 'Message content is required.' });
        return;
      }

      // If Gemini client is available, generate response via Gemini 3.8 Flash
      if (ai && process.env.GEMINI_API_KEY) {
        try {
          // Construct conversation history for Gemini
          const rawHistory: Array<{ role: string; content: string }> = Array.isArray(messages) && messages.length > 0
            ? messages
            : [{ role: 'user', content: userQuery }];

          const formattedContents = rawHistory.map((item) => ({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.content }],
          }));

          // Context prompt extension
          let dynamicInstruction = SYSTEM_INSTRUCTION;
          if (context) {
            const contextDetails = [
              context.examStream ? `Current Exam Stream: ${context.examStream}` : '',
              context.selectedState ? `Target State: ${context.selectedState}` : '',
              context.userRank ? `User Rank: ${context.userRank}` : '',
              context.userCategory ? `User Category: ${context.userCategory}` : '',
            ].filter(Boolean).join(', ');

            if (contextDetails) {
              dynamicInstruction += `\n[User Context: ${contextDetails}]`;
            }
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: formattedContents,
            config: {
              systemInstruction: dynamicInstruction,
              temperature: 0.7,
            },
          });

          const replyText = response.text || generateFallbackCounselorResponse(userQuery, context?.examStream);
          res.status(200).json({ reply: replyText });
          return;
        } catch (apiError: any) {
          console.warn('[Gemini API Warning] Falling back to structured counselor knowledge:', apiError?.message || apiError);
          const fallbackReply = generateFallbackCounselorResponse(userQuery, context?.examStream);
          res.status(200).json({ reply: fallbackReply });
          return;
        }
      }

      // If Gemini API key is not configured, use the built-in intelligent counselor knowledge base
      const fallbackReply = generateFallbackCounselorResponse(userQuery, context?.examStream);
      res.status(200).json({ reply: fallbackReply });
    } catch (err: any) {
      console.error('[Server Error in /api/chat]:', err);
      res.status(500).json({
        error: 'Failed to process chat message.',
        details: err?.message || 'Internal server error',
      });
    }
  });

  // AI-Powered Branch Recommender endpoint
  app.post('/api/recommend-branches', async (req: Request, res: Response) => {
    try {
      const { college, subjectsOfInterest, studentBackground } = req.body;

      if (!college || !Array.isArray(subjectsOfInterest) || subjectsOfInterest.length === 0) {
        res.status(400).json({ error: 'College details and at least one subject of interest are required.' });
        return;
      }

      // If Gemini is available, call Gemini 3.8 Flash
      if (ai && process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
College Profile:
- College Name: ${college.name} (${college.code})
- Ownership & Type: ${college.ownership || 'Private'}, ${college.type || 'Autonomous'}
- Affiliation: ${college.affiliation || 'State University'}
- Offered Courses: ${JSON.stringify(college.courses || college.cutoffs?.map((c: any) => c.branchCode) || ['CSE', 'CSM', 'CSD', 'IT', 'ECE', 'EEE', 'MECH'])}
- Placement Performance:
  - Average CTC: ₹${college.placement?.averageLPA || 6.5} LPA
  - Highest CTC: ₹${college.placement?.highestLPA || 25} LPA
  - Median CTC: ₹${college.placement?.medianLPA || 5.8} LPA
  - Placement Percentage: ${college.placement?.placementPercentage || 85}%
  - Notable Recruiters: ${JSON.stringify(college.placement?.topRecruiters || ['TCS', 'Infosys', 'Cognizant', 'Amazon'])}

Student Background:
- Saved Subjects of Interest: ${JSON.stringify(subjectsOfInterest)}
- EAMCET Rank: ${studentBackground?.eamcetRank || 'Not specified'}
- Category: ${studentBackground?.category || 'OC'}
- Weighted Merit Score: ${studentBackground?.meritScore || 'Not specified'}

Task:
You are an expert engineering academic dean and career counselor.
Analyze the student's saved subjects of interest against the engineering branches and placement performance of ${college.name}.
Suggest and rank the most suitable branches offered at this college (e.g., CSE, CSM - AI & ML, CSD - Data Science, IT, ECE - Electronics / VLSI, EEE, etc.).
Calculate a realistic match score (50-99%) based on subject overlap and college placement strengths.

Output strictly valid JSON matching this schema:
{
  "overallAdvice": "A clear, personalized 2-3 sentence strategic summary evaluating how the student's interests align with ${college.name}'s industry placement strengths.",
  "recommendations": [
    {
      "branchCode": "CSM",
      "branchName": "Computer Science & Engineering (Artificial Intelligence & Machine Learning)",
      "matchScore": 96,
      "fitLevel": "Top Recommendation",
      "interestAlignment": "Strong synergy with your interest in Neural Networks and Machine Learning algorithms.",
      "placementOutlook": "With ${college.name}'s ₹${college.placement?.averageLPA || 8} LPA average package, AI/ML graduates are heavily recruited by tech companies.",
      "specializations": ["Deep Learning", "Generative AI", "Computer Vision", "LLM Fine-tuning"],
      "keySkillsToLearn": ["Python", "PyTorch", "FastAPI", "Vector Databases"],
      "targetRoles": ["AI/ML Engineer", "Data Scientist", "Research Analyst"]
    }
  ]
}
`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: 'You are CampusFind AI Branch Recommender. Return strictly parseable JSON without markdown ticks or formatting codeblocks.',
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          const rawText = response.text || '';
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanedText);

          if (parsed && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            res.status(200).json(parsed);
            return;
          }
        } catch (apiError: any) {
          console.warn('[Gemini API Branch Recommender Warning] Falling back to rule-based engine:', apiError?.message || apiError);
        }
      }

      // Deterministic Fallback Recommender Engine
      const fallbackResult = generateFallbackBranchRecommendations(college, subjectsOfInterest, studentBackground);
      res.status(200).json(fallbackResult);
    } catch (err: any) {
      console.error('[Server Error in /api/recommend-branches]:', err);
      res.status(500).json({
        error: 'Failed to generate branch recommendations.',
        details: err?.message || 'Internal server error',
      });
    }
  });

  // Client Static Serving / Dev Middleware
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to transformed index.html for SPA routes
    app.use(async (req: Request, res: Response, next) => {
      if (req.method !== 'GET') return next();
      // Skip API routes
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next();
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: '1d',
        index: 'index.html',
      }));

      app.use((_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.use((_req: Request, res: Response) => {
        res.status(200).send('CampusFind Application is starting. Please refresh shortly.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CampusFind platform running at http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
