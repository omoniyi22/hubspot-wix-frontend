// frontend/src/components/FieldMappingTable.tsx
import { CustomSelectItem } from './ui/custom-select-item'

import React, { useState, useEffect } from 'react'
import { Button } from './../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../components/ui/select'
import { Save, Loader2, Info } from 'lucide-react'
import { useToast } from './../hooks/use-toast'
import { FieldMapping, FieldMappingConfig, AvailableField } from './../types'

interface FieldMappingTableProps {
  instanceId: string
  initialMappings?: FieldMappingConfig
  wixFields: AvailableField[]
  hubSpotProperties: AvailableField[]
  onSave: (updates: Array<{ wixField: string; direction?: string; transform?: string | null; isActive?: boolean }>) => Promise<void>
  isLoading?: boolean
}

export function FieldMappingTable({ 
  instanceId, 
  initialMappings, 
  wixFields, 
  hubSpotProperties, 
  onSave,
  isLoading 
}: FieldMappingTableProps) {
  const { toast } = useToast()
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialMappings?.mappings && initialMappings.mappings.length > 0) {
      setMappings(initialMappings.mappings)
    } else {
      // Default fallback mappings
      setMappings([
        { wixField: 'email', hubSpotProperty: 'email', direction: 'bidirectional', transform: 'email', isEssential: true, isActive: true },
        { wixField: 'firstName', hubSpotProperty: 'firstname', direction: 'bidirectional', transform: 'trim', isEssential: true, isActive: true },
        { wixField: 'lastName', hubSpotProperty: 'lastname', direction: 'bidirectional', transform: 'trim', isEssential: true, isActive: true },
        { wixField: 'phone', hubSpotProperty: 'phone', direction: 'bidirectional', transform: 'trim', isEssential: true, isActive: true },
      ])
    }
  }, [initialMappings])

  const updateMapping = (index: number, field: keyof FieldMapping, value: string | boolean) => {
    const newMappings = [...mappings]
    newMappings[index] = { ...newMappings[index], [field]: value }
    setMappings(newMappings)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Build updates array with only the fields that can be changed
      const updates = mappings.map(m => ({
        wixField: m.wixField,
        direction: m.direction,
        transform: m.transform || null,
        isActive: m.isActive !== undefined ? m.isActive : true,
      }))
      
      // Send updates directly to parent
      await onSave(updates)
      
      toast({
        title: "Success",
        description: "Field mappings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save field mappings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const directionOptions = [
    { value: 'wix_to_hubspot', label: 'Wix → HubSpot' },
    { value: 'hubspot_to_wix', label: 'HubSpot → Wix' },
    { value: 'bidirectional', label: 'Bi-directional' },
  ]

  const transformOptions = [
    { value: 'none', label: 'None' },
    { value: 'trim', label: 'Trim' },
    { value: 'lowercase', label: 'Lowercase' },
    { value: 'uppercase', label: 'Uppercase' },
    { value: 'email', label: 'Email (trim + lowercase)' },
  ]

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="bg-white border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-900">Field Mapping</CardTitle>
        <CardDescription className="text-gray-600 mt-1">
          Configure how Wix contact fields map to HubSpot properties.
          Essential fields cannot be removed. New fields are automatically discovered from incoming webhooks.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Wix Field</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">HubSpot Property</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Sync Direction</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Transform</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-24">Active</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping, index) => (
                <tr key={`${mapping.wixField}-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{mapping.wixField}</span>
                      {mapping.isEssential && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Essential
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      → {mapping.hubSpotProperty}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 font-mono">{mapping.hubSpotProperty}</span>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Select
                      value={mapping.direction}
                      onValueChange={(value: any) => updateMapping(index, 'direction', value)}
                    >
                      <SelectTrigger className="w-[160px] h-9 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                        {directionOptions.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value} 
                            className="text-sm bg-white hover:bg-gray-100 cursor-pointer px-3 py-2 [&_svg]:hidden"

                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  
                  <td className="px-4 py-3">
                    <Select
                      value={mapping.transform || 'none'}
                      onValueChange={(value) => updateMapping(index, 'transform', value === 'none' ? undefined : value as any)}
                    >
                      <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                        {transformOptions.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value} 
                            className="text-sm bg-white hover:bg-gray-100 cursor-pointer px-3 py-2 [&_svg]:hidden"

                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={mapping.isActive !== false}
                          onChange={() => updateMapping(index, 'isActive', !mapping.isActive)}
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                      <span className="text-xs text-gray-600">
                        {mapping.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mx-4 my-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">About Field Mapping</p>
            <p>• Essential fields (email, firstName, lastName, phone) are always present and cannot be removed.</p>
            <p>• New fields from Wix contacts are automatically discovered and added to this list.</p>
            <p>• You can only change sync direction, text transformation, and enable/disable fields.</p>
            <p>• Inactive fields will not be synced in either direction.</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {(isSaving || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}