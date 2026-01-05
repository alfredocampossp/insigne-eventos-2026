import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Proposal } from '@/types';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Inter',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  companyDetails: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 30,
  },
  clientInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  colDesc: { width: '50%', fontSize: 10 },
  colQty: { width: '15%', fontSize: 10, textAlign: 'center' },
  colPrice: { width: '15%', fontSize: 10, textAlign: 'right' },
  colTotal: { width: '20%', fontSize: 10, textAlign: 'right' },
  
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    marginRight: 10,
    color: '#64748B',
  },
  totalValue: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#1E293B',
  },
  grandTotal: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});

interface ProposalPDFProps {
  proposal: Proposal;
}

export const ProposalPDF = ({ proposal }: ProposalPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>I</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>Insigne Eventos</Text>
          <Text style={styles.companyDetails}>Rua Exemplo, 123 - São Paulo, SP</Text>
          <Text style={styles.companyDetails}>contato@insigne.com.br | (11) 99999-9999</Text>
          <Text style={styles.companyDetails}>CNPJ: 00.000.000/0001-00</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Proposta Comercial</Text>
      <Text style={styles.subtitle}>Ref: {proposal.dealTitle} (v{proposal.version})</Text>

      {/* Client Info */}
      <View style={styles.clientInfo}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.label}>CLIENTE</Text>
            <Text style={styles.value}>{proposal.companyName}</Text>
          </View>
          <View>
            <Text style={styles.label}>A/C</Text>
            <Text style={styles.value}>{proposal.contactName}</Text>
          </View>
          <View>
            <Text style={styles.label}>DATA</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View>
            <Text style={styles.label}>VALIDADE</Text>
            <Text style={styles.value}>
              {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Descrição</Text>
          <Text style={[styles.colQty, { fontWeight: 'bold' }]}>Qtd</Text>
          <Text style={[styles.colPrice, { fontWeight: 'bold' }]}>Valor Unit.</Text>
          <Text style={[styles.colTotal, { fontWeight: 'bold' }]}>Total</Text>
        </View>
        {proposal.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
            </Text>
            <Text style={styles.colTotal}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.subtotal)}
          </Text>
        </View>
        {proposal.taxAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impostos ({proposal.taxRate}%):</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.taxAmount)}
            </Text>
          </View>
        )}
        <View style={[styles.totalRow, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 5 }]}>
          <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL:</Text>
          <Text style={[styles.totalValue, styles.grandTotal]}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total)}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {proposal.notes && (
        <View style={{ marginTop: 40 }}>
          <Text style={[styles.label, { marginBottom: 5 }]}>OBSERVAÇÕES</Text>
          <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
            {proposal.notes}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Insigne Eventos - Transformando momentos em memórias inesquecíveis.</Text>
        <Text>Este documento é confidencial e de propriedade da Insigne Eventos.</Text>
      </View>
    </Page>
  </Document>
);
