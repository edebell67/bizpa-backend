import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Mic, 
  Search, 
  Trash2, 
  Undo2, 
  FileText, 
  Receipt, 
  CreditCard, 
  Image as ImageIcon, 
  StickyNote, 
  Volume2,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  Clock,
  Briefcase,
  Quote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  BellRing,
  Sun,
  Moon,
  Users
} from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Preferences } from '@capacitor/preferences';

const API_BASE_URL = process.env.REACT_APP_API_URL || `https://bizpa-ede-proxy.loca.lt/api/v1`;
// const API_BASE_URL = process.env.REACT_APP_API_URL || `https://wet-months-call.loca.lt/api/v1`;
// const API_BASE_URL = process.env.REACT_APP_API_URL || `http://192.168.1.110:5055/api/v1`;
// const API_BASE_URL = process.env.REACT_APP_API_URL || `https://bizpa-api.onrender.com/api/v1`;

const USERS = [
  { id: '00000000-0000-0000-0000-000000000000', name: 'Default User', icon: '👤', email: 'default@bizpa.local' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Alice (Owner)', icon: '👩‍💼', email: 'alice@bizpa.local' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Bob (Contractor)', icon: '👨‍🔧', email: 'bob@bizpa.local' }
];

// Mobile-Optimized CSS
const styles = `
  :root {
    --primary: #6200ee;
    --success: #28a745;
    --danger: #dc3545;
    --warning: #ffc107;
    --dark: #1a1a1a;
    --muted: #6c757d;
    
    /* Default Light Theme */
    --bg-app: #f8f9fa;
    --bg-card: #ffffff;
    --text-main: #1a1a1a;
    --text-muted: #6c757d;
    --border: #eeeeee;
    --nav-bg: #ffffff;
  }

  [data-theme='dark'] {
    --bg-app: #0a0a0a;
    --bg-card: #1a1a1a;
    --text-main: #f8f9fa;
    --text-muted: #a0a0a0;
    --border: #333333;
    --nav-bg: #1a1a1a;
  }

  body { 
    background-color: var(--bg-app); 
    color: var(--text-main);
    transition: background-color 0.3s, color 0.3s;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .momentum-bar { 
    background: linear-gradient(135deg, #6200ee 0%, #3700b3 100%); 
    border-radius: 24px; 
    padding: 24px; 
    color: white;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(98, 0, 238, 0.3);
  }
  
  .delta-up { color: #00e676; font-weight: bold; }
  .delta-down { color: #ff5252; font-weight: bold; }

  .attention-panel {
    background: rgba(220, 53, 69, 0.05);
    border: 1px solid rgba(220, 53, 69, 0.1);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
  }

  [data-theme='dark'] .attention-panel {
    background: rgba(220, 53, 69, 0.1);
    border-color: rgba(220, 53, 69, 0.2);
  }
  [data-theme='dark'] .compact-card {
    background: #222 !important;
    border: 1px solid #444 !important;
    color: #ffffff !important;
  }

  [data-theme='dark'] .compact-card .fw-bold,
  [data-theme='dark'] .compact-card .micro-stat,
  [data-theme='dark'] h4,
  [data-theme='dark'] h6 {
    color: #ffffff !important;
  }

  [data-theme='dark'] .text-muted, 
  [data-theme='dark'] .micro-stat { 
    color: #cccccc !important; 
  }

  [data-theme='dark'] .bg-light {
    background-color: #2a2a2a !important;
    color: #f8f9fa;
  }

  [data-theme='dark'] .attention-item {
    background: #222 !important;
    color: white !important;
  }

  .attention-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: var(--bg-card);
    border-radius: 12px;
    margin-bottom: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    border-left: 4px solid transparent;
    color: var(--text-main);
  }
  .attention-item.priority-urgent { border-left-color: var(--danger); }
  .attention-item.priority-high { border-left-color: var(--warning); }
  .attention-item.priority-medium { border-left-color: var(--primary); }

  .compact-card {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 18px;
    border: 1px solid var(--border);
    box-shadow: 0 8px 20px rgba(0,0,0,0.04);
    height: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    color: var(--text-main);
  }
  .compact-card:active { transform: scale(0.96); }
  .compact-card:hover { 
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.08); 
    border-color: var(--primary);
  }

  .insight-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    border-left: 4px solid var(--primary);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    position: relative;
    transition: opacity 0.3s;
    color: var(--text-main);
  }
  .insight-card.type-success { border-left-color: var(--success); }
  .insight-card.type-warning { border-left-color: var(--warning); }
  .insight-card.type-danger { border-left-color: var(--danger); }

  .capture-btn-container {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: var(--nav-bg);
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid var(--border);
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text-muted);
    font-size: 0.7rem;
    font-weight: bold;
    cursor: pointer;
    flex: 1;
  }
  .nav-item.active { color: var(--primary); }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(98, 0, 238, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(98, 0, 238, 0); }
    100% { box-shadow: 0 0 0 0 rgba(98, 0, 238, 0); }
  }

  .log-something-btn {
    background: linear-gradient(135deg, #6200ee 0%, #9c27b0 100%);
    color: white;
    border-radius: 40px;
    padding: 18px 45px;
    font-weight: bold;
    font-size: 1.2rem;
    box-shadow: 0 10px 30px rgba(98, 0, 238, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
    border: none;
    animation: pulse 2s infinite;
    transition: all 0.2s ease;
  }
  .log-something-btn:active { transform: scale(0.95); }
  .log-something-btn.listening { 
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
    animation: none; 
    box-shadow: 0 0 20px rgba(220, 53, 69, 0.5);
  }

  .micro-stat { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
  
  .voice-preview {
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 20px;
    margin-bottom: 15px;
    font-size: 0.9rem;
    font-style: italic;
    max-width: 300px;
    text-align: center;
    animation: fadeIn 0.3s;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .spinner { animation: rotate 2s linear infinite; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .notification-badge {
    background: var(--danger);
    color: white;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .container { padding-bottom: 160px; }
    .momentum-bar { padding: 16px; }
  }
`;

function App() {
  const [items, setItems] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vatSummary, setVatSummary] = useState(null);
  const [momentum, setMomentum] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [feedback, setFeedback] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [activityTypeFilter, setActivityTypeFilter] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(null);
  const [timePeriodFilter, setTimePeriodFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [selectedDetailType, setSelectedDetailType] = useState(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [theme, setTheme] = useState('light');
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [authToken, setAuthToken] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle', 'listening', 'processing'
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Sync isListening state to ref for timeouts and listeners
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Load Initial Settings
  useEffect(() => {
    const loadSettings = async () => {
      const { value: storedTheme } = await Preferences.get({ key: 'theme' });
      if (storedTheme) setTheme(storedTheme);
      
      const { value: storedToken } = await Preferences.get({ key: 'authToken' });
      if (storedToken) setAuthToken(storedToken);

      const { value: storedUserId } = await Preferences.get({ key: 'userId' });
      if (storedUserId) {
        const user = USERS.find(u => u.id === storedUserId);
        if (user) setCurrentUser(user);
      }
    };
    loadSettings();
  }, []);

  // Apply Theme to Body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Authentication and Data Fetching
  useEffect(() => {
    const syncSession = async () => {
      // Bypass Localtunnel reminder page
      axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

      if (authToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
      
      axios.defaults.headers.common['X-User-ID'] = currentUser.id;
      
      setLoading(true);
      await fetchAllData();
    };
    syncSession();
  }, [currentUser, authToken]);

  const handleLogin = async (user) => {
    try {
      const resp = await axios.post(`${API_BASE_URL}/auth/login`, { email: user.email });
      if (resp.data.token) {
        setAuthToken(resp.data.token);
        setCurrentUser(user);
        await Preferences.set({ key: 'authToken', value: resp.data.token });
        await Preferences.set({ key: 'userId', value: user.id });
      }
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      // Fallback for prototype testing if API is unavailable or returns 404
      setCurrentUser(user);
      await Preferences.set({ key: 'userId', value: user.id });
    }
  };

  useEffect(() => {
    const initSpeech = async () => {
      // Check if native Capacitor plugin is available (Mobile)
      const { available } = await SpeechRecognition.available();
      
      if (available) {
        console.log('[Speech] Native Capacitor Speech available');
        // Capacitor plugin uses a different pattern (listen/stop)
        // We'll handle this in toggleListening
      } else {
        // Fallback to Web Speech API (Desktop)
        const WebSpeech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (WebSpeech) {
          recognitionRef.current = new WebSpeech();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-GB';

          recognitionRef.current.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullTranscript += event.results[i][0].transcript;
            }
            setTranscript(fullTranscript);
            finalTranscriptRef.current = fullTranscript;
            
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => recognitionRef.current?.stop(), 3000);
          };

          recognitionRef.current.onstart = () => {
            setIsListening(true);
            setVoiceStatus('listening');
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
            const textToProcess = finalTranscriptRef.current.trim();
            if (textToProcess) {
              setVoiceStatus('processing');
              handleVoiceProcess(textToProcess);
            } else {
              setVoiceStatus('idle');
            }
            finalTranscriptRef.current = '';
          };

          recognitionRef.current.onerror = (event) => {
            console.error('[Speech] Web Error:', event.error);
            setIsListening(false);
            setVoiceStatus('idle');
          };
        }
      }
    };

    initSpeech();
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const toggleListening = async () => {
    if (connectionError) {
      alert('Cannot start voice capture while backend is disconnected.');
      return;
    }

    const { available } = await SpeechRecognition.available();

    if (available) {
      // NATIVE MOBILE LOGIC
      if (isListening) {
        await SpeechRecognition.stop();
        setIsListening(false);
        setVoiceStatus('processing');
        const textToProcess = finalTranscriptRef.current.trim();
        if (textToProcess) {
          handleVoiceProcess(textToProcess);
        } else {
          setVoiceStatus('idle');
        }
      } else {
        const { permission } = await SpeechRecognition.checkPermission();
        if (permission !== 'granted') {
          const request = await SpeechRecognition.requestPermission();
          if (request.permission !== 'granted') {
            alert('Microphone permission denied');
            return;
          }
        }

        setTranscript('');
        finalTranscriptRef.current = '';
        setIsListening(true);
        setVoiceStatus('listening');

        try {
          // Clean up any stale listeners
          await SpeechRecognition.removeAllListeners();

          await SpeechRecognition.start({
            language: 'en-GB',
            maxResults: 1,
            prompt: 'Listening...',
            partialResults: true,
            popup: false
          });

          // Handle partial updates for UI
          await SpeechRecognition.addListener('partialResults', (data) => {
            if (data.matches && data.matches.length > 0) {
              setTranscript(data.matches[0]);
              finalTranscriptRef.current = data.matches[0];
            }
          });

          // Handle final result
          await SpeechRecognition.addListener('result', (data) => {
            if (data.matches && data.matches.length > 0) {
              const text = data.matches[0];
              setTranscript(text);
              finalTranscriptRef.current = text;
              
              // Process immediately on final result
              setIsListening(false);
              setVoiceStatus('processing');
              handleVoiceProcess(text);
            }
          });

          // Watchdog
          setTimeout(async () => {
            if (isListeningRef.current) {
              await SpeechRecognition.stop();
              setIsListening(false);
              setVoiceStatus('idle');
            }
          }, 15000); 

        } catch (err) {
          console.error('[Speech] Native Start Error:', err);
          setIsListening(false);
          setVoiceStatus('idle');
        }
      }
    } else {
      // WEB DESKTOP LOGIC
      if (!recognitionRef.current) {
        alert('Speech recognition not supported in this browser.');
        return;
      }

      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setTranscript('');
        finalTranscriptRef.current = '';
        setFeedback(null);
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('[Speech] Web Start error:', err);
          setIsListening(true);
          setVoiceStatus('listening');
        }
      }
    }
  };

  const handleVoiceProcess = async (text) => {
    if (!text.trim()) {
      setVoiceStatus('idle');
      return;
    }
    
    // Fix common encoding issues (e.g., UTF-8 £ interpreted as CP437/Win1252 ┬ú)
    const cleanText = text.replace(/┬ú/g, '£');
    
    try {
      const res = await axios.post(`${API_BASE_URL}/voice/process`, {
        transcript: cleanText,
        device_id: 'web-browser-001'
      });
      setFeedback(res.data);
      if (res.data.confirmation_text) {
        const utterance = new SpeechSynthesisUtterance(res.data.confirmation_text);
        window.speechSynthesis.speak(utterance);
      }
      
      executeVoiceAction(res.data);
      setTimeout(fetchAllData, 500); // Small delay for DB consistency
    } catch (err) {
      console.error('Voice processing error:', err);
    } finally {
      setVoiceStatus('idle');
    }
  };

  const executeVoiceAction = (data) => {
    const { intent, slots } = data;
    if (data.action_status !== 'execute') return;

    // Reset common filters before applying new ones
    setSearchQuery('');
    
    // Navigation and Filtering Mapping
    if (slots.time_period) setTimePeriodFilter(slots.time_period);
    else setTimePeriodFilter(null);

    switch (intent) {
      case 'view_expenses':
        setCurrentTab('activity');
        setActivityTypeFilter('receipt');
        setPaymentStatusFilter(null);
        break;
      case 'view_vat':
        setCurrentTab('tax');
        break;
      case 'view_unpaid':
        setCurrentTab('activity');
        setActivityTypeFilter('invoice');
        setPaymentStatusFilter('unpaid');
        break;
      case 'view_quotes':
        setCurrentTab('activity');
        setActivityTypeFilter('quote');
        setPaymentStatusFilter(null);
        break;
      case 'view_attention':
        setCurrentTab('home'); // Focus attention panel
        if (slots.client_name) {
          setCurrentTab('activity');
          setSearchQuery(slots.client_name);
        }
        break;
      case 'view_bookings':
        setCurrentTab('calendar');
        break;
      case 'view_interactions':
        setCurrentTab('activity');
        if (slots.client_name) {
          setSearchQuery(slots.client_name);
        }
        break;
      case 'search_items':
        setCurrentTab('activity');
        setSearchQuery(data.transcript.replace(/show|search|find|me/gi, '').trim());
        break;
      default:
        // Capture intents handled via DB update + fetchAllData
        break;
    }

    console.log(`[UI] Voice Action Executed: ${intent}`, slots);
  };

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = async () => {
    try {
      const [itemsRes, upcomingRes, statsRes, notifRes, vatRes, momentumRes, insightRes, clientRes, jobRes, followUpRes, calendarRes, diaryRes, teamRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/items`),
        axios.get(`${API_BASE_URL}/upcoming`),
        axios.get(`${API_BASE_URL}/stats/summary`),
        axios.get(`${API_BASE_URL}/upcoming/notifications`),
        axios.get(`${API_BASE_URL}/tax/vat-summary`),
        axios.get(`${API_BASE_URL}/stats/momentum`),
        axios.get(`${API_BASE_URL}/insights`),
        axios.get(`${API_BASE_URL}/clients`),
        axios.get(`${API_BASE_URL}/jobs`),
        axios.get(`${API_BASE_URL}/revenue/followups`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/calendar`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/diary`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/teams/my`).catch(() => ({ data: [] }))
      ]);
      setItems(itemsRes.data);
      setUpcomingItems(upcomingRes.data);
      setStats(statsRes.data);
      setNotifications(notifRes.data);
      setVatSummary(vatRes.data);
      setMomentum(momentumRes.data);
      setInsights(insightRes.data);
      setClients(clientRes.data);
      setJobs(jobRes.data);
      setFollowUps(followUpRes.data);
      setCalendarEvents(calendarRes.data);
      setDiaryEntries(diaryRes.data);
      setMyTeams(teamRes.data);
      setConnectionError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setConnectionError('Backend connection lost. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  const dismissInsight = (id) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await Preferences.set({ key: 'theme', value: newTheme });
  };

  const renderDashboard = () => (
    <div>
      {/* Live Momentum Bar */}
      <section className="momentum-bar">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div style={{cursor: 'pointer'}} onClick={() => { setCurrentTab('activity'); setActivityTypeFilter(null); setPaymentStatusFilter(null); setTimePeriodFilter(null); setSearchQuery(''); }}>
            <h6 className="text-white-50 text-uppercase small mb-1">Weekly Momentum</h6>
            <div className="h2 fw-bold mb-0">GBP{momentum?.thisWeek?.incoming?.toFixed(0) || '0'}</div>
            <div className={`small ${momentum?.deltas?.incoming >= 0 ? 'delta-up' : 'delta-down'}`}>
              {momentum?.deltas?.incoming >= 0 ? '^' : 'v'} {Math.abs(momentum?.deltas?.incoming || 0).toFixed(0)}% vs last week
            </div>
          </div>
          <div className="text-end" style={{cursor: 'pointer'}} onClick={() => setCurrentTab('tax')}>
            <h6 className="text-white-50 text-uppercase small mb-1">VAT Est.</h6>
            <div className="h4 fw-bold mb-0">GBP{vatSummary?.vat_boxes?.payable?.toFixed(2) || '0.00'}</div>
            <div className="small text-white-50">{vatSummary?.countdown?.days_remaining} days left</div>
          </div>
        </div>
        <div className="row g-2 border-top border-secondary pt-3">
          <div className="col-4" style={{cursor: 'pointer'}} onClick={() => { setCurrentTab('activity'); setActivityTypeFilter('receipt'); }}>
            <div className="small text-white-50">Expenses</div>
            <div className="fw-bold">GBP{momentum?.thisWeek?.outgoing?.toFixed(0) || '0'}</div>
          </div>
          <div className="col-4 text-center" style={{cursor: 'pointer'}} onClick={() => { setCurrentTab('activity'); setActivityTypeFilter('invoice'); setPaymentStatusFilter('unpaid'); }}>
            <div className="small text-white-50">Unpaid</div>
            <div className="fw-bold">{items.filter(i => i.type === 'invoice' && i.payment_status !== 'paid').length}</div>
          </div>
          <div className="col-4 text-end" style={{cursor: 'pointer'}} onClick={() => { setCurrentTab('activity'); setActivityTypeFilter('quote'); }}>
            <div className="small text-white-50">Quotes</div>
            <div className="fw-bold">{items.filter(i => i.type === 'quote' && i.status !== 'confirmed').length}</div>
          </div>
        </div>
      </section>

      {/* Attention Panel */}
      {(notifications.length > 0 || vatSummary?.threshold?.alert) && (
        <section className="attention-panel">
          <h6 className="fw-bold text-danger mb-3 d-flex align-items-center">
            <AlertCircle size={18} className="me-2" /> Attention Required
          </h6>
          {notifications.slice(0, 5).map(n => (
            <div 
              key={`${n.source}-${n.id}`} 
              className={`attention-item priority-${n.priority}`}
              style={{cursor: 'pointer'}}
              onClick={() => {
                if (n.source === 'calendar' || n.source === 'event') {
                  setCurrentTab('calendar');
                  setSelectedDetailId(n.source_id || n.id);
                  setSelectedDetailType('event');
                } else if (n.source === 'items' || n.type === 'invoice' || n.type === 'quote') {
                  setCurrentTab('activity');
                  setActivityTypeFilter(n.type);
                  setSelectedDetailId(n.source_id || n.id);
                  setSelectedDetailType('item');
                }
              }}
            >
              <div className="me-3">
                {n.priority === 'urgent' ? <AlertCircle size={18} className="text-danger" /> : 
                 n.priority === 'high' ? <BellRing size={18} className="text-warning" /> : 
                 <Clock size={18} className="text-primary" />}
              </div>
              <div className="flex-grow-1 small fw-medium">{n.description}</div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          ))}
        </section>
      )}

      {/* Performance Grid */}
      <section className="row g-3 mb-4">
        {[
          { key: 'invoice', title: 'Invoices', icon: <FileText size={24} className="text-primary" />, 
            meta: `${items.filter(i => i.type === 'invoice' && i.payment_status !== 'paid').length} unpaid`,
            val: `GBP${items.filter(i => i.type === 'invoice' && i.status !== 'archived').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toFixed(0)}` },
          { key: 'receipt', title: 'Receipts', icon: <Receipt size={24} className="text-success" />, 
            meta: `${items.filter(i => i.type === 'receipt' && i.created_at >= new Date().toISOString().split('T')[0]).length} today`,
            val: `GBP${items.filter(i => i.type === 'receipt' && i.status !== 'archived' && i.created_at >= new Date().toISOString().split('T')[0]).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toFixed(0)}` },
          { key: 'booking', title: 'Bookings', icon: <CalendarDays size={24} className="text-info" />, 
            meta: `Next: ${upcomingItems.find(i => i.source === 'event')?.date ? new Date(upcomingItems.find(i => i.source === 'event').date).toLocaleDateString() : 'None'}`,
            val: upcomingItems.filter(i => i.source === 'event').length },
          { key: 'client', title: 'Clients', icon: <Briefcase size={24} className="text-warning" />, 
            meta: `Active now`,
            val: clients.length },
          { key: 'job', title: 'Open Jobs', icon: <Clock size={24} className="text-muted" />, 
            meta: `GBP${jobs.reduce((sum, j) => sum + (parseFloat(j.value_estimate) || 0), 0).toFixed(0)} est. value`,
            val: jobs.filter(j => j.status !== 'completed' && j.status !== 'lost').length }
        ].map(card => (
          <div key={card.key} className="col-6 col-md-3">
            <div className="compact-card" onClick={() => {
              if (card.key === 'client' || card.key === 'job') {
                setCurrentTab('clients');
              } else if (card.key === 'receipt' || card.key === 'invoice') {
                setActivityTypeFilter(card.key);
                if (card.key === 'invoice') setPaymentStatusFilter('unpaid');
                else setPaymentStatusFilter(null);
                setCurrentTab('activity');
              } else if (card.key === 'booking') {
                setCurrentTab('calendar');
              } else {
                setCurrentTab('home');
              }
            }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                {card.icon}
                <div className="fw-bold">{card.val}</div>
              </div>
              <div className="fw-bold small">{card.title}</div>
              <div className="micro-stat">{card.meta}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Smart Insight Feed */}
      {insights.length > 0 && (
        <section className="mb-5">
          <h6 className="text-muted text-uppercase small fw-bold mb-3">Smart Insights</h6>
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className={`insight-card type-${insight.type}`}
              style={{cursor: 'pointer'}}
              onClick={() => {
                if (insight.id === 'rev-up') {
                  setCurrentTab('activity');
                  setActivityTypeFilter(null);
                } else if (insight.id === 'spending-alert') {
                  setCurrentTab('activity');
                  setActivityTypeFilter('receipt');
                } else if (insight.id === 'follow-up') {
                  setCurrentTab('activity');
                  setActivityTypeFilter('invoice');
                }
              }}
            >
              <button 
                className="btn-close position-absolute top-0 end-0 m-2" 
                style={{fontSize: '0.6rem'}}
                onClick={(e) => { e.stopPropagation(); dismissInsight(insight.id); }}
              ></button>
              <div className="d-flex align-items-center">
                 <div className="me-3">
                   {insight.icon === 'TrendingUp' ? <TrendingUp size={20} className="text-success" /> :
                    insight.icon === 'Clock' ? <Clock size={20} className="text-warning" /> :
                    insight.icon === 'BellRing' ? <BellRing size={20} className="text-danger" /> :
                    <CheckCircle2 size={20} className="text-info" />}
                 </div>
                 <div>
                   <div className="fw-bold small">{insight.title}</div>
                   <div className="small text-muted">{insight.text}</div>
                 </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );

  const renderActivity = () => {
    let filteredItems = activityTypeFilter 
      ? items.filter(item => item.type === activityTypeFilter)
      : items;

    if (paymentStatusFilter === 'unpaid') {
      filteredItems = filteredItems.filter(i => 
        (i.type === 'invoice' || i.type === 'quote') && i.payment_status !== 'paid'
      );
    }

    if (timePeriodFilter) {
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (timePeriodFilter === 'this_week') {
        const startOfWeek = new Date(now.getTime() - (now.getDay() * oneDay));
        startOfWeek.setHours(0,0,0,0);
        filteredItems = filteredItems.filter(i => new Date(i.created_at) >= startOfWeek);
      } else if (timePeriodFilter === 'last_week') {
        const startOfLastWeek = new Date(now.getTime() - ((now.getDay() + 7) * oneDay));
        startOfLastWeek.setHours(0,0,0,0);
        const endOfLastWeek = new Date(startOfLastWeek.getTime() + (7 * oneDay));
        filteredItems = filteredItems.filter(i => {
          const d = new Date(i.created_at);
          return d >= startOfLastWeek && d < endOfLastWeek;
        });
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(i => 
        (i.extracted_text?.toLowerCase().includes(q)) || 
        (i.raw_note?.toLowerCase().includes(q)) ||
        (i.type.toLowerCase().includes(q))
      );
    }

    if (isAddingItem) {
      return (
        <div>
          <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => setIsAddingItem(false)}>
            <ArrowLeft size={18} /> Cancel
          </button>
          <h4 className="fw-bold mb-4">Add Manual {activityTypeFilter ? activityTypeFilter.charAt(0).toUpperCase() + activityTypeFilter.slice(1) : 'Item'}</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            try {
              await axios.post(`${API_BASE_URL}/items`, {
                ...data,
                device_id: 'web-manual'
              });
              setIsAddingItem(false);
              fetchAllData();
            } catch (err) { console.error(err); }
          }}>
            <div className="mb-3">
              <label className="small text-muted mb-1">Type</label>
              <select name="type" className="form-select rounded-3" defaultValue={activityTypeFilter || 'receipt'}>
                <option value="receipt">Receipt (Expense)</option>
                <option value="invoice">Invoice (Income)</option>
                <option value="quote">Quote</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Client (Optional)</label>
              <select name="client_id" className="form-select rounded-3">
                <option value="">No Client Linked</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Description / Reference</label>
              <input name="extracted_text" className="form-control rounded-3" placeholder="e.g. Office Supplies or INV-001" required />
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Amount (GBP)</label>
              <input name="amount" type="number" step="0.01" className="form-control rounded-3" placeholder="0.00" required />
            </div>
            <div className="mb-4">
              <label className="small text-muted mb-1">Date</label>
              <input name="created_at" type="date" className="form-control rounded-3" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4 fw-bold">Save Item</button>
          </form>
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0">
            {activityTypeFilter 
              ? `${activityTypeFilter.charAt(0).toUpperCase() + activityTypeFilter.slice(1)}s` 
              : 'Activity Feed'}
          </h4>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setIsAddingItem(true)}>+ Add</button>
            {activityTypeFilter && (
              <button 
                className="btn btn-sm btn-outline-secondary rounded-pill"
                onClick={() => { setActivityTypeFilter(null); setPaymentStatusFilter(null); setTimePeriodFilter(null); setSearchQuery(''); }}
              >
                All
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="input-group mb-4 shadow-sm rounded-4 overflow-hidden border">
          <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted" /></span>
          <input 
            type="text" 
            className="form-control border-0 ps-0" 
            placeholder="Search transactions, clients or notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-5 text-muted">No items found.</div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="attention-item" style={{cursor: 'pointer'}} onClick={() => { setSelectedDetailId(item.id); setSelectedDetailType('item'); }}>
              <div className="me-3">
                {item.type === 'invoice' ? <FileText size={20} className="text-primary" /> :
                 item.type === 'receipt' ? <Receipt size={20} className="text-success" /> :
                 <StickyNote size={20} className="text-muted" />}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center">
                  <div className="fw-bold small">{item.extracted_text || item.type.toUpperCase()}</div>
                  {item.status === 'draft' && <span className="badge bg-secondary ms-2" style={{fontSize: '0.5rem'}}>DRAFT</span>}
                  {item.type === 'invoice' && <span className="badge bg-info ms-2" style={{fontSize: '0.5rem'}}>{item.payment_status?.toUpperCase()}</span>}
                </div>
                <div className="micro-stat">{new Date(item.created_at).toLocaleString()} - GBP{parseFloat(item.gross_amount || item.amount || 0).toFixed(2)}</div>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          ))
        )}
      </div>
    );
  };

  const renderClients = () => {
    if (isAddingClient) {
      return (
        <div>
          <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => setIsAddingClient(false)}>
            <ArrowLeft size={18} /> Cancel
          </button>
          <h4 className="fw-bold mb-4">Add New Client</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            try {
              await axios.post(`${API_BASE_URL}/clients`, data);
              setIsAddingClient(false);
              fetchAllData();
            } catch (err) { console.error(err); }
          }}>
            <div className="mb-3"><input name="name" className="form-control rounded-3" placeholder="Client Name" required /></div>
            <div className="mb-3"><input name="email" type="email" className="form-control rounded-3" placeholder="Email Address" /></div>
            <div className="mb-3"><input name="phone" className="form-control rounded-3" placeholder="Phone Number" /></div>
            <div className="mb-4"><textarea name="address" className="form-control rounded-3" placeholder="Physical Address" rows="3"></textarea></div>
            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4 fw-bold">Save Client</button>
          </form>
        </div>
      );
    }

    if (isAddingJob && selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      return (
        <div>
          <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => setIsAddingJob(false)}>
            <ArrowLeft size={18} /> Cancel
          </button>
          <h4 className="fw-bold mb-1">New Job</h4>
          <div className="text-muted small mb-4">for {client?.name}</div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = { ...Object.fromEntries(formData.entries()), client_id: selectedClientId };
            try {
              await axios.post(`${API_BASE_URL}/jobs`, data);
              setIsAddingJob(false);
              fetchAllData();
            } catch (err) { console.error(err); }
          }}>
            <div className="mb-3"><input name="service_category" className="form-control rounded-3" placeholder="Service Category (e.g. Consulting)" required /></div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Initial Status</label>
              <select name="status" className="form-select rounded-3">
                <option value="lead">Lead</option>
                <option value="booked">Booked</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            <div className="mb-3"><input name="value_estimate" type="number" className="form-control rounded-3" placeholder="Estimated Value (GBP)" /></div>
            <div className="mb-4">
              <label className="small text-muted mb-1">Next Due Date</label>
              <input name="next_due_date" type="date" className="form-control rounded-3" />
            </div>
            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4 fw-bold">Create Job</button>
          </form>
        </div>
      );
    }

    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      const clientJobs = jobs.filter(j => j.client_id === selectedClientId);
      
      return (
        <div>
          <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => setSelectedClientId(null)}>
            <ArrowLeft size={18} /> Back to Clients
          </button>
          
          <div className="compact-card mb-4 p-4">
            <h4 className="fw-bold mb-1">{client?.name}</h4>
            <div className="text-muted small mb-3">{client?.email} - {client?.phone}</div>
            {client?.address && <div className="text-muted small mb-3">{client.address}</div>}
            <div className="d-flex gap-2">
               <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                 if(window.confirm('Delete client and all jobs?')) {
                   await axios.delete(`${API_BASE_URL}/clients/${selectedClientId}`);
                   setSelectedClientId(null);
                   fetchAllData();
                 }
               }}><Trash2 size={14} /></button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-muted text-uppercase small fw-bold m-0">Associated Jobs</h6>
            <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => setIsAddingJob(true)}>+ New Job</button>
          </div>
          {clientJobs.length === 0 ? (
            <div className="text-center py-4 text-muted small">No jobs found for this client.</div>
          ) : (
            clientJobs.map(job => (
              <div key={job.id} className="attention-item">
                <div className="me-3">
                  <Briefcase size={20} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <div className="fw-bold small">{job.service_category || 'General Service'}</div>
                    <span className={`badge ms-2 opacity-75`} style={{fontSize: '0.5rem', backgroundColor: 'var(--primary)', color: 'white'}}>{job.status.toUpperCase()}</span>
                  </div>
                  <div className="micro-stat">Est. GBP{parseFloat(job.value_estimate || 0).toFixed(2)} - Due {job.next_due_date ? new Date(job.next_due_date).toLocaleDateString() : 'TBD'}</div>
                </div>
                <button className="btn btn-link text-danger p-0 ms-2" onClick={async () => {
                  if(window.confirm('Delete job?')) {
                    await axios.delete(`${API_BASE_URL}/jobs/${job.id}`);
                    fetchAllData();
                  }
                }}><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Clients</h4>
          <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setIsAddingClient(true)}>Add Client</button>
        </div>
        {clients.length === 0 ? (
          <div className="text-center py-5 text-muted">No clients yet.</div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="attention-item" onClick={() => setSelectedClientId(client.id)}>
              <Briefcase size={20} className="text-warning me-3" />
              <div className="flex-grow-1">
                <div className="fw-bold small">{client.name}</div>
                <div className="micro-stat">{client.phone || client.email || 'No contact info'}</div>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </div>
          ))
        )}
      </div>
    );
  };

  const renderItemDetail = () => {
    const item = items.find(i => i.id === selectedDetailId);
    if (!item) return <div className="text-center py-5">Item not found.</div>;

    return (
      <div>
        <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => { setSelectedDetailId(null); setSelectedDetailType(null); }}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="compact-card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className="badge bg-primary mb-2">{item.type.toUpperCase()}</span>
              <h4 className="fw-bold mb-0">{item.reference_number || 'No Reference'}</h4>
            </div>
            <div className="text-end">
              <div className="h4 fw-bold mb-0 text-primary">GBP {parseFloat(item.gross_amount || item.amount || 0).toFixed(2)}</div>
              <div className="small text-muted">{item.payment_status?.toUpperCase() || item.status.toUpperCase()}</div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="small text-muted">Created</div>
              <div className="fw-medium">{new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            <div className="col-6">
              <div className="small text-muted">Due Date</div>
              <div className="fw-medium">{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'None'}</div>
            </div>
            <div className="col-6">
              <div className="small text-muted">Net Amount</div>
              <div className="fw-medium">GBP {parseFloat(item.net_amount || 0).toFixed(2)}</div>
            </div>
            <div className="col-6">
              <div className="small text-muted">VAT ({item.vat_rate}%)</div>
              <div className="fw-medium">GBP {parseFloat(item.vat_amount || 0).toFixed(2)}</div>
            </div>
          </div>

          {item.extracted_text && (
            <div className="mb-4">
              <div className="small text-muted mb-1">Details</div>
              <div className="bg-light p-3 rounded-3 small">{item.extracted_text}</div>
            </div>
          )}

          <div className="d-flex gap-2">
            {item.type === 'invoice' && item.payment_status !== 'paid' && (
              <button className="btn btn-success flex-grow-1 p-3 rounded-4 fw-bold" onClick={async () => {
                await axios.patch(`${API_BASE_URL}/items/${item.id}`, { payment_status: 'paid', status: 'confirmed' });
                fetchAllData();
              }}>Mark as Paid</button>
            )}
            {item.type === 'quote' && (
              <button className="btn btn-primary flex-grow-1 p-3 rounded-4 fw-bold" onClick={async () => {
                await axios.post(`${API_BASE_URL}/items/${item.id}/convert`);
                fetchAllData();
                setSelectedDetailId(null);
              }}>Convert to Invoice</button>
            )}
            <button className="btn btn-outline-danger p-3 rounded-4" onClick={async () => {
              if (window.confirm('Archive this item?')) {
                await axios.delete(`${API_BASE_URL}/items/${item.id}`);
                setSelectedDetailId(null);
                fetchAllData();
              }
            }}><Trash2 size={20} /></button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (isAddingEvent) {
      return (
        <div>
          <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => setIsAddingEvent(false)}>
            <ArrowLeft size={18} /> Cancel
          </button>
          <h4 className="fw-bold mb-4">New Booking</h4>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            // Create ISO strings from datetime-local inputs
            data.start_at = new Date(data.start_at).toISOString();
            data.end_at = new Date(data.end_at).toISOString();
            try {
              await axios.post(`${API_BASE_URL}/calendar`, { 
                ...data, 
                event_type: 'appointment',
                device_id: 'web-manual'
              });
              setIsAddingEvent(false);
              fetchAllData();
            } catch (err) { console.error(err); }
          }}>
            <div className="mb-3">
              <label className="small text-muted mb-1">Event Title</label>
              <input name="title" className="form-control rounded-3" placeholder="e.g. Consultation with Client" required />
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Client (Optional)</label>
              <select name="client_id" className="form-select rounded-3">
                <option value="">No Client Linked</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">Start Date & Time</label>
              <input name="start_at" type="datetime-local" className="form-control rounded-3" required />
            </div>
            <div className="mb-3">
              <label className="small text-muted mb-1">End Date & Time</label>
              <input name="end_at" type="datetime-local" className="form-control rounded-3" required />
            </div>
            <div className="mb-4">
              <label className="small text-muted mb-1">Notes (Optional)</label>
              <textarea name="description" className="form-control rounded-3" rows="3"></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100 p-3 rounded-4 fw-bold">Save Booking</button>
          </form>
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0">Schedule</h4>
          <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setIsAddingEvent(true)}>+ Booking</button>
        </div>
        
        {calendarEvents.length === 0 ? (
          <div className="text-center py-5 text-muted">No upcoming events.</div>
        ) : (
          calendarEvents.map(event => (
            <div key={event.id} className="attention-item" style={{cursor: 'pointer'}} onClick={() => { setSelectedDetailId(event.id); setSelectedDetailType('event'); }}>
              <div className="me-3">
                <Calendar size={20} className="text-info" />
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold small">{event.title}</div>
                <div className="micro-stat">{new Date(event.start_at).toLocaleString()} - {event.event_type.toUpperCase()}</div>
              </div>
              <button className="btn btn-link text-danger p-0 ms-2" onClick={async (e) => {
                e.stopPropagation();
                if(window.confirm('Delete event?')) {
                  await axios.delete(`${API_BASE_URL}/calendar/${event.id}`);
                  fetchAllData();
                }
              }}><Trash2 size={16} /></button>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCalendarDetail = () => {
    const event = calendarEvents.find(e => e.id === selectedDetailId);
    if (!event) return <div className="text-center py-5">Event not found.</div>;

    return (
      <div>
        <button className="btn btn-link p-0 mb-4 d-flex align-items-center gap-2 text-decoration-none" onClick={() => { setSelectedDetailId(null); setSelectedDetailType(null); }}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="compact-card p-4 mb-4">
          <span className="badge bg-info mb-2">{event.event_type.toUpperCase()}</span>
          <h4 className="fw-bold mb-1">{event.title}</h4>
          <div className="text-muted small mb-4">{new Date(event.start_at).toLocaleString()}</div>

          <hr className="my-4" />

          {event.description && (
            <div className="mb-4">
              <div className="small text-muted mb-1">Notes</div>
              <div className="bg-light p-3 rounded-3 small">{event.description}</div>
            </div>
          )}

          {event.client_name && (
            <div className="mb-4">
              <div className="small text-muted mb-1">Linked Client</div>
              <div className="fw-medium">{event.client_name}</div>
            </div>
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-outline-danger w-100 p-3 rounded-4 fw-bold" onClick={async () => {
              if (window.confirm('Delete this event?')) {
                await axios.delete(`${API_BASE_URL}/calendar/${event.id}`);
                setSelectedDetailId(null);
                fetchAllData();
              }
            }}>Cancel Event</button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiary = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">Daily Diary</h4>
        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={async () => {
          const content = window.prompt('Note:');
          if (content) {
            const date = new Date().toISOString().split('T')[0];
            await axios.post(`${API_BASE_URL}/diary`, { content, entry_date: date });
            fetchAllData();
          }
        }}>+ Note</button>
      </div>
      
      {diaryEntries.length === 0 ? (
        <div className="text-center py-5 text-muted">No diary entries yet.</div>
      ) : (
        diaryEntries.map(entry => (
          <div key={entry.id} className="insight-card p-3 mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold small">{new Date(entry.entry_date).toLocaleDateString()}</span>
              <button className="btn btn-link text-danger p-0" onClick={async () => {
                if(window.confirm('Delete entry?')) {
                  await axios.delete(`${API_BASE_URL}/diary/${entry.id}`);
                  fetchAllData();
                }
              }}><Trash2 size={14} /></button>
            </div>
            <div className="small">{entry.content}</div>
          </div>
        ))
      )}
    </div>
  );

  const renderTeam = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">Team Management</h4>
        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={async () => {
          const name = window.prompt('Team Name:');
          if (name) {
            await axios.post(`${API_BASE_URL}/teams`, { name });
            fetchAllData();
          }
        }}>+ New Team</button>
      </div>

      {myTeams.length === 0 ? (
        <div className="text-center py-5 text-muted">You are not in any teams yet.</div>
      ) : (
        myTeams.map(team => (
          <div key={team.id} className="compact-card mb-4 p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-0">{team.name}</h5>
                <span className="badge bg-primary small opacity-75">{team.role.toUpperCase()}</span>
              </div>
              {team.role === 'admin' && (
                <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={async () => {
                  const email = window.prompt('Member Email:');
                  if (email) {
                    alert('Invitation sent (Conceptual: requires email service)');
                  }
                }}>Invite Member</button>
              )}
            </div>
            <div className="small text-muted">Created: {new Date(team.created_at).toLocaleDateString()}</div>
          </div>
        ))
      )}
    </div>
  );

  const renderTax = () => (
    <div>
      <h4 className="fw-bold mb-4">Tax & Exports</h4>
      <div className="momentum-bar mb-4">
        <h6 className="text-white-50 small mb-3">VAT ESTIMATE ({vatSummary?.quarter})</h6>
        <div className="h2 fw-bold mb-1">GBP{vatSummary?.vat_boxes?.payable?.toFixed(2)}</div>
        <div className="small text-white-50">Box 1 (Sales): GBP{vatSummary?.vat_boxes?.box1}</div>
        <div className="small text-white-50">Box 4 (Purchases): GBP{vatSummary?.vat_boxes?.box4}</div>
      </div>
      
      <div className="row g-3">
        <div className="col-12">
          <button className="btn btn-primary w-100 p-3 rounded-4 fw-bold" onClick={() => window.open(`${API_BASE_URL}/export/vat-pack?quarter_ref=${vatSummary.quarter}`)}>
            Download Q1 VAT Pack (ZIP)
          </button>
        </div>
        <div className="col-6">
          <button className="btn btn-light w-100 p-3 rounded-4 fw-bold small" onClick={() => window.open(`${API_BASE_URL}/export?format=xero`)}>Xero CSV</button>
        </div>
        <div className="col-6">
          <button className="btn btn-light w-100 p-3 rounded-4 fw-bold small" onClick={() => window.open(`${API_BASE_URL}/export?format=quickbooks`)}>QuickBooks</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <style>{styles}</style>
      
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold m-0 d-flex align-items-center gap-2" style={{color: 'var(--primary)', letterSpacing: '-1px'}} onClick={() => setCurrentTab('home')}>
          bizPA 
          <span className="badge bg-warning text-dark" style={{fontSize: '0.6rem'}}>v1.2.3</span>
          <button className="btn btn-link p-0 text-muted" onClick={(e) => { e.stopPropagation(); fetchAllData(); }}>
            <RefreshCcw size={14} className={loading ? 'spinner' : ''} />
          </button>
        </h1>
        <div className="d-flex align-items-center">
           <button className="btn btn-light rounded-circle p-2 me-3" onClick={() => setCurrentTab('team')}>
             <Users size={20} className={currentTab === 'team' ? "text-primary" : "text-muted"} />
           </button>
           <button className="btn btn-light rounded-circle p-2 me-3" onClick={toggleTheme}>
             {theme === 'light' ? <Moon size={20} className="text-muted" /> : <Sun size={20} className="text-warning" />}
           </button>
           <button className="btn btn-light rounded-circle p-2 me-3" onClick={fetchAllData} title="Refresh Data">
             <RefreshCcw size={20} className={loading ? 'spinner' : 'text-muted'} />
           </button>
           <div className="position-relative me-3">
              <Bell className={notifications.length > 0 ? "text-danger" : "text-muted"} />
              {notifications.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>{notifications.length}</span>}
           </div>
           
           {/* User Selector */}
           <div className="dropdown">
             <button className="btn btn-light rounded-pill px-3 py-2 d-flex align-items-center gap-2 border shadow-sm" type="button" data-bs-toggle="dropdown">
               <span style={{fontSize: '1.2rem'}}>{currentUser.icon}</span>
               <span className="small fw-bold d-none d-md-inline">{currentUser.name.split(' ')[0]}</span>
             </button>
             <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2 mt-2">
               {USERS.map(user => (
                 <li key={user.id}>
                   <button 
                     className={`dropdown-item rounded-3 d-flex align-items-center gap-3 py-2 ${currentUser.id === user.id ? 'active' : ''}`}
                     onClick={() => handleLogin(user)}
                   >
                     <span style={{fontSize: '1.2rem'}}>{user.icon}</span>
                     <div>
                       <div className="fw-bold small">{user.name}</div>
                       <div className="text-muted" style={{fontSize: '0.6rem'}}>User Context</div>
                     </div>
                   </button>
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </header>

            {connectionError && (
              <div className="alert alert-danger mx-3 rounded-4 shadow-sm border-0">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <AlertCircle size={18} /> <span className="fw-bold">{connectionError}</span>
                  </div>
                  <button className="btn btn-danger btn-sm rounded-3 px-3 fw-bold" onClick={fetchAllData}>
                    Retry
                  </button>
                </div>
                <div className="small opacity-75 pt-2 border-top border-danger border-opacity-10">
                  Target: <code>{API_BASE_URL}</code>
                </div>
              </div>
            )}
            {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="container py-4" style={{paddingBottom: '160px'}}>
          {currentTab === 'home' && renderDashboard()}
          {currentTab === 'activity' && (selectedDetailId && selectedDetailType === 'item' ? renderItemDetail() : renderActivity())}
          {currentTab === 'calendar' && (selectedDetailId && selectedDetailType === 'event' ? renderCalendarDetail() : renderCalendar())}
          {currentTab === 'clients' && renderClients()}
          {currentTab === 'diary' && renderDiary()}
          {currentTab === 'team' && renderTeam()}
          {currentTab === 'insights' && (
            <div>
              <h4 className="fw-bold mb-4">Business Insights</h4>
              
              {followUps.length > 0 && (
                <section className="mb-4">
                  <h6 className="text-muted text-uppercase small fw-bold mb-3">Priority Outreach</h6>
                  {followUps.map(fu => (
                    <div key={fu.id} className="insight-card type-danger p-3 mb-3">
                      <div className="fw-bold small">{fu.title}</div>
                      <div className="small text-muted mb-2">{fu.description}</div>
                      <div className="bg-light p-2 rounded small mb-3 border-start border-danger border-4">
                        "{fu.suggested_message}"
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={() => window.open(`sms:${clients.find(c => c.id === fu.client_id)?.phone}?body=${encodeURIComponent(fu.suggested_message)}`)}>Send SMS</button>
                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setFollowUps(prev => prev.filter(f => f.id !== fu.id))}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <div className="alert alert-info rounded-4 p-4 border-0">
                AI-powered charts and deep-dive analytics coming in Milestone 2.
              </div>
            </div>
          )}
          {currentTab === 'tax' && renderTax()}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { key: 'home', label: 'Home', icon: <LayoutGrid size={24} /> },
          { key: 'activity', label: 'Timeline', icon: <Clock size={24} /> },
          { key: 'calendar', label: 'Schedule', icon: <Calendar size={24} /> },
          { key: 'clients', label: 'Clients', icon: <Briefcase size={24} /> },
          { key: 'diary', label: 'Diary', icon: <StickyNote size={24} /> },
          { key: 'tax', label: 'Tax', icon: <Receipt size={24} /> }
        ].map(nav => (
          <div 
            key={nav.key} 
            className={`nav-item ${currentTab === nav.key ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab(nav.key);
              if (nav.key === 'activity') setActivityTypeFilter(null);
            }}
          >
            {nav.icon}
            <span>{nav.label}</span>
          </div>
        ))}
      </nav>

      {/* Capture Button (Log Something) */}
      <div className="capture-btn-container d-flex flex-column align-items-center">
        {isListening && transcript && (
          <div className="voice-preview">"{transcript}"</div>
        )}
        <button 
          className={`log-something-btn ${isListening ? 'listening' : ''}`} 
          onClick={toggleListening}
          disabled={voiceStatus === 'processing'}
        >
          {voiceStatus === 'processing' ? <RefreshCcw size={24} className="spinner" /> : <Mic size={24} />}
          <span>
            {voiceStatus === 'listening' ? 'Listening...' : 
             voiceStatus === 'processing' ? 'Processing...' : 'Log Something'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default App;
