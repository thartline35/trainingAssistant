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
      content: 'Hello! I\'m here to help you with VideoGen evaluations. Ask me about specific evaluation criteria, how to handle difficult comparison cases, or any questions about applying our evaluation guidelines consistently.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<{ [key: string]: string }>({

    // === UPDATED T2V ===
    't2v-evaluation': `Text-to-Video (T2V) Evaluation Framework:

PROMPT FAITHFULNESS
- Subject Alignment: Does the video include the correct subjects exactly as described?
- Spatial Alignment: Are subjects in the correct relative positions?
- Motion Alignment: Do subjects move correctly and in the right direction?
- Camera Control: Are camera angles, zoom, or pans matching the prompt?
- Overall Prompt Faithfulness: Which video best fulfills all elements of the prompt?

VIDEO QUALITY DIMENSIONS
- Visual Appeal: Is the video aesthetically clean, without glitches or distortions?
- Temporal/Motion Quality: Is movement smooth and natural across frames?
- Object Recognition/Consistency: Are objects clear, stable, and consistent?
- Physics Adherence: Does the video follow normal real-world physics?
- Face/Emotion/Body Rendering: Are human faces, hands, and bodies rendered accurately?
- Realness: Does the video look natural and believable?

DECISION TEMPLATE
Step 1: Break prompt into checklist items (✓/✗).
Step 2: Count which video meets more items.
Step 3: If tied, check which video looks more stable/realistic.
Step 4: If both fail → Both Bad. If both pass → Both Good.
Step 5: Otherwise, select the video with fewer failures.`,

    // === NEW PV2V ===
    'pv2v-evaluation': `Prompt-to-Video (PV2V) Evaluation Framework:

INSTRUCTION FOLLOWING
- Prompt Alignment: Does the output video follow all elements of the textual prompt?
- Subject Inclusion: Are all key entities/objects present?
- Action/Behavior: Are described actions correctly depicted?
- Camera/Environment: Does setting or framing match the prompt?

VIDEO QUALITY DIMENSIONS
- Visual Clarity: Is the video free from blur, artifacts, or glitches?
- Temporal/Motion Quality: Are movements smooth and consistent?
- Object Accuracy: Are objects rendered correctly (shapes, colors, proportions)?
- Identity Preservation: Are recurring characters/subjects consistent throughout?
- Physics Adherence: Do movements and interactions respect natural physics?
- Realness: Does the video appear believable and coherent?

DECISION TEMPLATE
1. Break prompt into measurable components (who/what/where/how).
2. Score each video by component completion.
3. Count obvious technical flaws (blurring, morphing, disappearing objects).
4. Select the video that covers more prompt elements with fewer flaws.
5. If both succeed → Both Good. If both fail → Both Bad.`,

    // === UPDATED V2V ===
    'video-editing-evaluation': `Video-to-Video (V2V) Editing Evaluation Framework:

INSTRUCTION FOLLOWING
- Did the video apply the specified edit exactly as instructed?
- Fails to Edit: Did the video fail to apply any change? (Yes → Fail)

STRUCTURE PRESERVATION
- Background/Environment Preservation: Unchanged unless prompt specifies edits.
- Identity/Character Preservation: Main subject identity remains unless changed.
- Subject Motion Preservation: Subject motion stays consistent unless changed.
- Overall Structure Preservation: Layout, proportions, and scene remain intact.

EDIT VISUAL QUALITY
- Face/Hand/Body Rendering: Faces, hands, and bodies appear normal and consistent.
- Edit Visual Quality: No artifacts, flickering, or degradation introduced by edit.

DECISION TEMPLATE
Step 1: Confirm if edit instruction was applied. If neither → Both Bad.
Step 2: Compare background, identity, and motion preservation.
Step 3: Check for red flags (blur, distortions, melted faces).
Step 4: Select the video that follows instruction and preserves structure with higher visual quality.
Step 5: If both equally succeed → Both Good.`,

    // === everything else unchanged ===
    'immediate-easy-fixes': `Immediate Easy Fixes - Simple Objectivity Improvements:
    ...`,
    'quick-t2v-clarifications': `Quick Text-to-Video Clarifications:
    ...`,
    'task-requirements-fixes': `Task Requirements Crystal Clear Improvements:
    ...`,
    'complex-validation-approach': `Complex Validation Fix - Advanced Objectivity:
    ...`,
    'rejection-criteria': `Content Rejection Categories:
    ...`,
    'comparison-examples': `Video Comparison Decision Examples:
    ...`
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const systemPrompt = `You are a VideoGen Human Evaluation team lead. Use this complete knowledge base to answer evaluation questions.`;
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
  
      const data = await response.json();
      if (data?.error?.message) {
        return `Error from model: ${data.error.message}`;
      }
      return data.content?.[0]?.text ?? "No content returned.";
    } catch (error) {
      return "I apologize, but I'm having trouble connecting right now. Could you try rephrasing your question?";
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: userMessage, timestamp: new Date() }]);
    const botResponse = await generateResponse(userMessage);
    setMessages(prev => [...prev, { type: 'bot', content: botResponse, timestamp: new Date() }]);
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
      setKnowledgeBase(prev => ({ ...prev, [section]: content }));
    }
  };

  const sampleQuestions = [
    "How do I decide which video has better visual quality?",
    "When should I choose 'Both Good' vs 'Both Bad'?",
    "How do I evaluate if a video follows the prompt correctly?",
    "What makes one video's motion better than another's?",
    "How do I assess if faces and bodies look realistic?",
    "When is a video considered to 'Fail to Edit'?",
    "How do I evaluate camera control and framing?",
    "What are the red flags for obviously broken videos?",
    "How do I handle cases where videos are close in quality?",
    "When should I select 'Not Applicable' for an evaluation?",
    "How do I evaluate temporal consistency and smoothness?",
    "What counts as good subject alignment with the prompt?",
    "How do I assess if video physics look realistic?",
    "When does background preservation matter in editing tasks?",
    "How do I evaluate instruction following in video edits?"
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600" />
            VideoGen Evaluation Guide
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
                placeholder="Ask about evaluation criteria, comparison decisions, or specific guidelines..."
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
