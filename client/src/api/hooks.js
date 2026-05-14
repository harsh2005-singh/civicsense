import { useQuery } from '@tanstack/react-query'
import api from './axios'

export const useBills = () =>
  useQuery({
    queryKey: ['bills'],
    queryFn: () => api.get('/bills').then(r => r.data),
  })

export const useSentiment = (billId) =>
  useQuery({
    queryKey: ['sentiment', billId],
    queryFn: () => api.get(`/analysis/sentiment?billId=${billId}`).then(r => r.data),
    enabled: !!billId,
  })

export const useKeywords = (billId) =>
  useQuery({
    queryKey: ['keywords', billId],
    queryFn: () => api.get(`/analysis/keywords?billId=${billId}`).then(r => r.data),
    enabled: !!billId,
  })

export const useSummary = (billId) =>
  useQuery({
    queryKey: ['summary', billId],
    queryFn: () => api.get(`/analysis/summary?billId=${billId}`).then(r => r.data),
    enabled: !!billId,
  })

export const useComments = (billId) =>
  useQuery({
    queryKey: ['comments', billId],
    queryFn: () => api.get(`/comments?billId=${billId}&limit=100`).then(r => r.data),
    enabled: !!billId,
  })