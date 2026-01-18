'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Metrics {
  total: number
  casamentos: number
  aniversarios: number
  formaturas: number
  fechados: number
  perdidos: number
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('mes_atual')

  useEffect(() => {
    buscarMetricas()
  }, [periodo])

  async function buscarMetricas() {
    setLoading(true)
    
    let query = supabase
      .from('noah_leads_multi_salao')
      .select('*')
    
    if (periodo === 'mes_atual') {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      query = query.gte('created_at', inicioMes.toISOString())
    } else if (periodo === 'semana_passada') {
      const hoje = new Date()
      const diaAtual = hoje.getDay()
      const inicioSemanaPassada = new Date(hoje)
      inicioSemanaPassada.setDate(hoje.getDate() - diaAtual - 7)
      inicioSemanaPassada.setHours(0, 0, 0, 0)
      
      const fimSemanaPassada = new Date(inicioSemanaPassada)
      fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6)
      fimSemanaPassada.setHours(23, 59, 59, 999)
      
      query = query
        .gte('created_at', inicioSemanaPassada.toISOString())
        .lte('created_at', fimSemanaPassada.toISOString())
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro:', error)
      setLoading(false)
      return
    }
    
    const metricsData: Metrics = {
      total: data.length,
      casamentos: data.filter((l: any) => l.tipo_evento === 'Casamento').length,
      aniversarios: data.filter((l: any) => l.tipo_evento === 'Aniversário').length,
      formaturas: data.filter((l: any) => l.tipo_evento === 'Formatura').length,
      fechados: data.filter((l: any) => l.status === 'Fechado').length,
      perdidos: data.filter((l: any) => l.status?.includes('Perdido')).length,
    }
    
    setMetrics(metricsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Sem dados disponíveis</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard Noah/Vivaro</h1>
        <p className="text-gray-600 mt-2">Métricas e Performance</p>
      </div>

      <div className="mb-6">
        <select 
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 border rounded-lg text-lg"
        >
          <option value="mes_atual">Mês Atual</option>
          <option value="semana_passada">Semana Passada</option>
          <option value="mes_passado">Mês Passado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total de Atendimentos" value={metrics.total} icon="📊" color="blue" />
        <MetricCard title="Fechados" value={metrics.fechados} icon="✅" color="green" />
        <MetricCard title="Perdidos" value={metrics.perdidos} icon="❌" color="red" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Por Tipo de Evento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Casamentos" value={metrics.casamentos} icon="💍" color="purple" />
          <MetricCard title="Aniversários" value={metrics.aniversarios} icon="🎂" color="pink" />
          <MetricCard title="Formaturas" value={metrics.formaturas} icon="🎓" color="indigo" />
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  icon: string
  color: 'blue' | 'green' | 'red' | 'purple' | 'pink' | 'indigo'
function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    red: 'bg-red-600 text-white',
    purple: 'bg-purple-600 text-white',
    pink: 'bg-pink-600 text-white',
    indigo: 'bg-indigo-600 text-white',
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-gray-200 hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-5xl font-extrabold mt-3 text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-2xl p-5 text-5xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-full p-4 text-4xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
