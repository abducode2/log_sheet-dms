'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable, { ColDef } from '@/components/tables/DataTable'
import Topbar from '@/components/layout/Topbar'

interface Props {
  table: string
  title: string
  sub?: string
  columns: ColDef[]
  statusOptions?: { value: string; label: string }[]
  searchField?: string
}

const PG = 15

export default function GenericSheetClient({
  table, title, sub, columns, statusOptions, searchField = 'description'
}: Props) {
  const supabase = createClient()
  const [data, setData]     = useState<Record<string, unknown>[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order('no', { ascending: true })
      .range((page - 1) * PG, page * PG - 1)

    if (search) query = query.ilike(searchField, `%${search}%`)
    if (status) query = query.eq('status', status)

    const { data: rows, count } = await query
    setData(rows ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, search, status, table, searchField])

  useEffect(() => { fetchData() }, [fetchData])

  async function exportExcel() {
    const { data: all } = await supabase.from(table).select('*').order('no')
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(all ?? [])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title)
    XLSX.writeFile(wb, `${table}_P179.xlsx`)
  }

  return (
    <>
      <Topbar
        title={title}
        sub={`${sub ?? 'HARAJ-IQC-ALRAWAF'} · ${total} سجل`}
       
      />
      <div className="page-content anim">
        <DataTable
          columns={columns}
          data={data}
          total={total}
          page={page}
          pageSize={PG}
          loading={loading}
          onPageChange={setPage}
          onSearch={v => { setSearch(v); setPage(1) }}
          onFilterStatus={statusOptions ? (v => { setStatus(v === 'all' ? '' : v); setPage(1) }) : undefined}
          statusOptions={statusOptions}
          title={title}
        />
      </div>
    </>
  )
}
