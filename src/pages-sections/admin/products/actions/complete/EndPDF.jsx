import React from 'react';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { formatSafeDate } from 'lib';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

const PLACEHOLDER = 'N/A';

const asText = (value, fallback = PLACEHOLDER) => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
};

const asAmount = (value) => {
  let numeric = value;
  if (typeof numeric === 'string') {
    numeric = parseFloat(numeric.replace(',', '.'));
  }
  numeric = Number(numeric);
  if (Number.isNaN(numeric)) numeric = 0;
  return `Bs. ${numeric.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const asKey = (item, fallback) =>
  String(item?.id || item?._id?.$oid || item?._id || fallback);

const normalizeMovements = (movements = []) =>
  (Array.isArray(movements) ? movements : []).map((item, index) => ({
    key: asKey(item, `mov-${index}`),
    date: formatSafeDate(
      item?.occurredAt || item?.createdAt || item?.fecha,
      'dd/MM/yyyy HH:mm',
      'N/A'
    ),
    action: asText(item?.title || item?.type || item?.descripcion),
    account: asText(item?.accountCode),
    actor: asText(item?.actorName || item?.user),
    amount: asAmount(item?.amount || 0),
    balanceAfter: asAmount(item?.projectBalanceAfter || 0),
  }));

const normalizeLogs = (logs = []) =>
  (Array.isArray(logs) ? logs : []).map((item, index) => ({
    key: asKey(item, `log-${index}`),
    date: formatSafeDate(
      item?.fecha_creacion || item?.created_at || item?.fecha,
      'dd/MM/yyyy HH:mm',
      'N/A'
    ),
    message: asText(item?.mensaje || item?.message),
  }));

const normalizeBudgets = (budgets = []) =>
  (Array.isArray(budgets) ? budgets : []).map((item, index) => ({
    key: asKey(item, `budget-${index}`),
    description: asText(item?.descripcion || item?.nombre),
    amount: asAmount(item?.monto_aprobado ?? item?.monto ?? 0),
  }));

const normalizeMembers = (project) =>
  (Array.isArray(project?.miembros) ? project.miembros : []).map((item, index) => {
    const user = item?.usuario || item?.user || {};
    return {
      key: asKey(item, `member-${index}`),
      name: asText(user?.nombre || item?.nombre),
      role: asText(item?.role?.label || item?.role?.nombre || item?.role),
      date: formatSafeDate(item?.fecha_ingreso, 'dd/MM/yyyy', 'N/A'),
    };
  });

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.35,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 10,
    marginBottom: 14,
  },
  institution: {
    textAlign: 'center',
    fontSize: 10,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
    color: '#4b5563',
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  paragraph: {
    textAlign: 'justify',
  },
  card: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 9,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    width: '36%',
    fontWeight: 'bold',
    color: '#111827',
  },
  value: {
    width: '64%',
    color: '#374151',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eef2f7',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  colSmall: {
    width: '16%',
    fontSize: 9,
  },
  colAmount: {
    width: '19%',
    fontSize: 9,
  },
  colMedium: {
    width: '22%',
    fontSize: 9,
  },
  colLarge: {
    width: '62%',
    fontSize: 9,
  },
  colAction: {
    width: '30%',
    fontSize: 9,
  },
  right: {
    textAlign: 'right',
  },
});

function EndPDF({ project, movements = [], logs = [], budgets = [] }) {
  const movementRows = normalizeMovements(movements);
  const logRows = normalizeLogs(logs);
  const budgetRows = normalizeBudgets(budgets);
  const memberRows = normalizeMembers(project);
  const distributionRules = project?.reglas || {};
  const fixedRules = project?.regla_fija?.reglas || [];
  const initialAssigned =
    project?.fundingSummary?.totals?.initialAssigned ?? project?.balance_inicial ?? 0;
  const available =
    project?.fundingSummary?.totals?.currentAvailable ?? project?.balance ?? 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.institution}>Universidad Central de Venezuela</Text>
          <Text style={styles.institution}>Facultad de Ciencias - Escuela de Computacion</Text>
          <Text style={styles.institution}>Direccion de Extension Universitaria</Text>
          <Text style={styles.title}>ACTA DE FINALIZACION DE PROYECTO</Text>
          <Text style={styles.subtitle}>
            Resumen administrativo y financiero del cierre
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Proyecto</Text>
            <Text style={styles.value}>{asText(project?.nombre)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de inicio</Text>
            <Text style={styles.value}>
              {formatSafeDate(project?.fecha_inicio, 'dd/MM/yyyy', 'N/A')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de finalizacion</Text>
            <Text style={styles.value}>
              {formatSafeDate(project?.fecha_fin, 'dd/MM/yyyy', 'N/A')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Saldo inicial asignado</Text>
            <Text style={styles.value}>{asAmount(initialAssigned)}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Disponible al cierre</Text>
            <Text style={styles.value}>{asAmount(available)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Descripcion del proyecto</Text>
        <Text style={styles.paragraph}>{asText(project?.descripcion)}</Text>

        <Text style={styles.sectionTitle}>Reglas de distribucion</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Miembro</Text>
            <Text style={styles.value}>{`${asText(distributionRules?.miembro, '0')} %`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lider</Text>
            <Text style={styles.value}>{`${asText(distributionRules?.lider, '0')} %`}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Coordinador</Text>
            <Text style={styles.value}>{`${asText(distributionRules?.admin, '0')} %`}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reglas fijas</Text>
        {fixedRules.length > 0 ? (
          <View style={styles.card}>
            {fixedRules.map((rule, index) => (
              <View
                key={asKey(rule, `fixed-${index}`)}
                style={[styles.row, index === fixedRules.length - 1 ? styles.rowLast : null]}
              >
                <Text style={styles.label}>{asText(rule?.nombre_regla, 'Regla')}</Text>
                <Text style={styles.value}>{asAmount(rule?.monto)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>No hay reglas fijas registradas.</Text>
        )}

        <Text style={styles.sectionTitle}>Miembros involucrados</Text>
        {memberRows.length > 0 ? (
          <View style={styles.card}>
            {memberRows.map((member, index) => (
              <View
                key={member.key}
                style={[styles.row, index === memberRows.length - 1 ? styles.rowLast : null]}
              >
                <Text style={styles.label}>{member.name}</Text>
                <Text style={styles.value}>{`${member.role} - ${member.date}`}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>No hay miembros registrados.</Text>
        )}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Movimientos monetarios</Text>
        {movementRows.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.colSmall}>Fecha</Text>
              <Text style={styles.colAction}>Accion</Text>
              <Text style={styles.colSmall}>Cuenta</Text>
              <Text style={[styles.colAmount, styles.right]}>Monto</Text>
              <Text style={[styles.colAmount, styles.right]}>Saldo</Text>
            </View>
            {movementRows.map((movement) => (
              <View key={movement.key} style={styles.tableRow}>
                <Text style={styles.colSmall}>{movement.date}</Text>
                <Text style={styles.colAction}>{movement.action}</Text>
                <Text style={styles.colSmall}>{movement.account}</Text>
                <Text style={[styles.colAmount, styles.right]}>{movement.amount}</Text>
                <Text style={[styles.colAmount, styles.right]}>
                  {movement.balanceAfter}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>No hay movimientos monetarios registrados.</Text>
        )}

        <Text style={styles.sectionTitle}>Bitacora del proyecto</Text>
        {logRows.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.colSmall}>Fecha</Text>
              <Text style={styles.colLarge}>Mensaje</Text>
              <Text style={styles.colMedium}>Referencia</Text>
            </View>
            {logRows.map((log) => (
              <View key={log.key} style={styles.tableRow}>
                <Text style={styles.colSmall}>{log.date}</Text>
                <Text style={styles.colLarge}>{log.message}</Text>
                <Text style={styles.colMedium}>{asText(project?.codigo, '-')}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>No hay logs registrados.</Text>
        )}

        <Text style={styles.sectionTitle}>Documentos y actividades asociadas</Text>
        {budgetRows.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={styles.colLarge}>Descripcion</Text>
              <Text style={[styles.colMedium, styles.right]}>Monto</Text>
              <Text style={styles.colSmall}>Tipo</Text>
            </View>
            {budgetRows.map((budget) => (
              <View key={budget.key} style={styles.tableRow}>
                <Text style={styles.colLarge}>{budget.description}</Text>
                <Text style={[styles.colMedium, styles.right]}>{budget.amount}</Text>
                <Text style={styles.colSmall}>Documento</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.paragraph}>No hay actividades asociadas.</Text>
        )}
      </Page>
    </Document>
  );
}

export default EndPDF;
