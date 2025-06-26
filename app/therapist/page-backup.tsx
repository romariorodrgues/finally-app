"use client"

import { useState } from "react"
import { Calendar, Users, TrendingUp, MessageCircle, FileText, Star, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-[#D02E32]" />
                <span className="text-2xl font-serif font-bold text-[#D02E32]">Finally Terapeuta</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-[#CBA415] text-white">Terapeuta</Badge>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clients">Meus Clientes</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <TherapistOverviewContent />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsContent />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleContent />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function TherapistOverviewContent() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Bem-vinda, Dra. Ana Carolina</h1>
        <p className="text-lg text-gray-600">Painel do terapeuta - Acompanhe seus atendimentos e clientes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D02E32]">24</div>
            <p className="text-xs text-green-600">+3 este mês</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Sessões Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#CBA415]">67</div>
            <p className="text-xs text-green-600">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Avaliação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">4.9</div>
            <p className="text-xs text-gray-600">127 avaliações</p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 12.060</div>
            <p className="text-xs text-green-600">+8% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-rose-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-[#D02E32]">Agenda de Hoje</CardTitle>
            <CardDescription>Terça-feira, 21 de Janeiro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "09:00", client: "Maria Santos", type: "Presencial", status: "Confirmado" },
                { time: "10:30", client: "Carlos Silva", type: "Online", status: "Confirmado" },
                { time: "14:00", client: "Ana Costa", type: "Online", status: "Pendente" },
                { time: "15:30", client: "João Oliveira", type: "Presencial", status: "Confirmado" },
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-[#D02E32]">{appointment.time}</div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <div className="flex items-center space-x-2">
                        {appointment.type === "Online" ? (
                          <Video className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Users className="h-3 w-3 text-green-600" />
                        )}
                        <span className="text-xs text-gray-600">{appointment.type}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      appointment.status === "Confirmado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-[#D02E32]">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova avaliação recebida</p>
                  <p className="text-xs text-gray-600">Maria Santos - 5 estrelas - há 2 horas</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sessão concluída</p>
                  <p className="text-xs text-gray-600">Carlos Silva - Terapia individual - há 3 horas</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Agendamento solicitado</p>
                  <p className="text-xs text-gray-600">Ana Costa - Consulta inicial - há 1 dia</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo cliente cadastrado</p>
                  <p className="text-xs text-gray-600">João Oliveira - há 2 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-[#CBA415] mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold mb-2">Agendar Sessão</h3>
            <p className="text-gray-600 mb-4">Agende uma nova sessão com um cliente</p>
            <Button className="w-full bg-[#D02E32] hover:bg-[#AF2427]">Agendar</Button>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-[#CBA415] mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold mb-2">Mensagens</h3>
            <p className="text-gray-600 mb-4">Verifique mensagens dos clientes</p>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">Ver Mensagens</Button>
          </CardContent>
        </Card>

        <Card className="border-rose-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-[#CBA415] mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold mb-2">Relatórios</h3>
            <p className="text-gray-600 mb-4">Gere relatórios de sessões</p>
            <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white">Ver Relatórios</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ClientsContent() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Meus Clientes</h2>
        <Button className="bg-[#D02E32] hover:bg-[#AF2427]">Adicionar Cliente</Button>
      </div>

      <Card className="border-rose-200 shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie seus clientes e histórico de sessões</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Última Sessão</TableHead>
                <TableHead>Próxima Sessão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: "Maria Santos",
                  email: "maria@email.com",
                  lastSession: "18/01/2025",
                  nextSession: "25/01/2025",
                  status: "Ativo",
                },
                {
                  name: "Carlos Silva",
                  email: "carlos@email.com", 
                  lastSession: "20/01/2025",
                  nextSession: "22/01/2025",
                  status: "Ativo",
                },
                {
                  name: "Ana Costa",
                  email: "ana@email.com",
                  lastSession: "15/01/2025",
                  nextSession: "22/01/2025",
                  status: "Pendente",
                },
              ].map((client, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.lastSession}</TableCell>
                  <TableCell>{client.nextSession}</TableCell>
                  <TableCell>
                    <Badge className={client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Ver</Button>
                      <Button size="sm" className="bg-[#D02E32] hover:bg-[#AF2427]">Agendar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ScheduleContent() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Minha Agenda</h2>
        <Button className="bg-[#D02E32] hover:bg-[#AF2427]">Nova Sessão</Button>
      </div>

      <Card className="border-rose-200 shadow-lg">
        <CardHeader>
          <CardTitle>Próximas Sessões</CardTitle>
          <CardDescription>Visualize e gerencie seus agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Funcionalidade de agenda em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900">Meu Perfil</h2>

      <Card className="border-rose-200 shadow-lg">
        <CardHeader>
          <CardTitle>Informações do Terapeuta</CardTitle>
          <CardDescription>Gerencie suas informações profissionais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Configurações de perfil em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 