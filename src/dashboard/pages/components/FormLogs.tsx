// frontend/src/components/FormLogs.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { 
  RefreshCw, 
  Mail, 
  User, 
  Phone, 
  Calendar,
  Globe,
  ExternalLink,
  TrendingUp,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { syncApi } from '../api/client'

interface FormSubmission {
  id: string
  wixFormId: string
  wixFormName: string
  hubSpotContactId: string
  submittedAt: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmTerm: string
  utmContent: string
  pageUrl: string
  referrer: string
  leadStatus: string
  leadScore: number
  formData: any
}

interface FormLogsProps {
  instanceId: string
  onRefresh?: () => void
}

export function FormLogs({ instanceId, onRefresh }: FormLogsProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)

  useEffect(() => {
    loadFormSubmissions()
    loadFormStats()
  }, [instanceId])

  const loadFormSubmissions = async () => {
    setIsLoading(true)
    try {
      const result = await syncApi.getFormSubmissions(instanceId)
      setSubmissions(result.submissions || result.data?.submissions || [])
      setStats(result.stats || result.data?.stats)
    } catch (error) {
      console.error('Failed to load form submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFormStats = async () => {
    try {
      const response = await fetch(`/api/forms/stats/${instanceId}`)
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to load form stats:', error)
    }
  }

  const getLeadStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.leadStatus === filter)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.totalSubmissions || 0}</p>
                </div>
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last 7 Days</p>
                  <p className="text-2xl font-bold">{stats.last7Days || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                  <p className="text-2xl font-bold">
                    {stats.byStatus?.new || stats.byStatus?.new || 0}
                  </p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Lead Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(stats.totalSubmissions ? (stats.totalScore / stats.totalSubmissions) : 0) || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Sources */}
      {stats?.topSources && stats.topSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Traffic Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topSources.map((source: any, i: number) => (
                <Badge key={i} variant="outline" className="text-sm">
                  {source.source || 'direct'}: {source.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'new' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('new')}
        >
          New
        </Button>
        <Button 
          variant={filter === 'contacted' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('contacted')}
        >
          Contacted
        </Button>
        <Button 
          variant={filter === 'qualified' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('qualified')}
        >
          Qualified
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadFormSubmissions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Form Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
          <CardDescription>
            Recent form submissions with UTM attribution data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No form submissions yet</p>
                  <p className="text-sm">Form submissions will appear here when visitors fill out your forms</p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getLeadStatusBadge(sub.leadStatus)}>
                          {sub.leadStatus || 'new'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Score: {sub.leadScore || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(sub.submittedAt), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs">
                          {sub.formData?.submissionData?.find((f: any) => 
                            f.fieldName?.toLowerCase().includes('email')
                          )?.fieldValue || 'Email not found'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Form:</span>
                        <span>{sub.wixFormName || sub.wixFormId}</span>
                      </div>
                    </div>

                    {(sub.utmSource || sub.utmCampaign) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {sub.utmSource && (
                          <Badge variant="secondary" className="text-xs">
                            Source: {sub.utmSource}
                          </Badge>
                        )}
                        {sub.utmMedium && (
                          <Badge variant="secondary" className="text-xs">
                            Medium: {sub.utmMedium}
                          </Badge>
                        )}
                        {sub.utmCampaign && (
                          <Badge variant="secondary" className="text-xs">
                            Campaign: {sub.utmCampaign}
                          </Badge>
                        )}
                        {sub.pageUrl && (
                          <a 
                            href={sub.pageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3" />
                            Page URL
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Form Submission Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>✕</Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedSubmission.formData?.submissionData?.map((field: any, i: number) => (
                      <div key={i} className="border-b py-1">
                        <span className="font-medium">{field.fieldName}:</span>{' '}
                        <span>{field.fieldValue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">UTM Attribution</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Source:</span> {selectedSubmission.utmSource || '-'}</div>
                    <div><span className="font-medium">Medium:</span> {selectedSubmission.utmMedium || '-'}</div>
                    <div><span className="font-medium">Campaign:</span> {selectedSubmission.utmCampaign || '-'}</div>
                    <div><span className="font-medium">Term:</span> {selectedSubmission.utmTerm || '-'}</div>
                    <div><span className="font-medium">Content:</span> {selectedSubmission.utmContent || '-'}</div>
                    <div className="col-span-2"><span className="font-medium">Page URL:</span> {selectedSubmission.pageUrl || '-'}</div>
                    <div className="col-span-2"><span className="font-medium">Referrer:</span> {selectedSubmission.referrer || '-'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">HubSpot Contact</h3>
                  <div className="text-sm">
                    Contact ID: {selectedSubmission.hubSpotContactId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}