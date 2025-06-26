"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Calendar, Clock, MapPin, Heart, Filter, Search, Video, MessageCircle, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Therapist {
  id: number
  name: string
  specialty: string[]
  rating: number
  reviews: number
  experience: number
  price: number
  availability: string[]
  image: string
  description: string
  credentials: string[]
  languages: string[]
  sessionTypes: string[]
  nextAvailable: string
  verified: boolean
}

const therapists: Therapist[] = [
  {
    id: 1,
    name: "Dra. Ana Carolina Silva",
    specialty: ["Terapia de Casal", "Relacionamentos", "Ansiedade"],
    rating: 4.9,
    reviews: 127,
    experience: 8,
    price: 180,
    availability: ["Segunda", "Terça", "Quinta"],
    image: "/placeholder.svg?height=200&width=200",
    description:
      "Especialista em terapia de casal com abordagem cognitivo-comportamental. Ajudo casais a desenvolverem comunicação saudável e resolverem conflitos.",
    credentials: ["CRP 06/123456", "Especialização em Terapia de Casal - USP"],
    languages: ["Português", "Inglês"],
    sessionTypes: ["Presencial", "Online"],
    nextAvailable: "Amanhã às 14h",
    verified: true,
  },
  {
    id: 2,
    name: "Dr. Rafael Mendes",
    specialty: ["Autoestima", "Relacionamentos", "Desenvolvimento Pessoal"],
    rating: 4.8,
    reviews: 89,
    experience: 6,
    price: 150,
    availability: ["Quarta", "Sexta", "Sábado"],
    image: "/placeholder.svg?height=200&width=200",
    description:
      "Psicólogo clínico focado em autoestima e desenvolvimento pessoal. Utilizo técnicas humanísticas para promover autoconhecimento.",
    credentials: ["CRP 06/789012", "Mestrado em Psicologia Clínica - PUC"],
    languages: ["Português", "Espanhol"],
    sessionTypes: ["Online", "Presencial"],
    nextAvailable: "Hoje às 16h",
    verified: true,
  },
  {
    id: 3,
    name: "Dra. Mariana Costa",
    specialty: ["Trauma", "EMDR", "Relacionamentos"],
    rating: 4.9,
    reviews: 156,
    experience: 12,
    price: 220,
    availability: ["Segunda", "Quarta", "Sexta"],
    image: "/placeholder.svg?height=200&width=200",
    description:
      "Especialista em trauma e EMDR. Trabalho com pessoas que enfrentaram experiências difíceis em relacionamentos passados.",
    credentials: ["CRP 06/345678", "Certificação EMDR", "Doutorado em Psicologia - UFRJ"],
    languages: ["Português", "Inglês", "Francês"],
    sessionTypes: ["Presencial", "Online"],
    nextAvailable: "Terça às 10h",
    verified: true,
  },
]

function TherapistMarketplace() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [selectedPrice, setSelectedPrice] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.specialty.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSpecialty = !selectedSpecialty || therapist.specialty.includes(selectedSpecialty)
    const matchesPrice =
      !selectedPrice ||
      (selectedPrice === "low" && therapist.price <= 150) ||
      (selectedPrice === "medium" && therapist.price > 150 && therapist.price <= 200) ||
      (selectedPrice === "high" && therapist.price > 200)

    return matchesSearch && matchesSpecialty && matchesPrice
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-gray-900">Marketplace de Terapeutas</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Encontre o terapeuta ideal para sua jornada de autoconhecimento e desenvolvimento de relacionamentos saudáveis
        </p>
      </div>

      {/* Filters */}
      <Card className="border-rose-200 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Especialidade</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as especialidades</SelectItem>
                  <SelectItem value="Terapia de Casal">Terapia de Casal</SelectItem>
                  <SelectItem value="Relacionamentos">Relacionamentos</SelectItem>
                  <SelectItem value="Autoestima">Autoestima</SelectItem>
                  <SelectItem value="Ansiedade">Ansiedade</SelectItem>
                  <SelectItem value="Trauma">Trauma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Faixa de Preço</label>
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os preços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os preços</SelectItem>
                  <SelectItem value="low">Até R$ 150</SelectItem>
                  <SelectItem value="medium">R$ 151 - R$ 200</SelectItem>
                  <SelectItem value="high">Acima de R$ 200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ações</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedSpecialty("all")
                  setSelectedPrice("all")
                  setSearchTerm("")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {filteredTherapists.length}{" "}
          {filteredTherapists.length === 1 ? "terapeuta encontrado" : "terapeutas encontrados"}
        </p>
        <Select defaultValue="rating">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Melhor avaliação</SelectItem>
            <SelectItem value="price-low">Menor preço</SelectItem>
            <SelectItem value="price-high">Maior preço</SelectItem>
            <SelectItem value="experience">Mais experiência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Therapists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.map((therapist) => (
          <Card key={therapist.id} className="border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={therapist.image || "/placeholder.svg"}
                  alt={therapist.name}
                  width={300}
                  height={192}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {therapist.verified && (
                  <Badge className="absolute top-3 right-3 bg-[#CBA415] text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-gray-900">{therapist.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{therapist.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({therapist.reviews} avaliações)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialty.slice(0, 2).map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {therapist.specialty.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{therapist.specialty.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {therapist.experience} anos de experiência
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {therapist.nextAvailable}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-rose-100">
                  <div>
                    <span className="text-2xl font-bold text-[#D02E32]">R$ {therapist.price}</span>
                    <span className="text-sm text-gray-600">/sessão</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415]"
                        onClick={() => setSelectedTherapist(therapist)}
                      >
                        Ver Perfil
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      {selectedTherapist && <TherapistProfile therapist={selectedTherapist} />}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTherapists.length === 0 && (
        <Card className="border-rose-200 shadow-lg">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">Nenhum terapeuta encontrado</h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar seus filtros ou entre em contato conosco para encontrar o profissional ideal.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSpecialty("all")
                setSelectedPrice("all")
                setSearchTerm("")
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TherapistProfile({ therapist }: { therapist: Therapist }) {
  const [selectedTab, setSelectedTab] = useState("about")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={therapist.image || "/placeholder.svg"} />
          <AvatarFallback className="text-2xl">
            {therapist.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-serif font-bold text-gray-900">{therapist.name}</h2>
              {therapist.verified && (
                <Badge className="bg-[#CBA415] text-white">
                  <Award className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium ml-1">{therapist.rating}</span>
                <span className="text-gray-500 ml-1">({therapist.reviews} avaliações)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {therapist.experience} anos de experiência
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {therapist.specialty.map((spec, index) => (
              <Badge key={index} className="bg-rose-100 text-rose-800">
                {spec}
              </Badge>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-[#D02E32]">
              R$ {therapist.price}
              <span className="text-base font-normal text-gray-600">/sessão</span>
            </div>
            <div className="flex items-center text-green-600">
              <Calendar className="h-4 w-4 mr-1" />
              {therapist.nextAvailable}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">Sobre</TabsTrigger>
          <TabsTrigger value="credentials">Credenciais</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#D02E32]">Sobre o Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{therapist.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Idiomas</h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tipos de Sessão</h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.sessionTypes.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type === "Online" ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#D02E32]">Formação e Credenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {therapist.credentials.map((credential, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-rose-50 rounded-lg">
                    <Award className="h-5 w-5 text-[#CBA415]" />
                    <span className="text-gray-700">{credential}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#D02E32]">Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dias da Semana</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
                      <Badge
                        key={day}
                        className={
                          therapist.availability.includes(day)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-500"
                        }
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Próxima disponibilidade:</span>
                    <span className="text-green-700">{therapist.nextAvailable}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="border-rose-200">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-[#D02E32]">Avaliações dos Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Maria S.",
                    rating: 5,
                    comment: "Excelente profissional! Me ajudou muito a entender meus padrões de relacionamento.",
                    date: "Há 2 semanas",
                  },
                  {
                    name: "João P.",
                    rating: 5,
                    comment: "Muito empática e competente. Recomendo para quem busca autoconhecimento.",
                    date: "Há 1 mês",
                  },
                  {
                    name: "Ana L.",
                    rating: 4,
                    comment: "Ótima experiência. As sessões online funcionaram muito bem.",
                    date: "Há 2 meses",
                  },
                ].map((review, index) => (
                  <div key={index} className="p-4 border border-rose-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4 border-t border-rose-200">
        <Button className="flex-1 bg-gradient-to-r from-[#CBA415] to-[#956F02] text-white hover:from-[#956F02] hover:to-[#CBA415]">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Sessão
        </Button>
        <Button variant="outline" className="flex-1">
          <MessageCircle className="h-4 w-4 mr-2" />
          Enviar Mensagem
        </Button>
        <Button variant="outline">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default TherapistMarketplace
