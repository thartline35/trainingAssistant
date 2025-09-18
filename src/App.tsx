import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Video, Upload } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Hello! I\'m your VideoGen Human Evaluation Assistant. I can help you understand and apply the evaluation guidelines for text-to-video and video editing AI models. Ask me about comparison decisions, evaluation criteria, instruction writing, or any questions about the VideoGen evaluation framework!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<{ [key: string]: string }>({
    't2v-evaluation': `Text-to-Video Evaluation Framework:
    
    PROMPT FAITHFULNESS:
    - Subject Alignment: How accurately the video depicts subjects described in prompt
    - Spatial Alignment: Accuracy of subjects' relative positions per prompt
    - Motion Alignment: Accuracy of subjects' movements per prompt description
    - Camera Control: Camera angles, movements, framing matching prompt requirements
    
    VIDEO QUALITY DIMENSIONS:
    - Visual Appealing: Aesthetic attractiveness and visual appeal
    - Temporal/Motion Quality: Motion smoothness and natural dynamic changes
    - Object Recognition/Consistency: Clear, consistently rendered objects
    - Real-world Physics: Accurate physics and object interactions
    - Face/Emotion/Body Rendering: Quality of human features and movements
    - Camera Control: Camera movement, framing, transitions quality
    - Realness: Natural, lifelike, believable appearance and movement
    
    EVALUATION OPTIONS: Video 1, Video 2, Both Good, Both Bad, Not Applicable`,

    'immediate-easy-fixes': `Immediate Easy Fixes - Simple Objectivity Improvements:
    
    1. CHECKLIST APPROACH:
    Instead of "Which video better follows instruction?"
    Use: Break instruction into components, score each (e.g., ___/3)
    
    2. SIMPLE COUNTING RULES:
    Count background objects that shouldn't change
    Winner: Video that preserved more objects
    
    3. BINARY YES/NO QUESTIONS:
    Replace "Better preserves identity" with:
    - Can you recognize same person? Y/N
    - Same clothes (unless instruction changed)? Y/N
    - Same hair color (unless instruction changed)? Y/N
    
    4. VISUAL QUALITY RED FLAGS:
    Check problems: Melted faces, wrong finger count, blurry, flickering
    Winner: Fewer red flags
    
    5. QUICK DECISION TREE:
    - Did both do instruction? → Count checklist items
    - Only one did instruction? → That one wins  
    - Neither did instruction? → Both Bad
    - Both look broken? → Both Bad`,

    'quick-t2v-clarifications': `Quick Text-to-Video Clarifications:
    
    1. PROMPT FAITHFULNESS AS MATCHING:
    Break prompt into elements, create checklist for each video
    Example: "Chef made pancake, put cream on it"
    ✓ Chef present ✓ Pancake present ✓ Cream present ✓ Cream going ON pancake
    
    2. SPATIAL/MOTION COUNTING:
    Spatial: "Cat sits NEXT TO dog" → Check beside each other, same height, not stacked
    Motion: Check right thing moving, right way, right direction
    
    3. VIDEO QUALITY RED FLAGS:
    Blurry, weird colors, shape-changing objects, disappearing things, melted faces, too dark
    
    4. PHYSICS COMMON SENSE:
    Things fall down, heavy objects don't float, animals move correctly, normal walking
    
    5. FACE/BODY SIMPLE RULES:
    Normal face, right number features, 5 fingers each hand, no morphing, realistic movement
    
    DECISION TEMPLATE:
    Step 1: Did video show what prompt asked? Yes/No
    Step 2: Count obvious problems in each
    Step 3: If tied, pick more normal/realistic looking`,

    'task-requirements-fixes': `Task Requirements Crystal Clear Improvements:
    
    1. CONCRETE CREATIVITY EXAMPLES:
    Character: Replace clothes with superhero costume, add accessories, change hair color
    Environment: Kitchen→spaceship, add floating balloons, sunny→stormy night  
    Objects: Coffee cup→glowing potion, bicycle→motorcycle, add wings to car
    
    2. MAIN SUBJECT SIMPLE RULES:
    = Thing taking most screen space for longest time
    Test: What you look at first? What's center most? First thing you'd describe?
    
    3. PRIMARY OBJECTS CHECKLIST:
    ☐ Person holding in hands ☐ Touching with body ☐ Sitting/standing on ☐ Using as tool
    
    4. ENVIRONMENT CHANGE CATEGORIES:
    Indoor↔outdoor, background changes, add/remove objects, day↔night, floor changes
    
    5. CAMERA FRAMING RULES:
    Extreme Close-up: Only face/hands
    Close-up: Head and shoulders
    Medium: Waist up
    Wide: Full body + background
    
    6. CHANGE vs DESCRIPTION FIX:
    CORRECT: [Action Word] + [What] + [How different]
    MUST start with: Add/Remove/Replace/Change
    
    7. TIMESTAMP RULES:
    USE for: Camera movements, motion changes, text appearing
    DON'T USE for: Clothing changes, background changes, object additions
    Format: MM:SS (like 00:05)`,
    
    'video-editing-evaluation': `Video Editing Evaluation Framework:
    
    INSTRUCTION FOLLOWING:
    - How well output video follows the given edit instruction
    - Fails to Edit: Check if video contains no edit at all
    
    STRUCTURE PRESERVATION:
    - Background/Environment Preservation: Maintains original background when not edited
    - Identity/Character Preservation: Preserves main character appearance when not changed
    - Subject Motion Preservation: Maintains subject motion when not specified to change
    - Overall Structure Preservation: Preserves layouts, objects, motions except per instruction
    
    EDIT VISUAL QUALITY:
    - Face/Hand/Body Rendering: Quality of human feature rendering
    - Edit Visual Quality: Preservation of input video quality, avoiding artifacts
    
    EVALUATION OPTIONS: Video 1, Video 2, Both Good, Both Bad, Not Applicable`,

    'complex-validation-approach': `Complex Validation Fix - Advanced Objectivity:
    
    1. INSTRUCTION FOLLOWING IMPROVEMENTS:
    - Checklist approach: Break instructions into measurable components
    - Binary completion scoring: Yes/No for each element
    - Quantitative measures: Color distance metrics (Delta E), count accuracy, spatial measurements
    
    2. STRUCTURE PRESERVATION METRICS:
    - Pixel-level: SSIM for unchanged regions
    - Object detection: Count preserved vs altered objects
    - Geometric: Compare spatial relationships, proportions
    - Motion analysis: Optical flow for motion preservation
    
    3. EDIT VISUAL QUALITY TECHNICAL METRICS:
    - Blurriness: Laplacian variance
    - Noise: Signal-to-noise ratio  
    - Artifacts: JPEG quality assessment
    - Temporal flickering: Frame-to-frame consistency
    - Edge bleeding: Color spillover measurement
    
    4. QUANTITATIVE SCORING SYSTEM:
    Instruction Following: 40% (component completion, accuracy 0-100)
    Structure Preservation: 35% (SSIM score, object preservation rate)
    Visual Quality: 25% (technical metrics average)
    
    5. DECISION THRESHOLDS:
    Both score >80%: Both Good
    Difference <10%: Both Good
    One >70%, other <50%: Clear winner
    Both <50%: Both Bad`,
    
    'rejection-criteria': `Content Rejection Categories:
    
    TEXT-TO-VIDEO & VIDEO EDITING:
    - Incomplete prompt: Lacks essential information or context
    - Videos not loaded: Media fails to load or isn't visible
    - Non-English prompt: Prompt not written in English
    - Prompt/video mismatch: (Video editing) Prompt doesn't match video content
    - Violating content: Content violating platform community standards
    
    VIOLATING CONTENT PROTOCOL:
    1. Escalate Job ID immediately to manager
    2. Reject job if uncomfortable reviewing
    3. Use CO Contact Form for routing violations
    
    Examples: Sexual content involving minors, human trafficking, violence threats, suicide promotion, terrorist content, bullying, hate speech`,
    
    'comparison-examples': `Video Comparison Decision Examples:
    
    SUBJECT ALIGNMENT:
    - "Video 1 presents the jaguar, but Video 2 does not" → Video 1
    - "Chef putting cream on pancake in Video 1, cream already on in Video 2" → Video 1
    
    CAMERA CONTROL:
    - "Video 2 zoomed in, doesn't align with static shot requirement" → Video 1
    - "Only Video 1 follows the rotating shot instruction" → Video 1
    
    VISUAL QUALITY:
    - "Video 1 has more detailed and rich background" → Video 1
    - "Video 2 person/clothes blend into background" → Video 1
    - "Excessive saturation in Video 2 makes it unnatural" → Video 1
    
    TEMPORAL QUALITY:
    - "Video 1 presents longer motion trajectory, more complete" → Video 1
    - "Video 2 presents severe morphing effect" → Video 1
    
    PHYSICS ADHERENCE:
    - "Maple leaf falling trajectory more natural in Video 1" → Video 1
    - "Wings expected to flap during flight, Video 2 motionless" → Video 1`
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantKnowledge = (query: string) => {
    const lowerQuery = query.toLowerCase();
    let relevantSections: { section: string; content: string }[] = [];
    
    Object.entries(knowledgeBase).forEach(([key, content]) => {
      if (lowerQuery.includes(key.replace('-', ' ')) || 
          lowerQuery.includes('comparison') || 
          lowerQuery.includes('video') ||
          lowerQuery.includes('training') ||
          lowerQuery.includes('ai')) {
        relevantSections.push({ section: key, content });
      }
    });
    
    return relevantSections;
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Find relevant knowledge base sections
    const relevantInfo = findRelevantKnowledge(userMessage);
    
    // Simulate API call to Claude with context
    const systemPrompt = `You are a specialized assistant for VideoGen human evaluation projects. You help team members understand current evaluation guidelines AND proposed improvements to make evaluations more objective and consistent. Use this knowledge base to answer questions:

${relevantInfo.map(info => `${info.section.toUpperCase()}:\n${info.content}`).join('\n\n')}

You are an expert in:
1. Current Text-to-Video evaluation criteria (prompt faithfulness, video quality, overall preference)
2. Current Video editing evaluation framework (instruction following, structure preservation, visual quality)  
3. IMMEDIATE EASY FIXES: Simple approaches to make evaluations more objective (checklists, binary questions, red flags)
4. QUICK T2V CLARIFICATIONS: Practical improvements for text-to-video evaluations
5. TASK REQUIREMENTS FIXES: Clear guidelines for instruction writing and creativity
6. COMPLEX VALIDATION APPROACH: Advanced technical solutions for evaluation objectivity
7. Making comparison decisions between Video 1 vs Video 2 using improved methods

When answering comparison questions like "what if video 1 is better in 3 areas and video 2 is better in 3 areas":
- Reference both current evaluation methods AND improved approaches
- Explain how the easy fixes (checklists, counting rules) can resolve ties
- Show the decision trees and binary approaches that reduce subjectivity
- Provide examples from both current guidelines and improvement frameworks

For evaluation improvement questions:
- Distinguish between immediate easy fixes (80% objectivity benefit, simple implementation) vs complex validation (more comprehensive but time-consuming)
- Provide concrete examples of how to convert subjective evaluations to objective checklists
- Explain implementation recommendations and trade-offs

Always be practical, reference specific examples from the guidelines, and help evaluators understand both current practices and how to improve them for more consistent, objective results.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "system", 
              content: systemPrompt
            },
            { 
              role: "user", 
              content: userMessage 
            }
          ]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      return "I apologize, but I'm having trouble connecting to my knowledge base right now. Could you try rephrasing your question? I can help with text-to-video, video-to-video, and custom video editing AI training questions.";
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Generate and add bot response
    const botResponse = await generateResponse(userMessage);
    
    setMessages(prev => [...prev, {
      type: 'bot',
      content: botResponse,
      timestamp: new Date()
    }]);
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addKnowledgeSection = () => {
    const section = prompt("Enter knowledge section name (e.g., 'new-technique'):");
    const content = prompt("Enter the content for this section:");
    
    if (section && content) {
      setKnowledgeBase(prev => ({
        ...prev,
        [section]: content
      }));
    }
  };

  const sampleQuestions = [
    "What if video 1 is better than video 2 in 3 areas and video 2 is better than video 1 in 3 areas?",
    "How can I make evaluations more objective using the immediate easy fixes?",
    "What's the difference between the easy fixes and complex validation approach?",
    "How do I turn prompt faithfulness into simple matching checklists?",
    "What are the red flag visual quality problems to look for?",
    "How should I write video editing instructions with clear action words?",
    "What's the proper way to use timestamps in temporal vs non-temporal changes?",
    "How do I implement the binary yes/no approach for identity preservation?",
    "What are concrete examples of creative changes for video editing tasks?",
    "How do I use the quick decision tree for evaluation comparisons?"
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            VideoGen Evaluation Assistant
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Knowledge Base
            </h3>
            <div className="space-y-2">
              {Object.keys(knowledgeBase).map(section => (
                <div key={section} className="text-xs bg-blue-50 px-3 py-2 rounded-md">
                  {section.replace('-', ' ').toUpperCase()}
                </div>
              ))}
            </div>
            <button 
              onClick={addKnowledgeSection}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Add Knowledge Section
            </button>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Sample Questions</h3>
            <div className="space-y-2">
              {sampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-xs text-left text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md w-full"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-2xl rounded-lg px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-white text-gray-800 border border-gray-200 mr-12'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mr-12">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your video AI training projects..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;