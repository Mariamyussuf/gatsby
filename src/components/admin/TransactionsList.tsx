"use client"

import { useEffect, useState } from "react"
import { Box, VStack, HStack, Heading, Text, Input, Button, Spinner, Table } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"

interface Transaction {
  id: string
  reference: string
  primary_first_name: string
  primary_last_name: string
  primary_email: string
  quantity: number
  total_kobo: number
  payment_status: string
  created_at: string
  confirmed_at: string | null
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filtered, setFiltered] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchRef, setSearchRef] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (searchRef.trim()) {
      setFiltered(
        transactions.filter(
          (t) =>
            t.reference.toLowerCase().includes(searchRef.toLowerCase()) ||
            t.primary_email.toLowerCase().includes(searchRef.toLowerCase()) ||
            t.primary_first_name.toLowerCase().includes(searchRef.toLowerCase())
        )
      )
    } else {
      setFiltered(transactions)
    }
  }, [searchRef, transactions])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, reference, primary_first_name, primary_last_name, primary_email, quantity, total_kobo, payment_status, created_at, confirmed_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching transactions:", error)
      } else if (data) {
        setTransactions(data)
      }
    } catch (err) {
      console.error("[v0] Error in TransactionsList:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <VStack justify="center" align="center" minH="300px">
        <Spinner color={COLORS.GOLD_BASE} size="lg" />
        <Text color={COLORS.TEXT}>Loading transactions...</Text>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack>
        <Heading size="lg" color={COLORS.GOLD_BASE}>
          Transactions
        </Heading>
        <Text color={COLORS.TEXT_MUTED} fontSize="sm">
          ({filtered.length} total)
        </Text>
      </HStack>

      <Input
        placeholder="Search by reference, email, or name..."
        value={searchRef}
        onChange={(e) => setSearchRef(e.target.value)}
        bg={COLORS.INPUT_BG}
        color={COLORS.TEXT}
        borderColor={COLORS.ACCENT}
        _placeholder={{ color: COLORS.TEXT_MUTED }}
      />

      <Box overflowX="auto" borderRadius="md" borderColor={COLORS.ACCENT} borderWidth={1}>
        <Table.Root size="sm">
          <Table.Header bg={COLORS.PANEL_DARK}>
            <Table.Row>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Reference
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Name
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Email
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600" textAlign="center">
                Qty
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600" textAlign="right">
                Amount
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Status
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Date
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((t) => (
              <Table.Row key={t.id} _hover={{ bg: `${COLORS.GOLD_BASE}15` }}>
                <Table.Cell color={COLORS.TEXT} fontWeight="500">
                  {t.reference}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT}>
                  {t.primary_first_name} {t.primary_last_name}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT_MUTED} fontSize="xs">
                  {t.primary_email}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT} textAlign="center">
                  {t.quantity}
                </Table.Cell>
                <Table.Cell color={COLORS.GOLD_BRIGHT} fontWeight="500" textAlign="right">
                  NGN {(t.total_kobo / 100).toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color={t.payment_status === "confirmed" ? "#10b981" : "#f59e0b"}
                    textTransform="uppercase"
                  >
                    {t.payment_status}
                  </Text>
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT_MUTED} fontSize="sm">
                  {formatDate(t.created_at)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {filtered.length === 0 && (
        <Text color={COLORS.TEXT_MUTED} textAlign="center" py={8}>
          No transactions found
        </Text>
      )}
    </VStack>
  )
}
