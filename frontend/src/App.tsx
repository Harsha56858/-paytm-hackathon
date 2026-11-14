import { useEffect, useState, useMemo } from 'react'
import {
  LayoutDashboard,
  Inbox,
  Phone,
  Users,
  Bot,
  Workflow,
  CheckSquare,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Activity,
  ArrowUpRight,
  Headset,
  Zap,
  RefreshCw,
  Mail,
  CalendarDays,
  X,
  PhoneCall,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'

import {
  enquiryService,
  callbackRequestService,
  type CallbackRequest,
  type CallbackStats,
  type Enquiry,
  type EnquiryCreate,
} from './services/api'
import { CallbackStatusBadge } from './components/CallbackStatusBadge'
import { CallbackDetailsModal } from './components/CallbackDetailsModal'
import { AIInboxView } from './components/AIInboxView'
import { AIVoiceView } from './components/AIVoiceView'
import { AIAgentsView } from './components/AIAgentsView'
import { WorkflowsView } from './components/WorkflowsView'
import { TasksApprovalsView } from './components/TasksApprovalsView'
import { AnalyticsView } from './components/AnalyticsView'
import { SettingsView } from './components/SettingsView'

const navigation = [
  {
    section: 'WORKSPACE',
    items: [
      { name: 'Overview', icon: LayoutDashboard },
      { name: 'AI Inbox', icon: Inbox },
      { name: 'AI Voice', icon: Phone },
      { name: 'Leads CRM', icon: Users },
      { name: 'Callback Requests', icon: CalendarDays },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { name: 'AI Agents', icon: Bot },
      { name: 'Workflows', icon: Workflow },
      { name: 'Tasks & Approvals', icon: CheckSquare },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      { name: 'Analytics', icon: BarChart3 },
      { name: 'Settings', icon: Settings },
    ],
  },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')

  // Leads CRM state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Callback Requests state
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([])
  const [callbackLoading, setCallbackLoading] = useState(false)
  const [callbackError, setCallbackError] = useState('')
  const [callbackSearch, setCallbackSearch] = useState('')
  const [callbackStatusFilter, setCallbackStatusFilter] = useState<string>('all')
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Real backend statistics state
  const [callbackStats, setCallbackStats] = useState<CallbackStats>({
    total: 0,
    pending_review: 0,
    contacted: 0,
    completed: 0,
    cancelled: 0,
  })

  // Add Lead modal state
  const [showAddLead, setShowAddLead] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  const [formData, setFormData] = useState<EnquiryCreate>({
    customer_name: '',
    phone_number: '',
    email: '',
    message: '',
    source: 'dashboard',
  })

  // Fetch enquiries from backend
  const fetchEnquiries = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await enquiryService.getAll()
      setEnquiries(data)
    } catch (err) {
      console.error('Unable to fetch enquiries:', err)
      setError(
        'Unable to load customer enquiries. Please check your backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch callback requests from backend
  const fetchCallbackRequests = async () => {
    setCallbackLoading(true)
    setCallbackError('')

    try {
      const [data, stats] = await Promise.all([
        callbackRequestService.getAll(),
        callbackRequestService.getStats(),
      ])
      setCallbackRequests(data)
      setCallbackStats(stats)
    } catch (err) {
      console.error('Unable to fetch callback requests:', err)
      setCallbackError(
        'Unable to load callback requests. Please check your backend connection.'
      )
    } finally {
      setCallbackLoading(false)
    }
  }

  // Load initial data on mount
  useEffect(() => {
    fetchEnquiries()
    fetchCallbackRequests()
  }, [])

  // Add a new enquiry
  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setSubmitting(true)
    setFormMessage('')

    try {
      await enquiryService.create(formData)

      setFormMessage('Lead added successfully!')

      setFormData({
        customer_name: '',
        phone_number: '',
        email: '',
        message: '',
        source: 'dashboard',
      })

      await fetchEnquiries()

      setTimeout(() => {
        setShowAddLead(false)
        setFormMessage('')
      }, 1000)
    } catch (err) {
      console.error('Unable to create enquiry:', err)
      setFormMessage('Unable to add lead. Please check the details.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle callback update from modal
  const handleCallbackUpdated = (updated: CallbackRequest) => {
    setCallbackRequests((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    )
    setSelectedCallback(updated)
    // Refresh real stats
    callbackRequestService.getStats().then(setCallbackStats).catch(console.error)
  }

  // Search enquiries
  const filteredEnquiries = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()
    if (!search) return enquiries

    return enquiries.filter((enquiry) => {
      return (
        enquiry.customer_name.toLowerCase().includes(search) ||
        enquiry.phone_number.includes(search) ||
        (enquiry.email?.toLowerCase().includes(search) ?? false)
      )
    })
  }, [enquiries, searchTerm])

  // Filter callback requests
  const filteredCallbacks = useMemo(() => {
    return callbackRequests.filter((cb) => {
      // Status filter
      if (callbackStatusFilter !== 'all' && cb.status !== callbackStatusFilter) {
        return false
      }

      // Search filter
      const search = callbackSearch.toLowerCase().trim()
      if (search) {
        const matchesName = cb.customer_name.toLowerCase().includes(search)
        const matchesPhone = cb.phone_number.includes(search)
        const matchesReason = cb.reason?.toLowerCase().includes(search) ?? false
        const matchesNotes = cb.follow_up_notes?.toLowerCase().includes(search) ?? false
        if (!matchesName && !matchesPhone && !matchesReason && !matchesNotes) {
          return false
        }
      }

      return true
    })
  }, [callbackRequests, callbackStatusFilter, callbackSearch])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (date?: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4f7fc] text-[#142947] flex">

      {/* ======================================================== */}
      {/* SIDEBAR */}
      {/* ======================================================== */}
      <aside className="w-[260px] h-screen shrink-0 overflow-y-auto overflow-x-hidden border-r flex flex-col z-30 select-none">

        {/* BRAND */}
        <div className="h-[76px] shrink-0 px-5 flex items-center border-b border-white/[0.07]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Zap size={20} className="text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="font-semibold text-[15px] tracking-tight truncate text-white">
                AI Sales Care
              </h1>
              <p className="text-[10px] text-gray-400 tracking-[1.5px] uppercase font-medium truncate">
                BY KINS.AI
              </p>
            </div>
          </div>
        </div>

        {/* WORKSPACE SELECTOR */}
        <div className="px-4 py-4 shrink-0">
          <button className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06] transition">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                K
              </div>

              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  KINS.AI Workspace
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  Production Ops
                </p>
              </div>
            </div>

            <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 min-h-0 px-3 space-y-6 pb-4 overflow-y-auto scrollbar-hidden">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className="text-[10px] tracking-[1.8px] font-semibold text-gray-400 px-3 mb-2.5 uppercase">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = activePage === item.name

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActivePage(item.name)
                        if (item.name === 'Callback Requests' || item.name === 'Tasks & Approvals') {
                          void fetchCallbackRequests()
                        } else if (item.name === 'Leads CRM' || item.name === 'Overview' || item.name === 'AI Inbox') {
                          void fetchEnquiries()
                          void fetchCallbackRequests()
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition ${
                        active
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      {item.name === 'Callback Requests' && callbackStats.pending_review > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {callbackStats.pending_review}
                        </span>
                      )}
                      {item.name === 'Tasks & Approvals' && callbackStats.pending_review > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          {callbackStats.pending_review}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* PROFILE */}
        <div className="p-3.5 shrink-0 border-t border-white/[0.07]">
          <div
            onClick={() => setActivePage('Settings')}
            className="flex items-center gap-2.5 p-1.5 cursor-pointer hover:bg-white/[0.06] rounded-lg transition"
            title="Open Workspace Settings"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              SH
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Workspace Admin
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Administrator
              </p>
            </div>

            <Settings size={15} className="text-gray-400 shrink-0 hover:text-white" />
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ======================================================== */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden flex flex-col">

        {/* TOPBAR */}
        <header className="h-[76px] shrink-0 sticky top-0 z-20 bg-white border-b border-[#e3eaf4] px-8 flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#687b96]">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-[#142947] font-semibold">
                {activePage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#f4f7fc] border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500">
              <Search size={14} className="text-gray-400" />
              <span>Search operations...</span>
              <span className="ml-6 border border-gray-200 bg-white rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
                Ctrl K
              </span>
            </div>

            <button
              onClick={() => setActivePage('Callback Requests')}
              className="relative p-2 text-gray-500 hover:text-gray-800 transition"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {callbackStats.pending_review > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            <div className="w-8 h-8 rounded-full bg-blue-600/15 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              SH
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div className="p-8 max-w-[1500px] w-full mx-auto space-y-6">

          {/* ======================================================== */}
          {/* 1. OVERVIEW DASHBOARD */}
          {/* ======================================================== */}
          {activePage === 'Overview' && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
                    WORKSPACE OVERVIEW
                  </p>

                  <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
                    Welcome to AI Sales Care
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Your AI teammate workspace for sales, multilingual voice conversations, and human-in-the-loop customer operations.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      void fetchEnquiries()
                      void fetchCallbackRequests()
                    }}
                    className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-2xs"
                  >
                    <RefreshCw size={14} className={loading || callbackLoading ? 'animate-spin' : ''} />
                    Refresh Stats
                  </button>

                  <button
                    onClick={() => setActivePage('AI Agents')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-lg text-xs font-medium text-white shadow-xs"
                  >
                    <Plus size={15} />
                    View AI Agents
                  </button>
                </div>
              </div>

              {/* SYSTEM READINESS CARDS */}
              <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={17} className="text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Workspace readiness
                    </h3>
                  </div>

                  <span className="text-[11px] text-gray-500">
                    Transparent operational indicators
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                  {/* Card 1: AI Agent Engine */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      AI Agent Engine
                    </p>
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200/50">
                      Configured – Draft
                    </span>
                    <p className="text-xs text-gray-600 mt-2">
                      Sarvam AI agent configured; deployment pending.
                    </p>
                  </div>

                  {/* Card 2: Voice Integration */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Voice Integration
                    </p>
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200/50">
                      Deployment not verified
                    </span>
                    <p className="text-xs text-gray-600 mt-2">
                      Test call dispatched; production deployment pending verification.
                    </p>
                  </div>

                  {/* Card 3: Callback API */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Callback API
                    </p>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/50">
                      Operational – Tested
                    </span>
                    <p className="text-xs text-gray-600 mt-2">
                      Authenticated callback API and CRM storage verified.
                    </p>
                  </div>

                  {/* Card 4: Database */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Database
                    </p>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/50">
                      Connected
                    </span>
                    <p className="text-xs text-gray-600 mt-2">
                      Callback records successfully saved to PostgreSQL.
                    </p>
                  </div>

                </div>
              </div>

              {/* REAL METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-medium">Total Leads</p>
                    <Users size={17} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold mt-4 text-gray-900">
                    {loading ? '...' : enquiries.length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Customer enquiries in PostgreSQL
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-medium">Callback Requests</p>
                    <CalendarDays size={17} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-4 text-blue-600">
                    {callbackLoading ? '...' : callbackStats.total}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Collected via AI Voice Agent
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-medium">Pending Review</p>
                    <Clock size={17} className="text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold mt-4 text-amber-600">
                    {callbackLoading ? '...' : callbackStats.pending_review}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Awaiting administrator action
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 font-medium">Follow-ups Handled</p>
                    <CheckCircle2 size={17} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold mt-4 text-emerald-600">
                    {callbackLoading ? '...' : callbackStats.contacted + callbackStats.completed}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {callbackStats.contacted} contacted, {callbackStats.completed} completed
                  </p>
                </div>
              </div>

              {/* LOWER SECTION */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {/* RECENT ACTIVITY */}
                <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Recent activity
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Latest workspace enquiries & callbacks
                      </p>
                    </div>

                    <ArrowUpRight size={17} className="text-gray-400" />
                  </div>

                  {enquiries.length > 0 || callbackRequests.length > 0 ? (
                    <div className="space-y-3">
                      {callbackRequests.slice(0, 3).map((cb) => (
                        <div
                          key={cb.id}
                          onClick={() => {
                            setSelectedCallback(cb)
                            setIsModalOpen(true)
                          }}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <PhoneCall size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-gray-900 font-medium truncate">
                                Voice callback from {cb.customer_name}
                              </p>
                              <CallbackStatusBadge status={cb.status} showIcon={false} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Time: {cb.preferred_time} • {formatDate(cb.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {enquiries.slice(0, 2).map((enquiry) => (
                        <div
                          key={enquiry.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                        >
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Users size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium truncate">
                              New enquiry from {enquiry.customer_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Source: {enquiry.source} • {formatDate(enquiry.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Activity size={25} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        No activity yet
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        New customer enquiries and callbacks will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* QUICK ACTIONS */}
                <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-2xs">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Quick actions
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage your operations
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        title: 'Review Callback Requests',
                        desc: `${callbackStats.pending_review} requests waiting for follow-up`,
                        icon: CalendarDays,
                        page: 'Callback Requests',
                      },
                      {
                        title: 'AI Inbox (Gemini Qualification)',
                        desc: 'AI intent classification & personalized drafts',
                        icon: Inbox,
                        page: 'AI Inbox',
                      },
                      {
                        title: 'AI Voice Telephony',
                        desc: 'Multilingual calling & outbound dispatcher',
                        icon: Headset,
                        page: 'AI Voice',
                      },
                      {
                        title: 'Tasks & Approvals',
                        desc: 'Human-in-the-loop task escalation center',
                        icon: CheckSquare,
                        page: 'Tasks & Approvals',
                      },
                    ].map((action) => {
                      const Icon = action.icon

                      return (
                        <button
                          key={action.title}
                          onClick={() => setActivePage(action.page)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon size={17} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {action.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {action.desc}
                            </p>
                          </div>

                          <ArrowUpRight size={15} className="text-gray-400 shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 2. AI INBOX */}
          {/* ======================================================== */}
          {activePage === 'AI Inbox' && (
            <AIInboxView
              enquiries={enquiries}
              loading={loading}
              onRefresh={fetchEnquiries}
            />
          )}

          {/* ======================================================== */}
          {/* 3. AI VOICE */}
          {/* ======================================================== */}
          {activePage === 'AI Voice' && <AIVoiceView />}

          {/* ======================================================== */}
          {/* 4. LEADS CRM */}
          {/* ======================================================== */}
          {activePage === 'Leads CRM' && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
                    CUSTOMER MANAGEMENT
                  </p>

                  <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
                    Leads CRM
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage and track customer enquiries from one place.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={fetchEnquiries}
                    disabled={loading}
                    className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-2xs"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </button>

                  <button
                    onClick={() => {
                      setShowAddLead(true)
                      setFormMessage('')
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-xs"
                  >
                    <Plus size={15} />
                    Add Lead
                  </button>
                </div>
              </div>

              {/* CRM SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
                  <p className="text-xs text-gray-500 font-medium">Total Leads</p>
                  <h3 className="text-2xl font-bold mt-3 text-gray-900">
                    {loading ? '...' : enquiries.length}
                  </h3>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
                  <p className="text-xs text-gray-500 font-medium">New Enquiries</p>
                  <h3 className="text-2xl font-bold mt-3 text-blue-600">
                    {enquiries.filter((item) => item.status === 'new').length}
                  </h3>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
                  <p className="text-xs text-gray-500 font-medium">Lead Sources</p>
                  <h3 className="text-2xl font-bold mt-3 text-indigo-600">
                    {new Set(enquiries.map((item) => item.source)).size}
                  </h3>
                </div>
              </div>

              {/* SEARCH */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search by customer name, phone or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm outline-none border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={fetchEnquiries}
                    className="underline font-medium hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* TABLE */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Customer enquiries
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Records retrieved from PostgreSQL
                    </p>
                  </div>

                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                    {filteredEnquiries.length} records
                  </span>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-gray-500">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-blue-500" />
                    Loading customer enquiries...
                  </div>
                ) : error ? (
                  <div className="py-16 text-center text-gray-500">
                    Unable to retrieve records.
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      No leads found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Add a new lead or try another search.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/75 border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                            CUSTOMER
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[160px]">
                            CONTACT
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                            SOURCE
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                            STATUS
                          </th>
                          <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[130px]">
                            DATE
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {filteredEnquiries.map((enquiry) => (
                          <tr
                            key={enquiry.id}
                            className="hover:bg-blue-50/30 transition"
                          >
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-sm font-medium text-gray-900">
                                {enquiry.customer_name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 max-w-[220px] truncate">
                                {enquiry.message}
                              </p>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone size={13} className="text-gray-400" />
                                {enquiry.phone_number}
                              </div>

                              {enquiry.email && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                  <Mail size={12} />
                                  {enquiry.email}
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-600 font-medium">
                                {enquiry.source}
                              </span>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md capitalize font-medium">
                                {enquiry.status}
                              </span>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <CalendarDays size={13} />
                                {formatDate(enquiry.created_at)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 5. CALLBACK REQUESTS CRM */}
          {/* ======================================================== */}
          {activePage === 'Callback Requests' && (
            <>
              {/* PAGE HEADER */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-wider">
                    CUSTOMER MANAGEMENT & SUPERVISION
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-[#142947]">
                    Callback Requests CRM
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review AI-collected callback requests, coordinate customer follow-ups, and log internal notes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchCallbackRequests}
                    disabled={callbackLoading}
                    className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-2xs"
                    aria-label="Refresh callback requests"
                  >
                    <RefreshCw
                      size={14}
                      className={callbackLoading ? 'animate-spin' : ''}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* REAL METRICS SUMMARY TABS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                  {
                    id: 'all',
                    label: 'All Requests',
                    count: callbackStats.total,
                    color: 'text-gray-900',
                    border: 'border-gray-200',
                    icon: CalendarDays,
                  },
                  {
                    id: 'pending_review',
                    label: 'Pending Review',
                    count: callbackStats.pending_review,
                    color: 'text-amber-600',
                    border: 'border-amber-200',
                    icon: Clock,
                  },
                  {
                    id: 'contacted',
                    label: 'Contacted',
                    count: callbackStats.contacted,
                    color: 'text-blue-600',
                    border: 'border-blue-200',
                    icon: PhoneCall,
                  },
                  {
                    id: 'completed',
                    label: 'Completed',
                    count: callbackStats.completed,
                    color: 'text-emerald-600',
                    border: 'border-emerald-200',
                    icon: CheckCircle2,
                  },
                  {
                    id: 'cancelled',
                    label: 'Cancelled',
                    count: callbackStats.cancelled,
                    color: 'text-gray-500',
                    border: 'border-gray-200',
                    icon: XCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = callbackStatusFilter === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCallbackStatusFilter(item.id)}
                      className={`p-4 rounded-xl text-left border transition bg-white shadow-2xs ${
                        isSelected
                          ? `ring-2 ring-blue-500 ${item.border} shadow-sm`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="font-medium">{item.label}</span>
                        <Icon size={14} className={item.color} />
                      </div>
                      <p className={`text-2xl font-bold ${item.color}`}>
                        {callbackLoading ? '...' : item.count}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1 min-w-[260px]">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone number, reason, or notes..."
                    value={callbackSearch}
                    onChange={(e) => setCallbackSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                    <SlidersHorizontal size={13} />
                    <span>Filter:</span>
                    <strong className="capitalize text-gray-700">
                      {callbackStatusFilter.replace(/_/g, ' ')}
                    </strong>
                  </div>

                  {(callbackSearch || callbackStatusFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCallbackSearch('')
                        setCallbackStatusFilter('all')
                      }}
                      className="text-xs text-blue-600 hover:underline px-2 py-1 font-medium"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              {/* ERROR BANNER */}
              {callbackError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center justify-between"
                >
                  <span>{callbackError}</span>
                  <button
                    onClick={fetchCallbackRequests}
                    className="underline font-medium hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* CALLBACKS TABLE */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">
                      Customer callback requests
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Records stored in PostgreSQL from Sarvam Voice Agent interactions
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                    Showing {filteredCallbacks.length} of {callbackRequests.length}
                  </span>
                </div>

                {callbackLoading ? (
                  <div className="py-16 text-center text-gray-500">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-blue-500" />
                    Loading callback requests...
                  </div>
                ) : callbackError ? (
                  <div className="py-16 text-center text-gray-500">
                    Unable to retrieve callback requests.
                  </div>
                ) : filteredCallbacks.length === 0 ? (
                  <div className="py-16 text-center">
                    <CalendarDays size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      No callback requests found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {callbackSearch || callbackStatusFilter !== 'all'
                        ? 'Try adjusting your search query or status filter.'
                        : 'New callback requests recorded by the AI agent will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/75 border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[170px]">
                            CUSTOMER
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                            PHONE
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                            PREFERRED TIME
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[240px] max-w-[340px]">
                            REASON / INTENT
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                            STATUS
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[170px]">
                            LAST UPDATED
                          </th>
                          <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px] text-right">
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCallbacks.map((request) => (
                          <tr
                            key={request.id}
                            onClick={() => {
                              setSelectedCallback(request)
                              setIsModalOpen(true)
                            }}
                            className="hover:bg-blue-50/40 transition cursor-pointer group"
                          >
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                {request.customer_name}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Rec: {formatDate(request.created_at)}
                              </p>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <Phone size={13} className="text-gray-400 shrink-0" />
                                {request.phone_number}
                              </div>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                <Clock size={13} className="text-gray-400 shrink-0" />
                                <span>{request.preferred_time || '—'}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-xs text-gray-700 max-w-[320px] line-clamp-2" title={request.reason || ''}>
                                {request.reason || '—'}
                              </p>
                              {request.follow_up_notes && (
                                <p className="text-[11px] text-blue-600 italic mt-1 max-w-[320px] truncate" title={request.follow_up_notes}>
                                  Notes: {request.follow_up_notes}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <CallbackStatusBadge status={request.status} />
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="text-xs text-gray-600 font-medium">
                                {formatDateTime(request.updated_at || request.created_at)}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {request.updated_by ? `by ${request.updated_by}` : 'AI collected'}
                              </p>
                            </td>

                            <td className="px-5 py-4 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCallback(request)
                                  setIsModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs whitespace-nowrap shrink-0"
                              >
                                <Eye size={13} />
                                <span>Follow Up</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 6. AI AGENTS */}
          {/* ======================================================== */}
          {activePage === 'AI Agents' && (
            <AIAgentsView
              onNavigateToVoice={() => setActivePage('AI Voice')}
              onNavigateToInbox={() => setActivePage('AI Inbox')}
            />
          )}

          {/* ======================================================== */}
          {/* 7. WORKFLOWS */}
          {/* ======================================================== */}
          {activePage === 'Workflows' && <WorkflowsView />}

          {/* ======================================================== */}
          {/* 8. TASKS & APPROVALS */}
          {/* ======================================================== */}
          {activePage === 'Tasks & Approvals' && (
            <TasksApprovalsView
              callbacks={callbackRequests}
              stats={callbackStats}
              loading={callbackLoading}
              onRefresh={fetchCallbackRequests}
              onSelectCallback={(cb) => {
                setSelectedCallback(cb)
                setIsModalOpen(true)
              }}
            />
          )}

          {/* ======================================================== */}
          {/* ADD LEAD MODAL */}
          {/* ======================================================== */}
          {showAddLead && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Add New Lead
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Save a customer enquiry to PostgreSQL.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddLead(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddLead} className="p-6 space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_name: e.target.value,
                        })
                      }
                      placeholder="Enter customer name"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      required
                      minLength={10}
                      maxLength={15}
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      placeholder="customer@example.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enquiry Message *
                    </label>
                    <textarea
                      required
                      minLength={5}
                      maxLength={2000}
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message: e.target.value,
                        })
                      }
                      placeholder="What is the customer interested in?"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {formMessage && (
                    <p className={`text-sm ${
                      formMessage.includes('successfully')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formMessage}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddLead(false)}
                      className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 shadow-xs"
                    >
                      {submitting ? 'Saving...' : 'Save Lead'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. ANALYTICS */}
          {/* ======================================================== */}
          {activePage === 'Analytics' && (
            <AnalyticsView
              callbacks={callbackRequests}
              stats={callbackStats}
              enquiries={enquiries}
              loading={callbackLoading}
              onRefresh={() => {
                void fetchCallbackRequests()
                void fetchEnquiries()
              }}
            />
          )}

          {/* ======================================================== */}
          {/* 10. SETTINGS */}
          {/* ======================================================== */}
          {activePage === 'Settings' && <SettingsView />}

          {/* MODAL ALWAYS AVAILABLE ON ANY VIEW */}
          <CallbackDetailsModal
            callback={selectedCallback}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdated={handleCallbackUpdated}
          />

        </div>
      </main>
    </div>
  )
}

export default App
