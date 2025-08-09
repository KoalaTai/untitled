import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ClipboardText, 
  ShieldCheck, 
  TrendUp, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Gear,
  ChartLine,
  FileText,
  Download,
  WarningCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

// Assessment question types and data structures
const ASSESSMENT_SECTIONS = {
  dataGovernance: {
    title: 'Data Governance & Security',
    icon: ShieldCheck,
    questions: [
      {
        id: 'data_classification',
        question: 'Does your organization have a comprehensive data classification system with sensitivity labels?',
        options: [
          { value: 4, label: 'Fully implemented with GxP-specific labels' },
          { value: 3, label: 'Basic system in place, needs GxP enhancement' },
          { value: 2, label: 'Limited classification system' },
          { value: 1, label: 'No formal data classification' }
        ]
      },
      {
        id: 'access_controls',
        question: 'How mature are your Identity and Access Management (IAM) controls?',
        options: [
          { value: 4, label: 'Role-based access with regular audits and clean permissions' },
          { value: 3, label: 'Role-based access with some permission sprawl' },
          { value: 2, label: 'Basic access controls with known gaps' },
          { value: 1, label: 'Minimal access controls, significant oversharing risks' }
        ]
      },
      {
        id: 'dlp_policies',
        question: 'What is the current state of your Data Loss Prevention (DLP) policies?',
        options: [
          { value: 4, label: 'Comprehensive DLP with AI-specific policies' },
          { value: 3, label: 'Basic DLP policies in place' },
          { value: 2, label: 'Limited DLP implementation' },
          { value: 1, label: 'No DLP policies implemented' }
        ]
      },
      {
        id: 'audit_capabilities',
        question: 'How comprehensive are your audit trail and eDiscovery capabilities?',
        options: [
          { value: 4, label: 'Full audit trails with eDiscovery ready for AI interactions' },
          { value: 3, label: 'Good audit capabilities, needs AI extension' },
          { value: 2, label: 'Basic audit logging' },
          { value: 1, label: 'Limited audit capabilities' }
        ]
      }
    ]
  },
  regulatory: {
    title: 'Regulatory & Compliance Maturity',
    icon: ClipboardText,
    questions: [
      {
        id: 'validation_approach',
        question: 'What is your current approach to system validation?',
        options: [
          { value: 4, label: 'Experienced with Computer Software Assurance (CSA)' },
          { value: 3, label: 'Traditional CSV with some risk-based elements' },
          { value: 2, label: 'Primarily traditional CSV approach' },
          { value: 1, label: 'Limited validation experience' }
        ]
      },
      {
        id: 'cfr_compliance',
        question: 'How well does your organization comply with 21 CFR Part 11?',
        options: [
          { value: 4, label: 'Full compliance with electronic records and signatures' },
          { value: 3, label: 'Generally compliant with minor gaps' },
          { value: 2, label: 'Partially compliant, working toward full compliance' },
          { value: 1, label: 'Limited 21 CFR Part 11 compliance' }
        ]
      },
      {
        id: 'gxp_processes',
        question: 'How mature are your GxP quality management processes?',
        options: [
          { value: 4, label: 'Mature QMS with digital transformation experience' },
          { value: 3, label: 'Solid QMS processes, traditional approach' },
          { value: 2, label: 'Basic QMS processes in place' },
          { value: 1, label: 'Developing QMS processes' }
        ]
      }
    ]
  },
  technical: {
    title: 'Technical Infrastructure',
    icon: Gear,
    questions: [
      {
        id: 'microsoft_365',
        question: 'What is your current Microsoft 365 deployment status?',
        options: [
          { value: 4, label: 'Enterprise-wide deployment with Purview governance' },
          { value: 3, label: 'Widespread deployment, limited governance' },
          { value: 2, label: 'Partial deployment across organization' },
          { value: 1, label: 'Limited or no Microsoft 365 deployment' }
        ]
      },
      {
        id: 'cloud_maturity',
        question: 'How mature is your cloud adoption and governance?',
        options: [
          { value: 4, label: 'Cloud-first with comprehensive governance' },
          { value: 3, label: 'Significant cloud adoption with basic governance' },
          { value: 2, label: 'Mixed on-premise and cloud environment' },
          { value: 1, label: 'Primarily on-premise with limited cloud' }
        ]
      },
      {
        id: 'it_security',
        question: 'How robust are your IT security practices?',
        options: [
          { value: 4, label: 'Zero-trust security model with advanced threat protection' },
          { value: 3, label: 'Strong security practices with room for improvement' },
          { value: 2, label: 'Basic security practices in place' },
          { value: 1, label: 'Limited security practices' }
        ]
      }
    ]
  },
  organizational: {
    title: 'Organizational Readiness',
    icon: Users,
    questions: [
      {
        id: 'change_management',
        question: 'How experienced is your organization with large-scale technology changes?',
        options: [
          { value: 4, label: 'Proven change management with digital transformation success' },
          { value: 3, label: 'Good change management capabilities' },
          { value: 2, label: 'Some change management experience' },
          { value: 1, label: 'Limited change management experience' }
        ]
      },
      {
        id: 'ai_awareness',
        question: 'What is the current level of AI awareness and acceptance?',
        options: [
          { value: 4, label: 'High AI literacy with enthusiastic leadership support' },
          { value: 3, label: 'Growing AI awareness with leadership buy-in' },
          { value: 2, label: 'Basic AI awareness, mixed leadership support' },
          { value: 1, label: 'Limited AI awareness and understanding' }
        ]
      },
      {
        id: 'training_capacity',
        question: 'How strong are your training and development capabilities?',
        options: [
          { value: 4, label: 'Comprehensive training programs with digital delivery' },
          { value: 3, label: 'Good training capabilities' },
          { value: 2, label: 'Basic training programs' },
          { value: 1, label: 'Limited training capabilities' }
        ]
      }
    ]
  }
}

// Risk assessment data
const RISK_FACTORS = [
  {
    id: 'hallucination',
    name: 'AI Hallucination',
    description: 'Model generates factually incorrect information',
    impact: ['Patient Safety', 'Regulatory Submissions'],
    mitigation: 'Human-in-the-Loop verification, grounded prompts'
  },
  {
    id: 'data_leakage',
    name: 'Information Leakage',
    description: 'Sensitive data shared inappropriately',
    impact: ['Data Privacy', 'Competitive Advantage'],
    mitigation: 'DLP policies, sensitivity labels, access controls'
  },
  {
    id: 'bias',
    name: 'Data Bias',
    description: 'AI produces discriminatory or skewed outputs',
    impact: ['Product Quality', 'Regulatory Compliance'],
    mitigation: 'Diverse training data, bias detection tools'
  },
  {
    id: 'non_determinism',
    name: 'Inconsistent Output',
    description: 'Different responses to similar prompts',
    impact: ['Process Repeatability', 'GxP Compliance'],
    mitigation: 'Standardized prompts, validation testing'
  }
]

// ROI calculation use cases
const ROI_USE_CASES = [
  {
    id: 'deviation_investigation',
    name: 'Deviation Investigation',
    description: 'AI-assisted analysis and summarization',
    baselineHours: 25,
    improvementPercent: 30
  },
  {
    id: 'regulatory_submission',
    name: 'Regulatory Submission Drafting',
    description: 'Initial drafts of technical documentation',
    baselineHours: 80,
    improvementPercent: 40
  },
  {
    id: 'audit_preparation',
    name: 'Internal Audit Preparation',
    description: 'Automated compliance checks and summaries',
    baselineHours: 120,
    improvementPercent: 50
  },
  {
    id: 'complaint_analysis',
    name: 'Complaint Data Analysis',
    description: 'Pattern identification and trend analysis',
    baselineHours: 16,
    improvementPercent: 60
  }
]

function App() {
  const [currentTab, setCurrentTab] = useState('setup')
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Initialize KV hooks with proper error handling
  const [assessmentAnswers, setAssessmentAnswers, deleteAssessmentAnswers] = useKV('assessment-answers', {})
  const [organizationInfo, setOrganizationInfo, deleteOrganizationInfo] = useKV('organization-info', {
    name: '',
    size: '',
    hourlyRate: 150
  })
  const [riskAssessment, setRiskAssessment, deleteRiskAssessment] = useKV('risk-assessment', {})
  const [selectedRisk, setSelectedRisk] = useState(null)

  // Ensure proper initialization
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assessment tool...</p>
        </div>
      </div>
    )
  }

  // Calculate assessment scores with null checks
  const calculateSectionScore = (sectionId) => {
    const section = ASSESSMENT_SECTIONS[sectionId]
    if (!section || !assessmentAnswers) return 0
    
    const answers = section.questions.map(q => assessmentAnswers[q.id] || 0)
    const total = answers.reduce((sum, score) => sum + score, 0)
    const maxPossible = section.questions.length * 4
    return Math.round((total / maxPossible) * 100)
  }

  const calculateOverallScore = () => {
    if (!assessmentAnswers) return 0
    
    const sectionScores = Object.keys(ASSESSMENT_SECTIONS).map(calculateSectionScore)
    return Math.round(sectionScores.reduce((sum, score) => sum + score, 0) / sectionScores.length)
  }

  const getReadinessLevel = (score) => {
    if (score >= 80) return { level: 'High', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
    if (score >= 60) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock }
    return { level: 'Low', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
  }

  // Calculate risk score for a specific risk
  const getRiskScore = (riskId) => {
    const likelihood = riskAssessment?.[`${riskId}_likelihood`] || 0
    const impact = riskAssessment?.[`${riskId}_impact`] || 0
    return likelihood * impact
  }

  // Get risk level based on score
  const getRiskLevel = (score) => {
    if (score >= 20) return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
    if (score >= 15) return { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' }
    if (score >= 10) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    if (score >= 5) return { level: 'Low', color: 'bg-green-100 text-green-800 border-green-200' }
    return { level: 'Minimal', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  // Validate if organization setup is complete
  const isOrganizationComplete = () => {
    return organizationInfo?.name && organizationInfo?.size && organizationInfo?.hourlyRate
  }

  // Check if assessment has meaningful progress
  const getAssessmentProgress = () => {
    if (!assessmentAnswers) return { completed: 0, total: 0, percentage: 0 }
    
    const totalQuestions = Object.values(ASSESSMENT_SECTIONS).reduce((sum, section) => sum + section.questions.length, 0)
    const answeredQuestions = Object.keys(assessmentAnswers).length
    
    return {
      completed: answeredQuestions,
      total: totalQuestions,
      percentage: Math.round((answeredQuestions / totalQuestions) * 100)
    }
  }

  const calculateROI = () => {
    if (!organizationInfo) return []
    
    const { hourlyRate = 150 } = organizationInfo
    return ROI_USE_CASES.map(useCase => {
      const timeSaved = (useCase.baselineHours * useCase.improvementPercent / 100)
      const annualValue = timeSaved * hourlyRate * 52 // Assuming weekly occurrence
      return {
        ...useCase,
        timeSaved,
        annualValue
      }
    })
  }

  const generateImplementationPlan = () => {
    const overallScore = calculateOverallScore()
    const progress = getAssessmentProgress()
    const phases = []

    // Only generate meaningful roadmap if assessment has some progress
    if (progress.percentage < 25) {
      phases.push({
        phase: 1,
        title: 'Complete Assessment',
        duration: '1-2 weeks',
        activities: [
          'Complete all assessment sections for accurate roadmap',
          'Gather stakeholder input across IT, Quality, and Regulatory teams',
          'Review organizational readiness with leadership',
          'Identify key champions and early adopters'
        ]
      })
      return phases
    }

    // Phase 1: Always foundational
    phases.push({
      phase: 1,
      title: 'Foundation & Governance',
      duration: '2-3 months',
      activities: [
        'Establish cross-functional AI Council with executive sponsorship',
        'Complete comprehensive data hygiene assessment and remediation',
        'Implement Microsoft Purview controls and sensitivity labels',
        'Develop GxP-specific data governance policies',
        'Create AI usage guidelines and acceptable use policies'
      ]
    })

    // Phase 2: Based on readiness and specific gaps
    const sectionScores = Object.keys(ASSESSMENT_SECTIONS).reduce((acc, sectionId) => {
      acc[sectionId] = calculateSectionScore(sectionId)
      return acc
    }, {})

    const phase2Activities = []
    
    if (overallScore >= 70) {
      // High readiness - can move to pilot quickly
      phases.push({
        phase: 2,
        title: 'Pilot Implementation',
        duration: '3-4 months',
        activities: [
          'Launch pilot with audit preparation use case (low risk)',
          'Train initial cohort of 10-15 AI Champions',
          'Implement Computer Software Assurance (CSA) validation framework',
          'Deploy Microsoft Copilot to pilot group with full monitoring',
          'Establish success metrics and KPI tracking',
          'Document lessons learned and best practices'
        ]
      })
    } else if (overallScore >= 50) {
      // Medium readiness - need capability building
      phase2Activities.push('Strengthen technical infrastructure and cloud governance')
      
      if (sectionScores.dataGovernance < 60) {
        phase2Activities.push('Implement comprehensive data classification system')
        phase2Activities.push('Deploy Data Loss Prevention (DLP) policies')
      }
      
      if (sectionScores.regulatory < 60) {
        phase2Activities.push('Train team on Computer Software Assurance (CSA) methodology')
        phase2Activities.push('Develop GxP validation templates and procedures')
      }
      
      if (sectionScores.organizational < 60) {
        phase2Activities.push('Develop comprehensive change management program')
        phase2Activities.push('Build AI literacy through organization-wide training')
      }
      
      phase2Activities.push('Conduct limited pilot with low-risk administrative use cases')
      
      phases.push({
        phase: 2,
        title: 'Capability Development',
        duration: '6-9 months',
        activities: phase2Activities
      })
    } else {
      // Low readiness - significant preparation needed
      phases.push({
        phase: 2,
        title: 'Infrastructure & Capability Building',
        duration: '9-12 months',
        activities: [
          'Upgrade Microsoft 365 infrastructure and security posture',
          'Implement comprehensive identity and access management',
          'Establish mature data governance practices',
          'Build internal validation and compliance capabilities',
          'Develop organizational change management expertise',
          'Create foundational AI training and awareness programs',
          'Establish vendor management processes for AI technologies'
        ]
      })
    }

    // Phase 3: Expansion (only if readiness is sufficient)
    if (overallScore >= 50) {
      const phase3Activities = [
        'Expand deployment to Quality Assurance and Regulatory Affairs',
        'Implement medium-risk use cases (deviation investigation, CAPA support)',
        'Develop role-specific training programs and competency assessments',
        'Establish continuous monitoring and audit processes'
      ]

      if (overallScore >= 70) {
        phase3Activities.push('Scale to additional departments based on business value')
        phase3Activities.push('Implement advanced use cases with higher risk profiles')
      }

      phases.push({
        phase: 3,
        title: 'Controlled Expansion',
        duration: overallScore >= 70 ? '6-9 months' : '12-18 months',
        activities: phase3Activities
      })
    }

    // Phase 4: Enterprise scale (only for high-readiness organizations)
    if (overallScore >= 70) {
      phases.push({
        phase: 4,
        title: 'Enterprise Optimization',
        duration: 'Ongoing',
        activities: [
          'Enterprise-wide rollout with role-based access controls',
          'Advanced analytics and usage optimization',
          'Continuous improvement based on user feedback and metrics',
          'Regular compliance assessments and audit readiness',
          'Innovation pipeline for new AI use cases and technologies'
        ]
      })
    }

    return phases
  }

  const exportResults = () => {
    if (!isOrganizationComplete()) {
      toast.error('Please complete organization setup before exporting.')
      return
    }

    const progress = getAssessmentProgress()
    if (progress.percentage < 50) {
      toast.error('Please complete at least 50% of the assessment before exporting.')
      return
    }

    const results = {
      organizationInfo: organizationInfo || {},
      assessmentScores: Object.keys(ASSESSMENT_SECTIONS).reduce((acc, sectionId) => {
        acc[sectionId] = calculateSectionScore(sectionId)
        return acc
      }, {}),
      overallScore: calculateOverallScore(),
      assessmentProgress: progress,
      riskAssessment: riskAssessment || {},
      roiCalculation: calculateROI(),
      implementationPlan: generateImplementationPlan(),
      generatedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `copilot-assessment-${organizationInfo?.name?.replace(/[^a-z0-9]/gi, '-') || 'organization'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Assessment results exported successfully!')
  }

  const resetAssessment = () => {
    if (window.confirm('Are you sure you want to reset all assessment data? This action cannot be undone.')) {
      deleteAssessmentAnswers()
      deleteOrganizationInfo()
      deleteRiskAssessment()
      setSelectedRisk(null)
      setCurrentTab('setup')
      toast.success('Assessment data has been reset.')
    }
  }

  const AssessmentSection = ({ sectionId, section }) => {
    const score = calculateSectionScore(sectionId)
    const readiness = getReadinessLevel(score)
    const IconComponent = section.icon

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconComponent size={24} className="text-primary" />
              <CardTitle>{section.title}</CardTitle>
            </div>
            <Badge className={readiness.color}>
              {readiness.level} ({score}%)
            </Badge>
          </div>
          <Progress value={score} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {section.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-sm font-medium leading-relaxed">
                {index + 1}. {question.question}
              </Label>
              <RadioGroup
                value={assessmentAnswers?.[question.id]?.toString() || ''}
                onValueChange={(value) => {
                  setAssessmentAnswers(prev => ({
                    ...(prev || {}),
                    [question.id]: parseInt(value)
                  }))
                }}
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                    <Label htmlFor={`${question.id}-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Target size={32} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">AI Copilot Implementation Assessment</h1>
              <p className="text-primary-foreground/80 mt-1">
                Strategic framework for Microsoft Copilot in GxP-regulated environments
              </p>
            </div>
            {getAssessmentProgress().percentage > 0 && (
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-foreground">
                    {getAssessmentProgress().percentage}%
                  </div>
                  <p className="text-xs text-primary-foreground/80">Complete</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Users size={16} />
              Setup
              {isOrganizationComplete() && <CheckCircle size={12} className="text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <ClipboardText size={16} />
              Assessment
              {getAssessmentProgress().percentage > 0 && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {getAssessmentProgress().percentage}%
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Risk Analysis
              {Object.keys(riskAssessment || {}).length > 0 && <CheckCircle size={12} className="text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <TrendUp size={16} />
              ROI Calculator
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <ChartLine size={16} />
              Roadmap
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Organization Setup
                </CardTitle>
                <CardDescription>
                  Provide basic information about your organization to personalize the assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      placeholder="e.g., Acme Life Sciences"
                      value={organizationInfo?.name || ''}
                      onChange={(e) => setOrganizationInfo(prev => ({ ...(prev || {}), name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-size">Organization Size</Label>
                    <Input
                      id="org-size"
                      placeholder="e.g., 500-1000 employees"
                      value={organizationInfo?.size || ''}
                      onChange={(e) => setOrganizationInfo(prev => ({ ...(prev || {}), size: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Average Fully-Burdened Hourly Rate ($)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    min="50"
                    max="500"
                    placeholder="150"
                    value={organizationInfo?.hourlyRate || 150}
                    onChange={(e) => setOrganizationInfo(prev => ({ ...(prev || {}), hourlyRate: parseInt(e.target.value) || 150 }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for ROI calculations. Include salary, benefits, and overhead costs.
                  </p>
                </div>
                
                {!isOrganizationComplete() && (
                  <Alert>
                    <AlertTriangle size={16} />
                    <AlertDescription>
                      Please complete all fields above to continue with the assessment.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={() => setCurrentTab('assessment')} 
                    className="flex-1"
                    disabled={!isOrganizationComplete()}
                  >
                    Continue to Assessment
                  </Button>
                  {(organizationInfo?.name || assessmentAnswers && Object.keys(assessmentAnswers).length > 0) && (
                    <Button onClick={resetAssessment} variant="outline" className="text-destructive">
                      Reset All Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment">
            <div className="space-y-6">
              {/* Overall Score Card */}
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Readiness Score</span>
                    <Badge className={getReadinessLevel(calculateOverallScore()).color} variant="secondary">
                      {getReadinessLevel(calculateOverallScore()).level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      {calculateOverallScore()}%
                    </div>
                    <Progress value={calculateOverallScore()} className="flex-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Sections */}
              {Object.entries(ASSESSMENT_SECTIONS).map(([sectionId, section]) => (
                <AssessmentSection key={sectionId} sectionId={sectionId} section={section} />
              ))}

              <div className="flex gap-4">
                <Button onClick={() => setCurrentTab('risks')} className="flex-1">
                  Continue to Risk Analysis
                </Button>
                <Button onClick={exportResults} variant="outline">
                  <Download size={16} className="mr-2" />
                  Export Results
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risks">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Factor List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle size={20} />
                      AI Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {RISK_FACTORS.map(risk => {
                        const riskScore = getRiskScore(risk.id)
                        const riskLevel = getRiskLevel(riskScore)
                        return (
                          <div key={risk.id} className="flex items-center gap-2">
                            <Button
                              variant={selectedRisk?.id === risk.id ? "default" : "outline"}
                              className="flex-1 justify-start"
                              onClick={() => setSelectedRisk(risk)}
                            >
                              {risk.name}
                            </Button>
                            <Badge className={`${riskLevel.color} text-xs`}>
                              {riskLevel.level}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Details */}
              <div className="lg:col-span-2">
                {selectedRisk ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedRisk.name}</CardTitle>
                      <CardDescription>{selectedRisk.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Potential Impact Areas</Label>
                        <div className="flex gap-2 mt-2">
                          {selectedRisk.impact.map(impact => (
                            <Badge key={impact} variant="destructive">
                              {impact}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm font-medium">Recommended Mitigation</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedRisk.mitigation}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Risk Assessment for Your Organization</Label>
                          {getRiskScore(selectedRisk.id) > 0 && (
                            <Badge className={getRiskLevel(getRiskScore(selectedRisk.id)).color}>
                              {getRiskLevel(getRiskScore(selectedRisk.id)).level} Risk (Score: {getRiskScore(selectedRisk.id)})
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Likelihood (1-5)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={riskAssessment?.[`${selectedRisk.id}_likelihood`] || ''}
                              onChange={(e) => setRiskAssessment(prev => ({
                                ...(prev || {}),
                                [`${selectedRisk.id}_likelihood`]: parseInt(e.target.value) || 1
                              }))}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              How likely is this risk to occur?
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs">Impact (1-5)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={riskAssessment?.[`${selectedRisk.id}_impact`] || ''}
                              onChange={(e) => setRiskAssessment(prev => ({
                                ...(prev || {}),
                                [`${selectedRisk.id}_impact`]: parseInt(e.target.value) || 1
                              }))}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              How severe would the impact be?
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Mitigation Notes</Label>
                          <Textarea
                            placeholder="Specific mitigation strategies for your organization..."
                            value={riskAssessment?.[`${selectedRisk.id}_notes`] || ''}
                            onChange={(e) => setRiskAssessment(prev => ({
                              ...(prev || {}),
                              [`${selectedRisk.id}_notes`]: e.target.value
                            }))}
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                      Select a risk factor to view details and assess it for your organization
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => setCurrentTab('roi')} className="w-full">
                Continue to ROI Calculator
              </Button>
            </div>
          </TabsContent>

          {/* ROI Calculator Tab */}
          <TabsContent value="roi">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp size={20} />
                    ROI Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate potential return on investment for key GxP use cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {calculateROI().map(useCase => (
                      <Card key={useCase.id} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{useCase.name}</CardTitle>
                          <CardDescription>{useCase.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Baseline Hours:</span>
                            <span className="font-medium">{useCase.baselineHours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Improvement:</span>
                            <span className="font-medium text-green-600">{useCase.improvementPercent}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Time Saved:</span>
                            <span className="font-medium">{useCase.timeSaved.toFixed(1)}h</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Annual Value:</span>
                            <span className="text-green-600">${useCase.annualValue.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${calculateROI().reduce((sum, useCase) => sum + useCase.annualValue, 0).toLocaleString()}
                        </div>
                        <p className="text-lg font-medium">Total Estimated Annual Value</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {organizationInfo?.hourlyRate ? `$${organizationInfo.hourlyRate}` : '$150'}/hour fully-burdened rate
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Button onClick={() => setCurrentTab('roadmap')} className="w-full">
                Generate Implementation Roadmap
              </Button>
            </div>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap">
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine size={20} />
                    Implementation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {calculateOverallScore()}%
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Readiness</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${calculateROI().reduce((sum, useCase) => sum + useCase.annualValue, 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Annual ROI</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getAssessmentProgress().percentage}%
                      </div>
                      <p className="text-sm text-muted-foreground">Assessment Complete</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {generateImplementationPlan().length}
                      </div>
                      <p className="text-sm text-muted-foreground">Implementation Phases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Phases */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategic Implementation Roadmap</CardTitle>
                  <CardDescription>
                    Phased approach tailored to your organization's readiness level
                  </CardDescription>
                </CardHeader>
              </Card>

              {generateImplementationPlan().map((phase, index) => (
                <Card key={phase.phase}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary text-primary-foreground">
                        Phase {phase.phase}
                      </Badge>
                      <CardTitle>{phase.title}</CardTitle>
                      <Badge variant="outline" className="ml-auto">
                        {phase.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.activities.map((activity, activityIndex) => (
                        <li key={activityIndex} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              <Alert>
                <AlertTriangle size={16} />
                <AlertDescription>
                  <strong>Important:</strong> This roadmap is based on your assessment responses. 
                  {getAssessmentProgress().percentage < 80 && 
                    ' Complete more assessment questions for a more detailed roadmap.'
                  } Consider engaging with Microsoft partners or consultants for detailed implementation planning.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button onClick={exportResults} className="flex-1">
                  <Download size={16} className="mr-2" />
                  Export Complete Assessment
                </Button>
                <Button onClick={() => setCurrentTab('assessment')} variant="outline">
                  Review Assessment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App