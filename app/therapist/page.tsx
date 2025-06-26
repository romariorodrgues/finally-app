"use client"

import { Construction, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TherapistPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-8">

        {/* Main Content */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <Construction className="h-20 w-20 text-[#CBA415] animate-pulse" />
          </div>

          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              Therapist Marketplace
            </h1>
            <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
              🚧 Under Development
            </Badge>
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            This feature is being developed with great care for you. 
            Soon you will be able to access therapists specialized in relationships 
            and receive professional support in your love journey.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="border-rose-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-[#D02E32]">
                <Users className="h-5 w-5 mr-2" />
                Specialized Therapists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access to professionals specialized in relationships and couples therapy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
