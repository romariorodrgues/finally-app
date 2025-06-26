import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Database performance logger
export async function logDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  additionalInfo?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now()
  console.log(`🗃️ [DB] Iniciando query: ${queryName}`, additionalInfo || {})
  
  try {
    const result = await queryFn()
    const endTime = Date.now()
    const executionTime = endTime - startTime
    
    console.log(`✅ [DB] Query concluída: ${queryName}`, {
      executionTime: `${executionTime}ms`,
      hasResult: !!result,
      timestamp: new Date().toISOString(),
      ...additionalInfo
    })
    
    return result
  } catch (error) {
    const endTime = Date.now()
    const executionTime = endTime - startTime
    
    console.error(`❌ [DB] Erro na query: ${queryName}`, {
      error,
      executionTime: `${executionTime}ms`,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
      ...additionalInfo
    })
    
    throw error
  }
}

// Connection status logger
export function logConnectionStatus(service: string, isConnected: boolean, details?: Record<string, unknown>) {
  if (isConnected) {
    console.log(`✅ [CONNECTION] ${service} conectado`, details || {})
  } else {
    console.error(`❌ [CONNECTION] ${service} não conectado`, details || {})
  }
}
