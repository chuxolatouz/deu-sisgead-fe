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
  if (Number.isNaN(numeric)) return 'Bs. 0,00';
  return `Bs. ${numeric.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const resolveDepartment = (project) =>
  asText(
    project?.departamento?.nombre ||
      project?.department?.nombre ||
      project?.departmentName ||
      project?.departamento_nombre
  );

const resolveMembers = (project) => {
  if (!Array.isArray(project?.miembros)) return [];
  return project.miembros.map((member, index) => {
    const user = member?.usuario || member?.user || {};
    const id =
      user?._id?.$oid ||
      user?._id ||
      member?._id?.$oid ||
      member?._id ||
      `member-${index}`;
    return {
      id: String(id),
      nombre: asText(user?.nombre || member?.nombre),
      rol: asText(member?.role?.label || member?.role?.nombre || member?.role),
      fechaIngreso: formatSafeDate(member?.fecha_ingreso, 'dd/MM/yyyy', 'N/A'),
    };
  });
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 30,
    paddingHorizontal: 34,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.4,
  },
  headerBlock: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
  },
  institution: {
    textAlign: 'center',
    fontSize: 10,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
    color: '#4b5563',
  },
  card: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    width: '34%',
    fontWeight: 'bold',
    color: '#111827',
  },
  value: {
    width: '66%',
    color: '#374151',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  paragraph: {
    textAlign: 'justify',
    color: '#1f2937',
  },
  memberRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
    paddingVertical: 4,
  },
  memberName: {
    width: '40%',
  },
  memberRole: {
    width: '35%',
  },
  memberDate: {
    width: '25%',
    textAlign: 'right',
  },
  footer: {
    marginTop: 18,
    textAlign: 'right',
    color: '#4b5563',
  },
});

function StartPDF({ project }) {
  const members = resolveMembers(project);
  const initialAssigned =
    project?.fundingSummary?.totals?.initialAssigned ?? project?.balance_inicial ?? 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={styles.institution}>Universidad Central de Venezuela</Text>
          <Text style={styles.institution}>Facultad de Ciencias - Escuela de Computacion</Text>
          <Text style={styles.institution}>Direccion de Extension Universitaria</Text>
          <Text style={styles.title}>ACTA DE INICIO DE PROYECTO</Text>
          <Text style={styles.subtitle}>
            Documento preliminar para revision administrativa
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Proyecto</Text>
            <Text style={styles.value}>{asText(project?.nombre)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Codigo</Text>
            <Text style={styles.value}>{asText(project?.codigo)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Departamento</Text>
            <Text style={styles.value}>{resolveDepartment(project)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de inicio</Text>
            <Text style={styles.value}>
              {formatSafeDate(project?.fecha_inicio, 'dd/MM/yyyy', 'N/A')}
            </Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Saldo inicial asignado</Text>
            <Text style={styles.value}>{asAmount(initialAssigned)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Descripcion del proyecto</Text>
        <Text style={styles.paragraph}>{asText(project?.descripcion)}</Text>

        <Text style={styles.sectionTitle}>Objetivo general</Text>
        <Text style={styles.paragraph}>{asText(project?.objetivo_general)}</Text>

        <Text style={styles.sectionTitle}>Equipo participante</Text>
        {members.length > 0 ? (
          <View style={styles.card}>
            {members.map((member, index) => (
              <View
                key={member.id}
                style={[
                  styles.memberRow,
                  index === members.length - 1 ? styles.rowLast : null,
                ]}
              >
                <Text style={styles.memberName}>{member.nombre}</Text>
                <Text style={styles.memberRole}>{member.rol}</Text>
                <Text style={styles.memberDate}>{member.fechaIngreso}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>No hay miembros registrados para este proyecto.</Text>
        )}

        <Text style={styles.footer}>
          Caracas, {formatSafeDate(new Date(), 'dd/MM/yyyy', 'N/A')}
        </Text>
      </Page>
    </Document>
  );
}

export default StartPDF;
